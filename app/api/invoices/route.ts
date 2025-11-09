import { GET as createGET, POST as createPOST } from '@/lib/api-handler'
import { dbOperation, QueryBuilders, serializeInvoice } from '@/lib/db-operations'
import { CacheConfigs } from '@/lib/api-cache'
import { prisma } from '@/lib/prisma'

export const GET = createGET(
  async ({ dbUser, request }) => {
    // Pagination
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 50)
    const offset = parseInt(searchParams.get('offset') || '0') || 0

    const invoices = await dbOperation(
      () => prisma.invoice.findMany({
        ...QueryBuilders.userScoped(prisma.invoice, dbUser!.id),
        include: {
          customer: { select: { id: true, displayName: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      { operationName: 'Fetch invoices' }
    )

    return invoices.map(serializeInvoice)
  },
  { cache: CacheConfigs.USER_DATA }
)

export const POST = createPOST(
  async ({ dbUser, request }) => {
    const data = await request.json()

    if (!data.items || data.items.length === 0) {
      throw Object.assign(new Error('Invoice must have at least one item'), { statusCode: 400 })
    }

    const subtotal = data.items.reduce((sum: number, item: any) => {
      const qty = Number(item.quantity) || 0
      const price = Number(item.rate) || 0
      return sum + (qty * price)
    }, 0)
    const total = subtotal + (Number(data.taxAmount) || 0)

    // Ensure customer exists or create
    let customerId = data.customerId
    let customer: any = null

    if (customerId) {
      // Normalize common shapes: numeric IDs, objects with `id`, etc.
      try {
        if (typeof customerId === 'object' && customerId !== null && 'id' in customerId) {
          // e.g. { id: '...' }
          // @ts-ignore
          customerId = String(customerId.id)
        } else if (typeof customerId !== 'string') {
          customerId = String(customerId)
        }
      } catch (e) {
        // fallback to string conversion
        customerId = String(customerId)
      }

      customer = await prisma.customer.findFirst({ where: { id: customerId, userId: dbUser!.id } })

      // If the provided ID doesn't exist for this user, try to create a customer
      // when name/email were provided (tolerant behavior for some clients). Otherwise
      // return a clear validation error including the id for easier debugging.
      if (!customer) {
        if (data.customerName || data.customerEmail) {
          customer = await prisma.customer.create({ data: { userId: dbUser!.id, displayName: data.customerName || 'Customer', email: data.customerEmail || '' } })
          customerId = customer.id
        } else {
          // Log contextual info to help diagnose ownership/mismatch issues
          try {
            console.error('Invoice create failed - invalid customer', {
              dbUserId: dbUser?.id,
              providedCustomerId: customerId,
              hasCustomerName: Boolean(data.customerName),
              hasCustomerEmail: Boolean(data.customerEmail),
              requestUrl: request?.url
            })
          } catch (e) {
            // ignore logging errors
          }

          throw Object.assign(new Error(`Invalid customer ID or customer does not belong to user (${customerId})`), { statusCode: 400 })
        }
      }
    } else if (data.customerName || data.customerEmail) {
      customer = await prisma.customer.findFirst({ where: { email: data.customerEmail || '', userId: dbUser!.id } })
      if (!customer) {
        customer = await prisma.customer.create({ data: { userId: dbUser!.id, displayName: data.customerName || 'Customer', email: data.customerEmail || '' } })
      }
      customerId = customer.id
    } else {
      try {
        console.error('Invoice create failed - missing customer information', {
          dbUserId: dbUser?.id,
          payload: data,
          requestUrl: request?.url
        })
      } catch (e) {}

      throw Object.assign(new Error('Customer ID or customer information (name/email) is required'), { statusCode: 400 })
    }

    if (!data.invoiceNumber) throw Object.assign(new Error('Invoice number is required'), { statusCode: 400 })

    const invoice = await dbOperation(
      () => prisma.invoice.create({
        data: {
          userId: dbUser!.id,
          customerId,
          number: data.invoiceNumber,
          issueDate: new Date(data.invoiceDate || new Date()),
          dueDate: new Date(data.dueDate || new Date()),
          currency: data.currency || 'USD',
          subtotal: isNaN(subtotal) ? 0 : subtotal,
          taxAmount: Number(data.taxAmount) || 0,
          taxInclusive: Boolean(data.taxInclusive),
          total: isNaN(total) ? 0 : (data.totalAmount || total),
          status: (data.status || 'draft').toUpperCase() as any,
          poNumber: data.poNumber || null,
          notes: data.notes || null,
          items: {
            create: data.items.map((item: any) => ({
              description: item.description || 'Item',
              quantity: Number(item.quantity) || 1,
              unitPrice: Number(item.rate) || 0,
              total: Number(item.amount) || (Number(item.quantity || 1) * Number(item.unitPrice || 0))
            }))
          }
        },
        include: { customer: true, items: true, payments: true }
      }),
      { operationName: 'Create invoice' }
    )

    // Serialize decimals
    // Kick off background PDF generation (fire-and-forget)
    try {
      const { triggerInvoicePdfGeneration } = await import('@/lib/pdf-background')
      // don't await - fire and forget
      ;(async () => {
        try { await triggerInvoicePdfGeneration(invoice.id, dbUser!.id) } catch (e) { console.warn('Background PDF trigger failed', e) }
      })()
    } catch (err) {
      console.warn('Failed to schedule PDF generation', err)
    }

    return serializeInvoice(invoice)
  },
  { cache: false, createUserIfMissing: true }
)