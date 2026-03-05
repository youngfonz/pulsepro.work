'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { CommandBar } from './CommandBar'
import { QuickAdd } from './QuickAdd'

interface LayoutWrapperProps {
  children: React.ReactNode
  clientCount: number
  clerkEnabled?: boolean
  isAdmin?: boolean
  isAuthenticated?: boolean
}

export function LayoutWrapper({ children, clientCount, clerkEnabled = false, isAdmin = false, isAuthenticated = false }: LayoutWrapperProps) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')
  const alwaysMarketing = pathname === '/' || pathname === '/about' || pathname === '/contact' || pathname === '/privacy' || pathname === '/terms' || pathname === '/maintenance' || pathname === '/suspended' || pathname.startsWith('/invoice/')
  const isMarketingPage = alwaysMarketing || (!isAuthenticated && pathname === '/kb')

  if (isAuthPage || isMarketingPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full max-w-full overscroll-none" style={{ touchAction: 'pan-y pinch-zoom' }}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">
        Skip to main content
      </a>
      <Sidebar clientCount={clientCount} clerkEnabled={clerkEnabled} isAdmin={isAdmin} />
      <main id="main-content" className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto overscroll-contain pt-14 md:pt-0">
        <div className="p-4 md:p-6">{children}</div>
      </main>
      <CommandBar />
      <QuickAdd />
    </div>
  )
}
