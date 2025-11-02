import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download } from 'lucide-react'
import { Invoice } from '@/lib/types'
import { format } from 'date-fns'
import { formatCurrency as formatCurrencyUtil } from '@/lib/utils'

interface Props {
  invoice: Invoice
  downloadReceiptPDF: (payment: { amount: number; paymentDate: string; method: string }) => void
}

export default function PaymentHistory({ invoice, downloadReceiptPDF }: Props) {
  const formatCurrency = (amount: number) => formatCurrencyUtil(amount, invoice?.currency || 'USD')

  if (!invoice.payments || invoice.payments.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-24">Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{payment.paymentMethod}</TableCell>
                <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                <TableCell>
                  <button className="btn-outline" onClick={() => downloadReceiptPDF({ amount: payment.amount, paymentDate: payment.paymentDate.toString(), method: payment.paymentMethod })}>
                    <Download className="w-3 h-3" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
