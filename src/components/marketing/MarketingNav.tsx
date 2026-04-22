'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PulseLogo } from '@/components/PulseLogo'
import { useTheme } from '@/components/ThemeProvider'

export function MarketingNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    const onScroll = () => {
      const top =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0
      setIsScrolled(top > 10)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('scroll', onScroll, { passive: true, capture: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions)
    }
  }, [])

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ]

  // All visual properties computed in JS — no Tailwind for colors/bg
  // Hero flips with theme: white over dark hero (dark mode), black over light hero (light mode)
  const textColor = isScrolled
    ? (isDark ? '#fafafa' : '#1c1c1e')
    : (isDark ? '#ffffff' : '#1c1c1e')

  const headerStyle: React.CSSProperties = {
    transition: 'background-color 0.2s, border-color 0.2s, box-shadow 0.2s',
    backgroundColor: isScrolled
      ? (isDark ? '#1a1a1a' : '#ffffff')
      : 'transparent',
    borderBottom: isScrolled
      ? (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)')
      : '1px solid transparent',
    boxShadow: isScrolled
      ? (isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)')
      : 'none',
  }

  return (
    <>
    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:p-4 focus:bg-background focus:text-foreground focus:border focus:border-border focus:rounded-md focus:top-2 focus:left-2">
      Skip to main content
    </a>
    <header style={headerStyle} className="fixed top-0 w-full z-50 h-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-full">
        <div className="relative flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" style={{ color: textColor }} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <PulseLogo size={32} variant={isDark ? 'dark' : 'light'} />
            <span style={{ color: textColor }} className="text-lg font-semibold font-[family-name:var(--font-display)]">Pulse Pro</span>
          </Link>

          {/* Desktop Navigation — true center */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{ color: textColor }}
                className="text-sm font-medium hover:opacity-70"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              style={{ color: textColor }}
              className={`p-2 rounded-md ${isScrolled ? 'hover:bg-muted' : (isDark ? 'hover:bg-white/10' : 'hover:bg-black/5')}`}
              aria-label="Toggle theme"
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
            <Link
              href="/sign-in"
              style={{ color: textColor }}
              className={`px-4 py-2 text-sm font-medium rounded-md ${isScrolled ? 'hover:bg-muted' : (isDark ? 'hover:bg-white/10' : 'hover:bg-black/5')}`}
              aria-label="Sign in to your Pulse Pro account"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-5 py-1.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-full"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ color: textColor }}
            className={`md:hidden p-2 rounded-md ${isScrolled ? 'hover:bg-muted' : (isDark ? 'hover:bg-white/10' : 'hover:bg-black/5')}`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
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

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden absolute top-12 left-0 right-0 shadow-lg"
            style={{
              backgroundColor: isDark ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <nav className="flex flex-col px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t border-border pt-3 space-y-2">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  {theme === 'dark' ? (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Light mode</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <span>Dark mode</span>
                    </>
                  )}
                </button>
                <Link
                  href="/sign-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full px-4 py-2 text-sm font-medium text-center text-foreground hover:bg-muted rounded-md transition-colors"
                  aria-label="Sign in to your Pulse Pro account"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full px-4 py-2 text-sm font-medium text-center text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
    </>
  )
}
