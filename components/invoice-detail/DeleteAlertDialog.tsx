import React from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Trash2 } from 'lucide-react'
import { Invoice } from '@/lib/types'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  deleteReason: string
  setDeleteReason: (v: string) => void
  handleDeleteInvoice: () => Promise<void>
  invoice: Invoice
}

export default function DeleteAlertDialog({ open, onOpenChange, deleteReason, setDeleteReason, handleDeleteInvoice, invoice }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Invoice {invoice.number}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove the invoice from your active invoices. The invoice data will be preserved for audit purposes but will no longer be visible in your dashboard.
            {invoice.payments && invoice.payments.length > 0 && " Payment records will be preserved for audit purposes."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="delete-reason" className="text-right">Reason</Label>
            <Textarea id="delete-reason" value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} placeholder="Optional reason for deletion..." className="col-span-3" rows={3} />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => { onOpenChange(false); setDeleteReason('') }}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteInvoice} className="bg-red-600 hover:bg-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Invoice
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
