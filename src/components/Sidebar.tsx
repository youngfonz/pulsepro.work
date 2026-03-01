'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTheme } from './ThemeProvider'
import { SidebarAuth } from './SidebarAuth'
import { PulseLogo } from './PulseLogo'
import { CommandBarTrigger } from './CommandBar'
import { checkIsAdmin } from '@/actions/admin'

const getNavigation = (clientCount?: number) => [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: 'Bookmarks',
    href: '/bookmarks',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
  {
    name: 'Clients',
    href: '/clients',
    count: clientCount,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    name: 'Invoices',
    href: '/invoices',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
  },
  {
    name: 'Help',
    href: '/kb',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

interface SidebarProps {
  clientCount?: number
  clerkEnabled?: boolean
  isAdmin?: boolean
}

export function Sidebar({ clientCount, clerkEnabled = false, isAdmin: isAdminProp = false }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isAdmin, setIsAdmin] = useState(isAdminProp)
  const { theme, toggleTheme } = useTheme()
  const navigation = getNavigation(clientCount)

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored) setIsCollapsed(stored === 'true')
  }, [])

  // Self-correct admin status after client-side navigation
  useEffect(() => {
    checkIsAdmin().then(setIsAdmin)
  }, [pathname])

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }

  return (
    <>
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 md:hidden">
        <div className="flex items-center gap-2">
          <PulseLogo />
          <span className="text-lg font-bold text-sidebar-foreground">Pulse Pro</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="p-2.5 text-sidebar-foreground hover:bg-secondary rounded-md"
            title="Search (⌘K)"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button
            onClick={toggleTheme}
            className="p-2.5 text-sidebar-foreground hover:bg-secondary rounded-md"
          >
            {theme === 'dark' ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 text-sidebar-foreground hover:bg-secondary rounded-md"
          >
            {isOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'md:w-16' : 'w-56'
        )}
      >
        <div className={cn(
          "flex h-14 md:h-16 items-center",
          isCollapsed ? "justify-center px-3" : "justify-between px-4"
        )}>
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="hidden md:flex p-2 text-sidebar-foreground hover:bg-secondary rounded"
              title="Collapse sidebar"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="flex items-center gap-2">
            {isCollapsed && (
              <button
                onClick={toggleCollapse}
                className="hidden md:flex p-1 text-sidebar-foreground hover:bg-secondary rounded"
                title="Expand sidebar"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            {!isCollapsed && (
              <>
                <PulseLogo />
                <h1 className="text-lg font-bold text-sidebar-foreground">Pulse Pro</h1>
              </>
            )}
          </div>
        </div>
        <div className="px-3 pt-4 pb-2">
          <CommandBarTrigger
            isCollapsed={isCollapsed}
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          />
        </div>
        <nav className="flex-1 overflow-y-auto space-y-1 px-3 pb-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))
            const linkClass = cn(
              'flex items-center gap-2.5 px-3 py-2.5 md:py-1.5 text-sm font-medium transition-colors rounded',
              isActive
                ? 'bg-muted text-foreground'
                : 'text-sidebar-foreground hover:bg-secondary hover:text-secondary-foreground',
              isCollapsed && 'justify-center'
            )
            const linkContent = (
              <>
                {item.icon}
                {!isCollapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {'count' in item && item.count !== undefined && (
                      <span className="text-xs text-muted-foreground">({item.count})</span>
                    )}
                  </>
                )}
              </>
            )
            // Use plain <a> for /kb to force full page load (bypasses client router cache)
            if (item.href === '/kb') {
              return (
                <a key={item.name} href={item.href} onClick={() => setIsOpen(false)} title={isCollapsed ? item.name : undefined} className={linkClass}>
                  {linkContent}
                </a>
              )
            }
            return (
              <Link key={item.name} href={item.href} prefetch={false} onClick={() => setIsOpen(false)} title={isCollapsed ? item.name : undefined} className={linkClass}>
                {linkContent}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className={cn(
          "flex-shrink-0 mb-3 py-2 space-y-1 rounded-lg bg-muted/40",
          isCollapsed ? "mx-2 px-0" : "mx-3 px-0"
        )}>
          <button
            onClick={toggleTheme}
            title={isCollapsed ? (theme === 'dark' ? 'Light mode' : 'Dark mode') : undefined}
            className={cn(
              'flex items-center gap-2.5 w-full px-3 py-1.5 text-sm font-medium text-sidebar-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors rounded',
              isCollapsed && 'justify-center'
            )}
          >
            {theme === 'dark' ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            {!isCollapsed && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
          </button>
          {isAdmin && (
            <Link
              href="/admin"
              prefetch={false}
              onClick={() => setIsOpen(false)}
              title={isCollapsed ? 'Admin' : undefined}
              className={cn(
                'flex items-center gap-2.5 px-3 py-1.5 text-sm font-medium transition-colors rounded',
                pathname.startsWith('/admin')
                  ? 'bg-muted text-foreground'
                  : 'text-sidebar-foreground hover:bg-secondary hover:text-secondary-foreground',
                isCollapsed && 'justify-center'
              )}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {!isCollapsed && <span>Admin</span>}
            </Link>
          )}
          <Link
            href="/settings"
            prefetch={false}
            onClick={() => setIsOpen(false)}
            title={isCollapsed ? 'Settings' : undefined}
            className={cn(
              'flex items-center gap-2.5 px-3 py-1.5 text-sm font-medium transition-colors rounded',
              pathname === '/settings'
                ? 'bg-muted text-foreground'
                : 'text-sidebar-foreground hover:bg-secondary hover:text-secondary-foreground',
              isCollapsed && 'justify-center'
            )}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {!isCollapsed && <span>Settings</span>}
          </Link>

          {/* Auth Section */}
          {clerkEnabled && (
            <SidebarAuth isCollapsed={isCollapsed} />
          )}
        </div>
      </div>
    </>
  )
}
