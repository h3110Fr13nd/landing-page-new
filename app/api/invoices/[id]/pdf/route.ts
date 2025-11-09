import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { fetchBlobAsBuffer } from '@/lib/vercel-blob'
import { triggerInvoicePdfGeneration } from '@/lib/pdf-background'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get user from Supabase auth using server client
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.error('Supabase auth error:', error)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoiceId = id

    // Fetch invoice with relations
    const invoice = await prisma.invoice.findUnique({
      where: { 
        id: invoiceId,
        userId: user.id 
      },
      include: {
        customer: true,
        items: true,
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Fetch user profile
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Convert Decimal fields to numbers for PDF generation
    const invoiceForPDF = {
      ...invoice,
      subtotal: Number(invoice.subtotal),
      taxAmount: Number(invoice.taxAmount),
      total: Number(invoice.total),
      status: invoice.status as any, // Type assertion to match Invoice interface
      poNumber: invoice.poNumber || undefined,
      notes: invoice.notes || undefined,
      terms: invoice.terms || undefined,
      sentAt: invoice.sentAt || undefined,
      sentTo: invoice.sentTo || undefined,
      emailCount: invoice.emailCount || undefined,
      lastEmailSentAt: invoice.lastEmailSentAt || undefined,
      items: invoice.items?.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })) || []
    }

    // If a PDF is already stored in blob, return it. Otherwise enqueue generation and return 202.
    if (invoice.pdfUrl) {
      try {
        const buf = await fetchBlobAsBuffer(invoice.pdfUrl)
        return new NextResponse(buf as BodyInit, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Invoice-${invoice.number}.pdf"`,
            'Content-Length': buf.length.toString(),
          },
        })
      } catch (err) {
        console.error('Failed to fetch stored PDF, will attempt background regen', err)
        // fallthrough to trigger regeneration
      }
    }

    // No PDF yet (or failed to fetch). Trigger background generation and inform client.
    ;(async () => {
      try { await triggerInvoicePdfGeneration(id, user.id) } catch (e) { console.warn('Background PDF trigger failed', e) }
    })()

    return NextResponse.json({ message: 'PDF generation queued. Try again shortly.' }, { status: 202 })

  } catch (error) {
    console.error('Error generating invoice PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice PDF' },
      { status: 500 }
    )
  }
}