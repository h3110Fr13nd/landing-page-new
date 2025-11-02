"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Invoice, InvoiceStatus } from '@/lib/types'
import { format } from 'date-fns'

interface Props {
  invoice: Invoice
  getStatusBadge: (status: InvoiceStatus) => React.ReactNode
}

export default function InvoiceHeader({ invoice, getStatusBadge }: Props) {
  return (
    <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
      <Link href="/dashboard">
        <Button variant="outline" size="sm" className="touch-target w-fit">
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span className="hidden xs:inline">Back</span>
        </Button>
      </Link>

      <div>
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Invoice {invoice.number}</h1>
        <div className="flex items-center space-x-3 mt-2">
          {getStatusBadge(invoice.status)}
          <span className="text-xs sm:text-sm text-gray-500">{format(new Date(invoice.createdAt), 'MMM dd, yyyy')}</span>
        </div>
      </div>
    </div>
  )
}
