'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PulseLogo } from '@/components/PulseLogo'
import { useTheme } from '@/components/ThemeProvider'
import { cn } from '@/lib/utils'

export function MarketingNav() {
  const [isScrolled, setIsScrolled] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  // Inline style for nav text — Tailwind classes were not rendering in production
  const isDark = theme === 'dark'
  const navColor = isScrolled ? (isDark ? '#fafafa' : '#0a0a0a') : '#ffffff'
  const textStyle = { color: navColor }
  const hoverBg = isScrolled ? 'hover:bg-muted' : 'hover:bg-white/10'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    handleScroll() // Check initial position (e.g. page refreshed mid-scroll)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <>
    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:p-4 focus:bg-background focus:text-foreground focus:border focus:border-border focus:rounded-md focus:top-2 focus:left-2">
      Skip to main content
    </a>
    <header
      className={cn(
        'fixed top-0 w-full z-50 h-12 transition-all duration-300',
        isScrolled
          ? (isDark
              ? 'bg-[#09090b]/95 backdrop-blur-xl backdrop-saturate-[180%] border-b border-white/10 shadow-sm'
              : 'bg-white/95 backdrop-blur-xl backdrop-saturate-[180%] border-b border-black/5 shadow-sm')
          : 'bg-transparent'
      )}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-full">
        <div className="relative flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <PulseLogo size={32} variant={isScrolled ? 'light' : 'dark'} />
            <span className="text-lg font-semibold font-[family-name:var(--font-display)]" style={textStyle}>Pulse Pro</span>
          </Link>

          {/* Desktop Navigation — true center */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors hover:opacity-70"
                style={textStyle}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={cn('p-2 rounded-md transition-colors', hoverBg)}
              style={textStyle}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
            <Link
              href="/sign-in"
              className={cn('px-4 py-2 text-sm font-medium rounded-md transition-colors', hoverBg)}
              style={textStyle}
              aria-label="Sign in to your Pulse Pro account"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-5 py-1.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn('md:hidden p-2 rounded-md transition-colors', hoverBg)}
            style={textStyle}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-12 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg">
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
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <span>Light mode</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
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
