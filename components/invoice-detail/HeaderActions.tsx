import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Save, X, Send, DollarSign, Mail, Download, Trash2 } from 'lucide-react'
import { Invoice, InvoiceStatus } from '@/lib/types'

interface Props {
  invoice: Invoice
  isEditing: boolean
  setIsEditing: (v: boolean) => void
  saveEditChanges: () => Promise<void>
  cancelEdit: () => void
  updateInvoiceStatus: (status: InvoiceStatus) => Promise<void>
  setShowPaymentModal: (v: boolean) => void
  setShowEmailModal: (v: boolean) => void
  setShowDeleteModal: (v: boolean) => void
  downloadInvoicePDF: () => Promise<void>
  getAmountDue: () => number
  markingPaid: boolean
  markAsPaid: () => Promise<void>
}

export default function HeaderActions(props: Props) {
  const {
    invoice,
    isEditing,
    setIsEditing,
    saveEditChanges,
    cancelEdit,
    updateInvoiceStatus,
    setShowPaymentModal,
    setShowEmailModal,
    setShowDeleteModal,
    downloadInvoicePDF,
    getAmountDue,
    markingPaid,
    markAsPaid
  } = props

  return (
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:gap-2">
      {isEditing ? (
        <>
          <Button onClick={saveEditChanges} className="touch-target col-span-1">
            <Save className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Save Changes</span>
            <span className="sm:hidden">Save</span>
          </Button>
          <Button variant="outline" onClick={cancelEdit} className="touch-target col-span-1">
            <X className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Cancel</span>
            <span className="sm:hidden">Cancel</span>
          </Button>
        </>
      ) : (
        <>
          {invoice.status === InvoiceStatus.DRAFT && (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)} className="touch-target col-span-1">
                <Edit className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Edit</span>
                <span className="sm:hidden">Edit</span>
              </Button>
              <Button onClick={() => updateInvoiceStatus(InvoiceStatus.SENT)} className="touch-target col-span-1">
                <Send className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Send Invoice</span>
                <span className="sm:hidden">Send</span>
              </Button>
            </>
          )}

          {[InvoiceStatus.SENT, InvoiceStatus.READ, InvoiceStatus.APPROVED, InvoiceStatus.OVERDUE, InvoiceStatus.PARTIALLY_PAID].includes(invoice.status) && (
            <>
              <Button onClick={() => setShowPaymentModal(true)} className="touch-target col-span-1">
                <DollarSign className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Record Payment</span>
                <span className="sm:hidden">Payment</span>
              </Button>
              {getAmountDue() > 0 && (
                <Button onClick={markAsPaid} disabled={markingPaid} variant="outline" className="touch-target col-span-1">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{markingPaid ? 'Marking...' : 'Mark as Paid'}</span>
                  <span className="sm:hidden">{markingPaid ? '...' : 'Paid'}</span>
                </Button>
              )}
            </>
          )}

          <Button variant="outline" onClick={() => setShowEmailModal(true)} disabled={!invoice.customer?.email} className="touch-target col-span-1">
            <Mail className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Email Invoice</span>
            <span className="sm:hidden">Email</span>
          </Button>

          <Button variant="outline" onClick={downloadInvoicePDF} className="touch-target col-span-1">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>

          {(!invoice.deletedAt) && (
            <Button variant="outline" onClick={() => setShowDeleteModal(true)} className="touch-target col-span-1">
              <Trash2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Delete Invoice</span>
              <span className="sm:hidden">Delete</span>
            </Button>
          )}
        </>
      )}
    </div>
  )
}
