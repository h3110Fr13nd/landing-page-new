/**
 * Simple Invoice List Page - Working Version
 * Basic functionality without complex imports
 */

"use client"

import React, { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useFetchOnce } from '@/hooks/use-fetch-once'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Plus, Eye, Edit, Download, Mail, FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { FadeIn, AnimatedCard, GradientText, SlideIn } from '@/components/dashboard/animated-components'

// Types
interface Invoice {
  id: string
  number: string
  status: string
  issueDate: string
  dueDate: string
  total: number
  customer: {
    id: string
    displayName: string
  }
}

const statusColors = {
  draft: 'bg-gray-100/80 text-gray-700 border border-gray-200',
  sent: 'bg-vibrant-blue/10 text-vibrant-blue border border-vibrant-blue/20',
  approved: 'bg-yellow-100/80 text-yellow-700 border border-yellow-200',
  paid: 'bg-phthalo-green/10 text-phthalo-green border border-phthalo-green/20',
  overdue: 'bg-red-100/80 text-red-700 border border-red-200',
  'partially-paid': 'bg-orange-100/80 text-orange-700 border border-orange-200'
}

/**
 * Simple Invoice List Skeleton
 */
function SimpleInvoiceListSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Search and filters */}
      <div className="flex gap-4">
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Invoice cards */}
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-4">
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function InvoicesPage() {
  const { user, getAuthHeaders } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  /**
   * Load invoices with error handling
   */
  const loadInvoices = useCallback(async () => {
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/invoices?limit=50', { 
        headers,
        cache: 'no-cache'
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      setInvoices(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load invoices:', error)
      setInvoices([]) // Set empty array on error
    } finally {
      setIsLoading(false)
    }
  }, [getAuthHeaders])

  // Load invoices on mount - prevent double fetch in strict mode
  useFetchOnce(loadInvoices, [loadInvoices])

  /**
   * Filter invoices with useMemo
   */
  const filteredInvoices = useMemo(() => {
    let filtered = invoices

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(invoice => 
        (invoice.number || '').toLowerCase().includes(searchLower) ||
        (invoice.customer?.displayName || '').toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter)
    }

    return filtered
  }, [invoices, searchTerm, statusFilter])

  /**
   * Get status badge color
   */
  const getStatusColor = useCallback((status: string) => {
    return statusColors[status as keyof typeof statusColors] || statusColors.draft
  }, [])

  /**
   * Format date safely
   */
  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy')
    } catch {
      return 'Invalid date'
    }
  }, [])

  // Show loading state
  if (isLoading) {
    return <SimpleInvoiceListSkeleton />
  }

  // Main content
  return (
    <FadeIn className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            <GradientText variant="primary">Invoices</GradientText>
          </h1>
          <p className="text-gray-600 mt-1">{filteredInvoices.length} invoices found</p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button className="bg-gradient-to-r from-vibrant-blue to-phthalo-green hover:from-vibrant-blue/90 hover:to-phthalo-green/90 text-white shadow-md hover:shadow-lg transition-all">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-vibrant-blue" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200/50 focus:border-vibrant-blue/50 focus:ring-vibrant-blue/20"
          />
        </div>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200/50 rounded-md bg-white/80 backdrop-blur-sm text-navy-blue focus:border-vibrant-blue/50 focus:ring-2 focus:ring-vibrant-blue/20 outline-none transition-all"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Invoice List */}
      <div className="space-y-4">
        {filteredInvoices.length === 0 ? (
          <AnimatedCard className="bg-white/80 backdrop-blur-md shadow-lg border border-gray-200/50 rounded-xl">
            <CardContent className="p-8 text-center">
              <div className="relative inline-block mb-4">
                <FileText className="w-16 h-16 mx-auto text-vibrant-blue opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-r from-vibrant-blue/20 to-phthalo-green/20 blur-xl" />
              </div>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No invoices match your filters' 
                  : 'No invoices found. Create your first invoice to get started.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link href="/dashboard/invoices/new" className="mt-4 inline-block">
                  <Button className="bg-gradient-to-r from-vibrant-blue to-phthalo-green text-white hover:shadow-lg transition-shadow">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </Link>
              )}
            </CardContent>
          </AnimatedCard>
        ) : (
          filteredInvoices.map((invoice, index) => (
            <SlideIn key={invoice.id} delay={index * 0.05} direction="up">
              <AnimatedCard className="bg-white/80 backdrop-blur-md shadow-md hover:shadow-xl border border-gray-200/50 rounded-xl transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold text-navy-blue">{invoice.number || 'No Number'}</h3>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status || 'draft'}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {invoice.customer?.displayName || 'No Customer'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span>Due: {invoice.dueDate ? formatDate(invoice.dueDate) : 'No due date'}</span>
                        <span className="font-bold bg-gradient-to-r from-navy-blue to-vibrant-blue bg-clip-text text-transparent">
                          {formatCurrency(invoice.total || 0)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/dashboard/invoices/${invoice.id}`}>
                        <Button size="sm" variant="outline" title="View Invoice" className="border-vibrant-blue/30 hover:bg-vibrant-blue/10 hover:border-vibrant-blue/50">
                          <Eye className="h-4 w-4 text-vibrant-blue" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                        <Button size="sm" variant="outline" title="Edit Invoice" className="border-phthalo-green/30 hover:bg-phthalo-green/10 hover:border-phthalo-green/50">
                          <Edit className="h-4 w-4 text-phthalo-green" />
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="outline"
                        title="Download PDF"
                        onClick={() => {
                          window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')
                        }}
                        className="border-sky-blue/50 hover:bg-sky-blue/20 hover:border-sky-blue"
                      >
                        <Download className="h-4 w-4 text-vibrant-blue" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        title="Send Email"
                        onClick={() => {
                          console.log('Send email for invoice:', invoice.id)
                        }}
                        className="border-vibrant-blue/30 hover:bg-vibrant-blue/10 hover:border-vibrant-blue/50"
                      >
                        <Mail className="h-4 w-4 text-vibrant-blue" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            </SlideIn>
          ))
        )}
      </div>

      {/* Refresh button for debugging */}
      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={loadInvoices} disabled={isLoading} className="border-vibrant-blue/30 hover:bg-vibrant-blue/10 hover:border-vibrant-blue/50">
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>
    </FadeIn>
  )
}