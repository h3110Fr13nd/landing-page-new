import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, X } from 'lucide-react'
import { Invoice } from '@/lib/types'

interface Props {
  invoice: Invoice
  paymentDate: Date
  paymentAmount: string
  setPaymentDate: (d: Date) => void
  setPaymentAmount: (v: string) => void
  paymentMethod: string
  setPaymentMethod: (v: string) => void
  PAYMENT_METHODS: string[]
  setShowPaymentModal: (v: boolean) => void
  recordPayment: () => Promise<void>
}

export default function PaymentModal(props: Props) {
  const { invoice, paymentDate, paymentAmount, setPaymentDate, setPaymentAmount, paymentMethod, setPaymentMethod, PAYMENT_METHODS, setShowPaymentModal, recordPayment } = props

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Record Payment
            <Button variant="ghost" size="sm" onClick={() => setShowPaymentModal(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Payment Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? paymentDate.toDateString() : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={paymentDate} onSelect={(date) => date && setPaymentDate(date)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="paymentAmount">Amount Received</Label>
            <input id="paymentAmount" type="number" step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="0.00" className="input mt-1" />
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="select mt-1 w-full">
              <option value="">Select payment method</option>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="flex space-x-4 pt-3">
            <Button variant="outline" onClick={() => setShowPaymentModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={recordPayment} className="flex-1">Record Payment</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
