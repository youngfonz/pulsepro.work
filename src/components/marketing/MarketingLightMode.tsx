'use client'

import { useEffect } from 'react'

/**
 * Forces the marketing page to light mode.
 * Removes 'dark' class from <html> and clears any stored dark preference.
 * Restores user preference when navigating away to the app.
 */
export function MarketingLightMode() {
  useEffect(() => {
    const html = document.documentElement
    const wasDark = html.classList.contains('dark')
    const storedTheme = localStorage.getItem('theme')

    // Force light mode on marketing page
    html.classList.remove('dark')

    return () => {
      // Restore dark mode when leaving marketing page if it was set
      if (wasDark || storedTheme === 'dark') {
        html.classList.add('dark')
      }
    }
  }, [])

  // Also observe and immediately revert if ThemeProvider re-adds 'dark'
  useEffect(() => {
    const html = document.documentElement
    const observer = new MutationObserver(() => {
      if (html.classList.contains('dark')) {
        html.classList.remove('dark')
      }
    })
    observer.observe(html, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return null
}
