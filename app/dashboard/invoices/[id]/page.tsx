"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Send, 
  Edit, 
  Save, 
  X, 
  DollarSign, 
  CalendarIcon,
  FileText,
  Download,
  Mail,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'
import { cn, formatCurrency as formatCurrencyUtil } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { Invoice, InvoiceStatus } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
// PDF generation now handled via server-side API endpoints
import { EmailTrackingStatus } from '@/components/email-tracking-status'
import Link from 'next/link'
import InvoiceHeader from '@/components/invoice-detail/InvoiceHeader'
import HeaderActions from '@/components/invoice-detail/HeaderActions'
import InvoiceInfo from '@/components/invoice-detail/InvoiceInfo'
import ItemsTable from '@/components/invoice-detail/ItemsTable'
import PaymentHistory from '@/components/invoice-detail/PaymentHistory'
import SidebarSummary from '@/components/invoice-detail/SidebarSummary'
import PaymentModal from '@/components/invoice-detail/PaymentModal'
import EmailModal from '@/components/invoice-detail/EmailModal'
import DeleteAlertDialog from '@/components/invoice-detail/DeleteAlertDialog'

const PAYMENT_METHODS = [
  'Cash',
  'Check',
  'Bank Transfer',
  'Credit Card',
  'Debit Card',
  'PayPal',
  'Stripe',
  'Other'
]

// Map frontend display values to database enum values
const mapPaymentMethodToEnum = (displayMethod: string): string => {
  const mapping: { [key: string]: string } = {
    'Cash': 'CASH',
    'Check': 'CHECK',
    'Bank Transfer': 'BANK_TRANSFER',
    'Credit Card': 'CREDIT_CARD',
    'Debit Card': 'CREDIT_CARD', // Map debit card to credit card enum value
    'PayPal': 'PAYPAL',
    'Stripe': 'STRIPE',
    'Other': 'OTHER'
  }
  return mapping[displayMethod] || displayMethod
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, userProfile, getAuthHeaders } = useAuth()
  const { toast } = useToast()
  
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')
  const [markingPaid, setMarkingPaid] = useState(false)
  
  // Payment form state
  const [paymentDate, setPaymentDate] = useState<Date>(new Date())
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')

  // Edit form state
  const [editForm, setEditForm] = useState({
    invoiceDate: new Date(),
    dueDate: new Date(),
    poNumber: '',
    notes: '',
    paymentInstructions: '',
  })

  // Email form state
  const [emailForm, setEmailForm] = useState({
    recipientEmail: '',
    ccEmails: '',
    message: '',
  })

  useEffect(() => {
    if (user && params.id) {
      fetchInvoice()
    }
  }, [user, params.id])

  const fetchInvoice = async () => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/invoices/${params.id}`, { headers })
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
        setPaymentAmount(data.total.toString())
        // Initialize edit form with current invoice data
        setEditForm({
          invoiceDate: new Date(data.issueDate),
          dueDate: new Date(data.dueDate),
          poNumber: data.poNumber || '',
          notes: data.notes || '',
          paymentInstructions: data.paymentInstructions || '',
        })
        // Initialize email form with customer email
        setEmailForm({
          recipientEmail: data.customer?.email || '',
          ccEmails: data.ccEmails || '',
          message: '',
        })
      } else if (response.status === 404) {
        toast({
          title: "Error",
          description: "Invoice not found",
          variant: "destructive",
        })
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching invoice:', error)
      toast({
        title: "Error",
        description: "Failed to load invoice",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateInvoiceStatus = async (status: InvoiceStatus) => {
    if (!invoice) return

    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setInvoice({ ...invoice, status })
        toast({
          title: "Success",
          description: `Invoice marked as ${status.toLowerCase()}`,
        })
      }
    } catch (error) {
      console.error('Error updating invoice:', error)
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      })
    }
  }

  const recordPayment = async () => {
    if (!invoice || !paymentAmount || !paymentMethod) {
      toast({
        title: "Error",
        description: "Please fill in all payment details",
        variant: "destructive",
      })
      return
    }

    try {
      const amount = parseFloat(paymentAmount)
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/invoices/${invoice.id}/payments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount,
          paymentDate: paymentDate.toISOString(),
          method: mapPaymentMethodToEnum(paymentMethod),
        }),
      })

      if (response.ok) {
        const updatedInvoice = await response.json()
        setInvoice(updatedInvoice)
        setShowPaymentModal(false)
        
        // Show success toast with receipt option
        toast({
          title: "Success",
          description: "Payment recorded successfully",
        })

        // Offer to download receipt
        setTimeout(() => {
          if (confirm('Would you like to download a receipt for this payment?')) {
            downloadReceiptPDF({
              amount,
              paymentDate: paymentDate.toISOString(),
              method: paymentMethod
            })
          }
        }, 500)

        setPaymentAmount('')
        setPaymentMethod('')
        setPaymentDate(new Date())
      }
    } catch (error) {
      console.error('Error recording payment:', error)
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      })
    }
  }

  const markAsPaid = async () => {
    if (!invoice) return

    setMarkingPaid(true)
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/invoices/${invoice.id}/payments`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: invoice.total - getTotalPaid(),
          paymentDate: new Date().toISOString(),
          method: 'OTHER',
        }),
      })

      if (response.ok) {
        const updatedInvoice = await response.json()
        setInvoice(updatedInvoice)
        
        toast({
          title: "Success",
          description: "Invoice marked as paid",
        })
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error)
      toast({
        title: "Error",
        description: "Failed to mark invoice as paid",
        variant: "destructive",
      })
    } finally {
      setMarkingPaid(false)
    }
  }

  const saveEditChanges = async () => {
    if (!invoice) return

    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          issueDate: editForm.invoiceDate.toISOString(),
          dueDate: editForm.dueDate.toISOString(),
          poNumber: editForm.poNumber || null,
          notes: editForm.notes || null,
          paymentInstructions: editForm.paymentInstructions || null,
        }),
      })

      if (response.ok) {
        const updatedInvoice = await response.json()
        setInvoice(updatedInvoice)
        setIsEditing(false)
        toast({
          title: "Success",
          description: "Invoice updated successfully",
        })
      }
    } catch (error) {
      console.error('Error updating invoice:', error)
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      })
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    // Reset form to original values
    if (invoice) {
      setEditForm({
        invoiceDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate),
        poNumber: invoice.poNumber || '',
        notes: invoice.notes || '',
        paymentInstructions: invoice.paymentInstructions || '',
      })
    }
  }

  const downloadInvoicePDF = async () => {
    if (!invoice) return
    
    try {
      toast({
        title: "Generating PDF...",
        description: "Please wait while we generate your invoice PDF",
      })
      
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`, { 
        headers,
        method: 'GET'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `Invoice-${invoice.number}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Success",
          description: "Invoice PDF downloaded successfully",
        })
      } else {
        throw new Error('Failed to generate PDF')
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast({
        title: "Error",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const downloadReceiptPDF = async (payment: { amount: number; paymentDate: string; method: string }) => {
    if (!invoice) return
    
    try {
      toast({
        title: "Generating Receipt...",
        description: "Please wait while we generate your receipt PDF",
      })
      
      // Note: You may want to create a receipt API endpoint similar to the invoice PDF endpoint
      // For now, we'll use a simple approach
      
      toast({
        title: "Info",
        description: "Receipt PDF generation will be available soon",
      })
    } catch (error) {
      console.error('Error generating receipt PDF:', error)
      toast({
        title: "Error",
        description: "Failed to generate receipt PDF",
        variant: "destructive",
      })
    }
  }

  const sendInvoiceEmail = async () => {
    if (!invoice || !emailForm.recipientEmail) {
      toast({
        title: "Error",
        description: "Please enter a recipient email address",
        variant: "destructive",
      })
      return
    }

    // Validate CC emails if provided
    if (emailForm.ccEmails) {
      const ccEmails = emailForm.ccEmails.split(',').map(email => email.trim())
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const invalidEmails = ccEmails.filter(email => !emailRegex.test(email))
      
      if (invalidEmails.length > 0) {
        toast({
          title: "Error",
          description: `Invalid CC email addresses: ${invalidEmails.join(', ')}`,
          variant: "destructive",
        })
        return
      }
    }

    try {
      const headers = await getAuthHeaders()
      const requestBody = {
        recipientEmail: emailForm.recipientEmail,
        ccEmails: emailForm.ccEmails,
        message: emailForm.message,
      }
      
      console.log('Sending email request with body:', requestBody)
      console.log('Request headers:', headers)
      
      const response = await fetch(`/api/invoices/${invoice.id}/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Save CC emails to invoice
        if (emailForm.ccEmails) {
          const updateResponse = await fetch(`/api/invoices/${invoice.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
              ccEmails: emailForm.ccEmails,
            }),
          })
        }
        
        // Refresh invoice data to get updated status
        await fetchInvoice()
        
        setShowEmailModal(false)
        setEmailForm({ recipientEmail: '', ccEmails: '', message: '' })
        
        toast({
          title: "Success",
          description: `Invoice queued for sending to ${result.sentTo}${result.statusUpdated ? ' and status updated to Sent' : ''}. Email will be delivered shortly.`,
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send email')
      }
    } catch (error) {
      console.error('Error sending invoice email:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not send invoice. Please check email address or connection.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: InvoiceStatus) => {
    const statusConfig = {
      [InvoiceStatus.DRAFT]: { label: 'Draft', variant: 'secondary' as const },
      [InvoiceStatus.SENT]: { label: 'Sent', variant: 'default' as const },
      [InvoiceStatus.READ]: { label: 'Read', variant: 'default' as const },
      [InvoiceStatus.APPROVED]: { label: 'Approved', variant: 'default' as const },
      [InvoiceStatus.PAID]: { label: 'Paid', variant: 'default' as const },
      [InvoiceStatus.PARTIALLY_PAID]: { label: 'Partially Paid', variant: 'default' as const },
      [InvoiceStatus.OVERDUE]: { label: 'Overdue', variant: 'destructive' as const },
      [InvoiceStatus.CANCELLED]: { label: 'Cancelled', variant: 'secondary' as const },
    }
    
    const config = statusConfig[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, invoice?.currency || userProfile?.currency || 'USD')
  }

  const getTotalPaid = () => {
    if (!invoice?.payments) return 0
    return invoice.payments.reduce((sum, payment) => sum + payment.amount, 0)
  }

  const getAmountDue = () => {
    if (!invoice) return 0
    return invoice.total - getTotalPaid()
  }



  const canDeleteInvoice = (invoice: Invoice) => {
    // Allow deletion for all statuses (except already deleted). Soft-delete is used server-side.
    return !invoice.deletedAt
  }



  const handleDeleteInvoice = async () => {
    if (!invoice) return

    try {
      const headers = await getAuthHeaders()
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ 
          reason: deleteReason || null,
          confirmWithPayments: true
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setShowDeleteModal(false)
        setDeleteReason('')
        
        toast({
          title: "Success",
          description: `Invoice ${invoice.number} has been deleted${result.hasPaymentsWarning ? '. Payment records are preserved for audit.' : ''}.`,
        })
        
        // Redirect back to dashboard
        router.push('/dashboard')
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to delete invoice",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting invoice:', error)
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container-mobile">
        <div className="animate-pulse space-y-4">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/4"></div>
          <div className="h-48 sm:h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="container-mobile">
        <div className="text-center space-y-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Invoice Not Found</h1>
          <Link href="/dashboard">
            <Button className="touch-target">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-mobile space-y-4 sm:space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        {/* Back button and Invoice Info */}
        <InvoiceHeader invoice={invoice} getStatusBadge={getStatusBadge} />
        
        {/* Action Buttons (moved to component) */}
        <HeaderActions
          invoice={invoice}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          saveEditChanges={saveEditChanges}
          cancelEdit={cancelEdit}
          updateInvoiceStatus={updateInvoiceStatus}
          setShowPaymentModal={setShowPaymentModal}
          setShowEmailModal={setShowEmailModal}
          setShowDeleteModal={setShowDeleteModal}
          downloadInvoicePDF={downloadInvoicePDF}
          getAmountDue={getAmountDue}
          markingPaid={markingPaid}
          markAsPaid={markAsPaid}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Invoice Details Column */}
        <div className="lg:col-span-2 space-y-4">
          <InvoiceInfo invoice={invoice} isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
          <ItemsTable invoice={invoice} />
          <PaymentHistory invoice={invoice} downloadReceiptPDF={downloadReceiptPDF} />
        </div>

        {/* Sidebar */}
        <SidebarSummary invoice={invoice} getTotalPaid={getTotalPaid} getAmountDue={getAmountDue} />
      </div>

      {/* Payment Modal (moved to component) */}
      {showPaymentModal && (
        <PaymentModal
          invoice={invoice}
          paymentDate={paymentDate}
          setPaymentDate={setPaymentDate}
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          PAYMENT_METHODS={PAYMENT_METHODS}
          setShowPaymentModal={setShowPaymentModal}
          recordPayment={recordPayment}
        />
      )}

      {/* Email Modal (moved to component) */}
      {showEmailModal && (
        <EmailModal
          invoice={invoice}
          emailForm={emailForm}
          setEmailForm={setEmailForm}
          sendInvoiceEmail={sendInvoiceEmail}
          setShowEmailModal={setShowEmailModal}
        />
      )}



      {/* Delete Invoice Dialog (moved to component) */}
      <DeleteAlertDialog
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        deleteReason={deleteReason}
        setDeleteReason={setDeleteReason}
        handleDeleteInvoice={handleDeleteInvoice}
        invoice={invoice}
      />
    </div>
  )
}