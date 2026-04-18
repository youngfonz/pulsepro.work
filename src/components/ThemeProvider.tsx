'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const MARKETING_PATHS = new Set([
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/maintenance',
  '/suspended',
])

function isMarketingPath(pathname: string): boolean {
  return MARKETING_PATHS.has(pathname) || pathname.startsWith('/invoice/')
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored) {
      setTheme(stored)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    const html = document.documentElement
    // Marketing pages always render in light mode; preserve user preference in localStorage
    if (isMarketingPath(pathname)) {
      html.classList.remove('dark')
    } else {
      html.classList.toggle('dark', theme === 'dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme, mounted, pathname])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
