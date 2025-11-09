import { prisma } from './prisma'
import { generateInvoicePDF } from './pdf-generator-fast'
import { uploadPdfBlob, deleteBlobByUrl, buildInvoiceBlobFilename } from './vercel-blob'

// Simple in-memory debounce and run-queue for invoice PDF generation.
// Coalesces rapid triggers and ensures at-most-one active generation per invoice.
declare global {
  var __invoicePdfDebounce: Map<string, NodeJS.Timeout>
  var __invoicePdfRunning: Set<string>
  var __invoicePdfPending: Set<string>
}

if (!global.__invoicePdfDebounce) global.__invoicePdfDebounce = new Map()
if (!global.__invoicePdfRunning) global.__invoicePdfRunning = new Set()
if (!global.__invoicePdfPending) global.__invoicePdfPending = new Set()

const DEBOUNCE_MS = 800 // coalesce rapid updates

export async function triggerInvoicePdfGeneration(invoiceId: string, userId: string) {
  // Clear existing debounce timer and set a new one
  const existing = global.__invoicePdfDebounce.get(invoiceId)
  if (existing) clearTimeout(existing)

  const timer = setTimeout(async () => {
    global.__invoicePdfDebounce.delete(invoiceId)

    // If already running, mark pending and return – will run after current finishes
    if (global.__invoicePdfRunning.has(invoiceId)) {
      global.__invoicePdfPending.add(invoiceId)
      return
    }

    // Run generation
    await runGenerateAndUpload(invoiceId, userId)

    // If another trigger was requested while running, run once more to pick up latest changes
    if (global.__invoicePdfPending.has(invoiceId)) {
      global.__invoicePdfPending.delete(invoiceId)
      // small delay to let DB settle
      setTimeout(() => triggerInvoicePdfGeneration(invoiceId, userId), 200)
    }
  }, DEBOUNCE_MS)

  global.__invoicePdfDebounce.set(invoiceId, timer)
}

async function runGenerateAndUpload(invoiceId: string, userId: string) {
  global.__invoicePdfRunning.add(invoiceId)
  try {
    // Fetch fresh invoice and user profile
    const [invoice, user] = await Promise.all([
      prisma.invoice.findUnique({ where: { id: invoiceId }, include: { items: true, customer: true } }),
      prisma.user.findUnique({ where: { id: userId } })
    ])

    if (!invoice || !user) {
      console.warn('PDF generation skipped - missing invoice or user', invoiceId, userId)
      return
    }

    const businessInfo = {
      name: user.businessName || user.displayName || user.username || undefined,
      address: [user.address, user.city, user.state, user.zipCode, user.country].filter(Boolean).join(', ') || undefined,
      phone: user.phone || undefined,
      email: user.email || undefined,
      logo: user.logoUrl || user.aiLogoUrl || undefined,
      taxId: user.businessRegNumber || undefined,
      invoiceColorScheme: user.invoiceColorScheme || 'blue'
    }

    const invoiceForPDF = {
      ...invoice,
      subtotal: Number(invoice.subtotal),
      taxAmount: Number(invoice.taxAmount),
      total: Number(invoice.total),
      items: invoice.items?.map(i => ({ ...i, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice), total: Number(i.total) })) || []
    }

    // Delete existing blob if present
    if (invoice.pdfUrl) {
      try { await deleteBlobByUrl(invoice.pdfUrl) } catch (e) { console.warn('Failed to delete existing invoice pdf', e) }
    }

    // Generate PDF buffer
    const pdfBuffer = await generateInvoicePDF(invoiceForPDF as any, businessInfo as any)

    // Upload to vercel blob
    const filename = buildInvoiceBlobFilename(userId, invoiceId)
    const blobUrl = await uploadPdfBlob(filename, pdfBuffer)

    // Update invoice record with blob URL
    await prisma.invoice.update({ where: { id: invoiceId }, data: { pdfUrl: blobUrl } })

    console.log('Invoice PDF generated and uploaded for', invoiceId)
  } catch (err) {
    console.error('Invoice PDF generation failed for', invoiceId, err)
  } finally {
    global.__invoicePdfRunning.delete(invoiceId)
  }
}

export default { triggerInvoicePdfGeneration }
