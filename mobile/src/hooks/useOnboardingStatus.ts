import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const ONBOARDING_KEY_PREFIX = '@pulsepro:onboarding-complete'

export function useOnboardingStatus(userId: string | undefined) {
  const [isComplete, setIsComplete] = useState<boolean | null>(null)

  useEffect(() => {
    if (!userId) {
      setIsComplete(null)
      return
    }
    AsyncStorage.getItem(`${ONBOARDING_KEY_PREFIX}-${userId}`)
      .then((val) => setIsComplete(val === 'true'))
      .catch(() => setIsComplete(true)) // fail open — don't block the app
  }, [userId])

  const markComplete = useCallback(async () => {
    if (!userId) return
    await AsyncStorage.setItem(`${ONBOARDING_KEY_PREFIX}-${userId}`, 'true')
    setIsComplete(true)
  }, [userId])

  const reset = useCallback(async () => {
    if (!userId) return
    await AsyncStorage.removeItem(`${ONBOARDING_KEY_PREFIX}-${userId}`)
    setIsComplete(false)
  }, [userId])

  return { isComplete, markComplete, reset }
}
