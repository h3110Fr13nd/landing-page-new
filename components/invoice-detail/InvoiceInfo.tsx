import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn, formatCurrency as formatCurrencyUtil } from '@/lib/utils'
import { Invoice } from '@/lib/types'

interface Props {
  invoice: Invoice
  isEditing: boolean
  editForm: any
  setEditForm: (v: any) => void
}

export default function InvoiceInfo({ invoice, isEditing, editForm, setEditForm }: Props) {
  const formatCurrency = (amount: number) => formatCurrencyUtil(amount, invoice?.currency || 'USD')

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Invoice Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium text-gray-600">Customer</Label>
              <p className="mt-1">{invoice.customer?.displayName}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600">Invoice Date</Label>
              {isEditing ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !editForm.invoiceDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editForm.invoiceDate ? format(editForm.invoiceDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={editForm.invoiceDate} onSelect={(date) => date && setEditForm((prev: any) => ({ ...prev, invoiceDate: date }))} initialFocus />
                  </PopoverContent>
                </Popover>
              ) : (
                <p className="mt-1">{format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600">Due Date</Label>
              {isEditing ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !editForm.dueDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editForm.dueDate ? format(editForm.dueDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={editForm.dueDate} onSelect={(date) => date && setEditForm((prev: any) => ({ ...prev, dueDate: date }))} disabled={(date) => date < new Date()} initialFocus />
                  </PopoverContent>
                </Popover>
              ) : (
                <p className="mt-1">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600">Currency</Label>
              <p className="mt-1">{invoice.currency}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600">PO Number</Label>
              {isEditing ? (
                <input value={editForm.poNumber} onChange={(e) => setEditForm((prev: any) => ({ ...prev, poNumber: e.target.value }))} placeholder="Optional" className="mt-1 input" />
              ) : (
                <p className="mt-1">{invoice.poNumber || 'N/A'}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-600">Notes</Label>
            {isEditing ? (
              <textarea value={editForm.notes} onChange={(e) => setEditForm((prev: any) => ({ ...prev, notes: e.target.value }))} placeholder="Optional notes for the customer" rows={3} className="mt-1 textarea" />
            ) : (
              <p className="mt-1 text-sm">{invoice.notes || 'No notes'}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-600">Payment Instructions</Label>
            {isEditing ? (
              <textarea value={editForm.paymentInstructions} onChange={(e) => setEditForm((prev: any) => ({ ...prev, paymentInstructions: e.target.value }))} placeholder="e.g., Bank account details, payment terms, etc." rows={3} className="mt-1 textarea" />
            ) : (
              <p className="mt-1 text-sm">{invoice.paymentInstructions || 'No payment instructions'}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
