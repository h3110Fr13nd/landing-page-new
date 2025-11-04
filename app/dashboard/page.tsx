 /**
 * Optimized Dashboard Page
 * Uses new unified API, instant skeletons, and progressive loading
 * Target: <200ms initial load, instant page switching
 */

"use client"

import React, { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useFetchOnce } from '@/hooks/use-fetch-once'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { format, isPast, parseISO } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { 
  InstantDashboardSkeleton, 
  ProgressiveLoader 
} from '@/components/instant-skeletons'
import { FadeIn, AnimatedCard, StaggerContainer, StaggerItem, GradientText } from '@/components/dashboard/animated-components'
import DecorativeAccent from '@/components/dashboard/DecorativeAccent'

// Dashboard data interface matching API response
interface DashboardData {
  recentInvoices: Array<{
    id: string
    number: string
    status: string
    total: number
    dueDate: Date
    updatedAt: Date
    customer: {
      displayName: string
    }
  }>
  stats: {
    totalInvoices: number
    totalCustomers: number
    totalEstimates: number
    overdueInvoices: number
    paidInvoices: number
    totalRevenue: number
    pendingRevenue: number
  }
  recentActivity: Array<{
    id: string
    type: 'invoice' | 'customer' | 'estimate'
    action: string
    date: Date
    details: string
  }>
}

const statusColors = {
  DRAFT: 'bg-gray-100/80 text-gray-700 border border-gray-200',
  SENT: 'bg-vibrant-blue/10 text-vibrant-blue border border-vibrant-blue/20',
  APPROVED: 'bg-yellow-100/80 text-yellow-700 border border-yellow-200',
  PAID: 'bg-phthalo-green/10 text-phthalo-green border border-phthalo-green/20',
  OVERDUE: 'bg-red-100/80 text-red-700 border border-red-200',
  'PARTIALLY_PAID': 'bg-orange-100/80 text-orange-700 border border-orange-200'
} as const

export default function DashboardPage() {
  const { user, userProfile, getAuthHeaders } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoized stats cards to prevent unnecessary re-renders
  const statsCards = useMemo(() => {
    if (!dashboardData?.stats) return []

    const { stats } = dashboardData
    
    return [
      {
        title: 'Total Invoices',
        value: stats.totalInvoices,
        icon: FileText,
        gradient: 'from-vibrant-blue to-sky-blue',
        iconBg: 'bg-gradient-to-br from-vibrant-blue/10 to-sky-blue/10',
        iconColor: 'text-vibrant-blue'
      },
      {
        title: 'Customers',
        value: stats.totalCustomers,
        icon: Users,
        gradient: 'from-phthalo-green to-sky-blue',
        iconBg: 'bg-gradient-to-br from-phthalo-green/10 to-sky-blue/10',
        iconColor: 'text-phthalo-green'
      },
      {
        title: 'Revenue',
        value: formatCurrency(stats.totalRevenue, userProfile?.currency || 'USD'),
        icon: DollarSign,
        gradient: 'from-navy-blue to-vibrant-blue',
        iconBg: 'bg-gradient-to-br from-navy-blue/10 to-vibrant-blue/10',
        iconColor: 'text-navy-blue'
      },
      {
        title: 'Pending',
        value: formatCurrency(stats.pendingRevenue, userProfile?.currency || 'USD'),
        icon: TrendingUp,
        gradient: 'from-vibrant-blue to-phthalo-green',
        iconBg: 'bg-gradient-to-br from-vibrant-blue/10 to-phthalo-green/10',
        iconColor: 'text-vibrant-blue'
      }
    ]
  }, [dashboardData?.stats, userProfile?.currency])

  // Fast data fetching with error handling
  const fetchDashboardData = React.useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const headers = await getAuthHeaders()
      const response = await fetch('/api/dashboard', { 
        headers,
        // Add cache busting for development
        cache: process.env.NODE_ENV === 'development' ? 'no-cache' : 'default'
      })

      if (!response.ok) {
        throw new Error(`Dashboard API error: ${response.status}`)
      }

      const data: DashboardData = await response.json()
      setDashboardData(data)

    } catch (error) {
      console.error('Dashboard fetch error:', error)
      setError(error instanceof Error ? error.message : 'Failed to load dashboard')
      
      // Set empty state to prevent complete failure
      setDashboardData({
        recentInvoices: [],
        stats: {
          totalInvoices: 0,
          totalCustomers: 0,
          totalEstimates: 0,
          overdueInvoices: 0,
          paidInvoices: 0,
          totalRevenue: 0,
          pendingRevenue: 0
        },
        recentActivity: []
      })
    } finally {
      setLoading(false)
    }
  }, [user, getAuthHeaders])

  // Fetch data on mount - prevent double fetch in strict mode
  useFetchOnce(fetchDashboardData, [fetchDashboardData])

  // Early return for unauthenticated state
  if (!user) {
    return <InstantDashboardSkeleton />
  }

  // Error state with retry option
  if (error && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl border border-gray-200/50 rounded-xl">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-navy-blue mb-2">Dashboard Unavailable</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={fetchDashboardData}
              className="bg-gradient-to-r from-vibrant-blue to-phthalo-green text-white"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ProgressiveLoader
      loading={loading}
      skeleton={<InstantDashboardSkeleton />}
      minLoadTime={200} // Prevent flash of loading state
    >
      <div className="space-y-6">
        {/* Welcome Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-navy-blue">
                Welcome back{userProfile?.firstName ? `, ` : ''}
                {userProfile?.firstName && (
                  <GradientText variant="primary">{userProfile.firstName}</GradientText>
                )}!
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Here's what's happening with your business today.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild className="bg-gradient-to-r from-vibrant-blue to-phthalo-green hover:from-vibrant-blue/90 hover:to-phthalo-green/90 text-white shadow-md hover:shadow-lg transition-all duration-300">
                <Link href="/dashboard/invoices/new">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">New Invoice</span>
                  <span className="sm:hidden">Invoice</span>
                </Link>
              </Button>
            </div>
          </div>
        </FadeIn>

        {/* Stats Cards */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <StaggerItem key={index}>
                <AnimatedCard className="relative bg-white/70 backdrop-blur-md shadow-lg hover:shadow-xl border border-gray-200/50 rounded-xl overflow-hidden">
                  <DecorativeAccent variant="top-right" color={index % 2 === 0 ? 'blue' : 'green'} />
                  <CardContent className="p-5 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {stat.title}
                        </p>
                        <p className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl ${stat.iconBg} shadow-sm`}>
                        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.iconColor}`} />
                      </div>
                    </div>
                  </CardContent>
                </AnimatedCard>
              </StaggerItem>
            )
          })}
        </StaggerContainer>

        {/* Masonry Grid Layout */}
        <FadeIn delay={0.2} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Invoices - Takes 2 columns on desktop */}
          <AnimatedCard className="lg:col-span-2 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl border border-gray-200/50 rounded-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200/50 pb-4">
              <CardTitle className="text-navy-blue text-lg sm:text-xl">Recent Invoices</CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-vibrant-blue hover:bg-vibrant-blue/10 transition-colors">
                <Link href="/dashboard/invoices">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {dashboardData?.recentInvoices.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <div className="relative inline-block">
                    <FileText className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-30 text-vibrant-blue" />
                    <div className="absolute inset-0 bg-gradient-to-r from-vibrant-blue/20 to-phthalo-green/20 blur-xl" />
                  </div>
                  <p className="text-sm sm:text-base mb-3">No invoices yet</p>
                  <Button asChild className="mt-3 bg-gradient-to-r from-vibrant-blue to-phthalo-green text-white hover:shadow-lg transition-shadow">
                    <Link href="/dashboard/invoices/new">Create Your First Invoice</Link>
                  </Button>
                </div>
              ) : (
                dashboardData?.recentInvoices.map((invoice) => {
                  const isOverdue = isPast(new Date(invoice.dueDate)) && invoice.status !== 'PAID'
                  
                  return (
                    <div key={invoice.id} className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-gray-200/50 hover:bg-gradient-to-r hover:from-sky-blue/10 hover:to-transparent hover:border-vibrant-blue/30 transition-all duration-300 cursor-pointer group">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`p-2 rounded-full flex-shrink-0 ${isOverdue ? 'bg-red-100 group-hover:bg-red-200' : 'bg-gradient-to-br from-vibrant-blue/10 to-phthalo-green/10 group-hover:from-vibrant-blue/20 group-hover:to-phthalo-green/20'} transition-colors`}>
                          {isOverdue ? (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <FileText className="h-4 w-4 text-vibrant-blue" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-navy-blue text-sm sm:text-base truncate">#{invoice.number}</p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{invoice.customer.displayName}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="font-bold text-navy-blue text-sm sm:text-base">{formatCurrency(invoice.total, userProfile?.currency || 'USD')}</p>
                        <Badge className={`text-xs ${statusColors[invoice.status as keyof typeof statusColors] || statusColors.DRAFT}`}>
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </AnimatedCard>

          {/* Quick Actions - Single column on desktop */}
          <AnimatedCard className="bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl border border-gray-200/50 rounded-xl transition-shadow duration-300">
            <CardHeader className="border-b border-gray-200/50 pb-4">
              <CardTitle className="text-navy-blue text-lg sm:text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-1 gap-3 pt-4">
              <Link href="/dashboard/invoices/new" className="group">
                <div className="p-4 rounded-lg border border-vibrant-blue/30 hover:border-vibrant-blue hover:bg-gradient-to-br hover:from-vibrant-blue hover:to-phthalo-green transition-all duration-300 flex items-center lg:justify-center gap-3 lg:flex-col lg:text-center hover:shadow-lg hover:scale-105">
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-vibrant-blue group-hover:text-white transition-colors flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-navy-blue group-hover:text-white transition-colors">New Invoice</span>
                </div>
              </Link>
              <Link href="/dashboard/customers" className="group">
                <div className="p-4 rounded-lg border border-phthalo-green/30 hover:border-phthalo-green hover:bg-gradient-to-br hover:from-phthalo-green hover:to-sky-blue transition-all duration-300 flex items-center lg:justify-center gap-3 lg:flex-col lg:text-center hover:shadow-lg hover:scale-105">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-phthalo-green group-hover:text-white transition-colors flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-navy-blue group-hover:text-white transition-colors">Customers</span>
                </div>
              </Link>
              <Link href="/dashboard/estimates/new" className="group">
                <div className="p-4 rounded-lg border border-sky-blue/50 hover:border-sky-blue hover:bg-gradient-to-br hover:from-sky-blue hover:to-vibrant-blue transition-all duration-300 flex items-center lg:justify-center gap-3 lg:flex-col lg:text-center hover:shadow-lg hover:scale-105">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-vibrant-blue group-hover:text-white transition-colors flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-navy-blue group-hover:text-white transition-colors">Estimate</span>
                </div>
              </Link>
              <Link href="/dashboard/reports" className="group">
                <div className="p-4 rounded-lg border border-vibrant-blue/30 hover:border-vibrant-blue hover:bg-gradient-to-br hover:from-vibrant-blue/90 hover:to-navy-blue transition-all duration-300 flex items-center lg:justify-center gap-3 lg:flex-col lg:text-center hover:shadow-lg hover:scale-105">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-vibrant-blue group-hover:text-white transition-colors flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-navy-blue group-hover:text-white transition-colors">Reports</span>
                </div>
              </Link>
            </CardContent>
          </AnimatedCard>
        </FadeIn>

        {/* Recent Activity - Full width */}
        {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 && (
          <FadeIn delay={0.3}>
            <AnimatedCard className="bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl border border-gray-200/50 rounded-xl transition-shadow duration-300">
              <CardHeader className="border-b border-gray-200/50 pb-4">
                <CardTitle className="text-navy-blue text-lg sm:text-xl">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dashboardData.recentActivity.map((activity, index) => (
                    <div 
                      key={activity.id} 
                      className="flex items-center space-x-3 text-sm p-3 rounded-lg hover:bg-gradient-to-r hover:from-sky-blue/20 hover:to-transparent transition-all duration-300 cursor-pointer group border border-gray-200/30 hover:border-vibrant-blue/30"
                    >
                      <div className="p-1.5 rounded-full bg-gradient-to-br from-vibrant-blue/10 to-phthalo-green/10 group-hover:from-vibrant-blue/20 group-hover:to-phthalo-green/20 transition-colors flex-shrink-0">
                        {activity.type === 'invoice' && <FileText className="h-3.5 w-3.5 text-vibrant-blue" />}
                        {activity.type === 'customer' && <Users className="h-3.5 w-3.5 text-phthalo-green" />}
                        {activity.type === 'estimate' && <FileText className="h-3.5 w-3.5 text-sky-blue" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-navy-blue block truncate">{activity.action}</span>
                        <span className="text-gray-600 text-xs block truncate">{activity.details}</span>
                      </div>
                      <div className="text-xs text-gray-500 flex-shrink-0">
                        {format(new Date(activity.date), 'MMM dd')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </AnimatedCard>
          </FadeIn>
        )}
      </div>
    </ProgressiveLoader>
  )
}