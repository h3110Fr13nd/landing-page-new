"use client"

import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/lib/auth-context'
import {
  LayoutDashboard,
  Users,
  FileText,
  Calculator,
  Plus,
  Settings,
  LogOut,
  Mic,
  Menu,
  Activity,
  BarChart3,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, lazy, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import DashboardBackground from '@/components/dashboard/DashboardBackground'
import { motion } from 'framer-motion'

// Lazy load heavy components
const AiChatbot = lazy(() => import('@/components/ai-chatbot').then(mod => ({ default: mod.AiChatbot })))
const TutorialProvider = lazy(() => import('@/components/tutorial-provider').then(mod => ({ default: mod.TutorialProvider })))

// Loading fallback for lazy components
const ChatbotFallback = () => null // Chatbot hidden initially, no need to show loader
const TutorialFallback = () => <>{/* Tutorial provider has no UI */}</>

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { signOut, userProfile, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Invoices', href: '/dashboard/invoices', icon: FileText },
    { name: 'Estimates', href: '/dashboard/estimates', icon: Calculator },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]


  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link 
            key={item.name} 
            href={item.href}
            prefetch={true}
            onClick={() => mobile && setIsOpen(false)}
          >
            <motion.div 
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
              isActive
                ? 'bg-gradient-to-r from-vibrant-blue/10 to-phthalo-green/10 text-vibrant-blue border border-vibrant-blue/20 shadow-sm'
                : 'text-gray-600 hover:bg-sky-blue/20 hover:text-navy-blue'
            } ${mobile ? 'py-3 text-base' : ''}`}>
              <item.icon className={`mr-3 h-4 w-4 flex-shrink-0 ${
                isActive ? 'text-vibrant-blue' : 'text-gray-400 group-hover:text-vibrant-blue'
              }`} />
              {item.name}
            </motion.div>
          </Link>
        )
      })}
    </>
  )

  const ActionButtons = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <div className={`mt-2.5 ${mobile ? 'mt-4' : ''}`}>
        <Link href="/dashboard/invoices/new" prefetch={true} onClick={() => mobile && setIsOpen(false)}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button className="w-full text-sm py-2 h-9 bg-gradient-to-r from-vibrant-blue to-phthalo-green hover:from-vibrant-blue/90 hover:to-phthalo-green/90 text-white shadow-md hover:shadow-lg transition-shadow">
              <Plus className="w-4 h-4 mr-2" />
              New Invoice
            </Button>
          </motion.div>
        </Link>
      </div>
      <div className="mt-2.5">
        <Link href="/dashboard/invoices/voice" prefetch={true} onClick={() => mobile && setIsOpen(false)}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="outline" className="w-full text-sm py-2 h-9 border-vibrant-blue/30 text-vibrant-blue hover:bg-vibrant-blue/10 hover:border-vibrant-blue/50 transition-all">
              <Mic className="w-4 h-4 mr-2" />
              Voice Invoice
            </Button>
          </motion.div>
        </Link>
      </div>
    </>
  )

  const UserProfile = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex border-t border-gray-200/50 p-3 bg-gradient-to-br from-sky-blue/10 to-transparent ${mobile ? 'mt-4' : ''}`}>
      <div className="flex items-center w-full">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy-blue truncate">
            {userProfile?.displayName || userProfile?.username || user?.email?.split('@')[0] || 'User'}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {userProfile?.email || user?.email || ''}
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleSignOut()
              mobile && setIsOpen(false)
            }}
            className="ml-2 h-8 w-8 p-0 text-gray-500 hover:text-vibrant-blue hover:bg-vibrant-blue/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  )

  return (
    <ProtectedRoute>
      <Suspense fallback={<TutorialFallback />}>
        <TutorialProvider>
        <div className="min-h-screen relative">
        {/* Animated background */}
        <DashboardBackground />
        
        {/* Mobile Header */}
        <div className="lg:hidden relative z-10">
          <div className="flex items-center justify-between p-4 bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-200/50">
            <h1 className="text-xl font-bold bg-gradient-to-r from-navy-blue via-vibrant-blue to-phthalo-green bg-clip-text text-transparent">
              Invoice Easy
            </h1>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden touch-target hover:bg-vibrant-blue/10"
                >
                  <Menu className="h-6 w-6 text-navy-blue" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-white/98 backdrop-blur-sm">
                <SheetHeader className="p-4 border-b border-gray-200/50">
                  <SheetTitle className="text-left bg-gradient-to-r from-navy-blue via-vibrant-blue to-phthalo-green bg-clip-text text-transparent">
                    Invoice Easy
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  <nav className="flex-1 px-3 py-3 space-y-1">
                    <NavLinks mobile />
                  </nav>
                  <div className="px-3">
                    <ActionButtons mobile />
                  </div>
                  <UserProfile mobile />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="lg:flex">
          {/* Desktop Sidebar */}
          <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-10">
            <div className="flex flex-col flex-grow pt-5 bg-white/95 backdrop-blur-md shadow-xl border-r border-gray-200/50">
              <div className="flex items-center flex-shrink-0 px-4 pb-4 border-b border-gray-200/50">
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl font-bold bg-gradient-to-r from-navy-blue via-vibrant-blue to-phthalo-green bg-clip-text text-transparent"
                >
                  Invoice Easy
                </motion.h1>
              </div>
              
              <div className="mt-5 flex-grow flex flex-col">
                <nav className="flex-1 px-3 space-y-1">
                  <NavLinks />
                </nav>
                
                <div className="flex-shrink-0 p-3">
                  <ActionButtons />
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <UserProfile />
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:ml-64 flex flex-col flex-1 min-h-screen max-w-full overflow-x-hidden relative z-10">
            <main className="flex-1 mobile-padding lg:p-8 min-w-0 max-w-full overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>

        {/* AI Chatbot */}
        <Suspense fallback={<ChatbotFallback />}>
          <AiChatbot />
        </Suspense>
        </div>
        </TutorialProvider>
      </Suspense>
    </ProtectedRoute>
  )
}