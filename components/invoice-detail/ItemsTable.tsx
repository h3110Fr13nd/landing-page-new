import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Invoice } from '@/lib/types'
import { formatCurrency as formatCurrencyUtil } from '@/lib/utils'

interface Props {
  invoice: Invoice
}

export default function ItemsTable({ invoice }: Props) {
  const formatCurrency = (amount: number) => formatCurrencyUtil(amount, invoice?.currency || 'USD')

  // Defensive helpers: some payloads may use alternate keys (rate, price, unit_price)
  const resolveUnitPrice = (item: any) => {
    if (item == null) return 0
    const candidates = [item.unitPrice, item.rate, item.price, item.amount, item.unit_price, item.unit_price_amount]
    for (const c of candidates) {
      if (c !== undefined && c !== null && !Number.isNaN(Number(c))) return Number(c)
    }
    return 0
  }

  const resolveItemTotal = (item: any, unitPrice: number) => {
    if (item == null) return 0
    if (item.total !== undefined && item.total !== null && !Number.isNaN(Number(item.total))) return Number(item.total)
    if (item.amount !== undefined && item.amount !== null && !Number.isNaN(Number(item.amount))) return Number(item.amount)
    const qty = Number(item.quantity) || 0
    return qty * (unitPrice || 0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Items</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="w-24">Quantity</TableHead>
              <TableHead className="w-32">Unit Price</TableHead>
              <TableHead className="w-32 text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items?.map((item: any) => {
              const unitPrice = resolveUnitPrice(item)
              const itemTotal = resolveItemTotal(item, unitPrice)

              return (
                <TableRow key={item.id || item._id || JSON.stringify(item)}>
                  <TableCell>{item.description || item.name}</TableCell>
                  <TableCell>{item.quantity ?? 0}</TableCell>
                  <TableCell>{formatCurrency(unitPrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(itemTotal)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <div className="mt-3 space-y-2 border-t pt-3">
          {/* Prefer server-provided subtotal when present; otherwise calculate from items */}
          {(() => {
            const calculatedSubtotal = (invoice.items || []).reduce((sum: number, it: any) => {
              const up = resolveUnitPrice(it)
              const t = resolveItemTotal(it, up)
              return sum + t
            }, 0)

            const displaySubtotal = (invoice.subtotal || 0) > 0 ? Number(invoice.subtotal) : calculatedSubtotal

            return (
              <>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(displaySubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({invoice.taxInclusive ? 'Inclusive' : 'Exclusive'}):</span>
                  <span>{formatCurrency(Number(invoice.taxAmount) || 0)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(Number(invoice.total) || (displaySubtotal + (Number(invoice.taxAmount) || 0)))}</span>
                </div>
              </>
            )
          })()}
        </div>
      </CardContent>
    </Card>
  )
}
