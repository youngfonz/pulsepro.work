'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function RefreshOnFocus() {
  const router = useRouter()

  useEffect(() => {
    const onFocus = () => router.refresh()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') router.refresh()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [router])

  return null
}
