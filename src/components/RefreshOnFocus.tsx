'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const POLL_MS = 60_000

export function RefreshOnFocus() {
  const router = useRouter()

  useEffect(() => {
    const onFocus = () => router.refresh()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') router.refresh()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh()
    }, POLL_MS)

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
      clearInterval(interval)
    }
  }, [router])

  return null
}
