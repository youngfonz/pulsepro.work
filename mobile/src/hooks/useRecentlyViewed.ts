import { useState, useEffect, useCallback, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY_PREFIX = '@pulsepro:recently-viewed'
const MAX_ITEMS = 8

export interface RecentItem {
  id: string
  type: 'project' | 'task' | 'client'
  name: string
  subtitle?: string
  viewedAt: number
}

let memoryCache: RecentItem[] | null = null
let cachedUserId: string | undefined

function storageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}-${userId}`
}

export function useRecentlyViewed(userId?: string) {
  const [items, setItems] = useState<RecentItem[]>([])

  useEffect(() => {
    if (!userId) {
      setItems([])
      return
    }

    // If user changed, clear the memory cache
    if (cachedUserId !== userId) {
      memoryCache = null
      cachedUserId = userId
    }

    if (memoryCache) {
      setItems(memoryCache)
      return
    }

    AsyncStorage.getItem(storageKey(userId)).then(raw => {
      const parsed = raw ? (JSON.parse(raw) as RecentItem[]) : []
      memoryCache = parsed
      cachedUserId = userId
      setItems(parsed)
    }).catch(() => {})
  }, [userId])

  const addItem = useCallback(async (item: Omit<RecentItem, 'viewedAt'>) => {
    if (!userId) return
    const entry: RecentItem = { ...item, viewedAt: Date.now() }
    const filtered = (memoryCache ?? []).filter(i => !(i.id === item.id && i.type === item.type))
    const updated = [entry, ...filtered].slice(0, MAX_ITEMS)
    memoryCache = updated
    setItems(updated)
    await AsyncStorage.setItem(storageKey(userId), JSON.stringify(updated)).catch(() => {})
  }, [userId])

  return { items, addItem }
}
