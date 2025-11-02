import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Invoice } from '@/lib/types'
import { formatCurrency as formatCurrencyUtil } from '@/lib/utils'
import { EmailTrackingStatus } from '@/components/email-tracking-status'

interface Props {
  invoice: Invoice
  getTotalPaid: () => number
  getAmountDue: () => number
}

export default function SidebarSummary({ invoice, getTotalPaid, getAmountDue }: Props) {
  const formatCurrency = (amount: number) => formatCurrencyUtil(amount, invoice?.currency || 'USD')

  return (
    <div className="lg:col-span-1 space-y-4">
      <Card className="sticky top-4 mb-4">
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Amount:</span>
              <span className="font-medium">{formatCurrency(invoice.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Amount Paid:</span>
              <span className="font-medium text-green-600">{formatCurrency(getTotalPaid())}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="font-semibold">Amount Due:</span>
                <span className="font-bold text-lg text-red-600">{formatCurrency(getAmountDue())}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t">
            <h4 className="font-medium mb-2">Customer Details:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{invoice.customer?.displayName}</p>
              {invoice.customer?.email && <p>{invoice.customer.email}</p>}
              {invoice.customer?.phone && <p>{invoice.customer.phone}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <EmailTrackingStatus invoice={invoice} />
    </div>
  )
}
