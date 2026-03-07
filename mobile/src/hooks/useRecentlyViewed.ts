import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'pulsepro:recently_viewed'
const MAX_ITEMS = 8

export interface RecentItem {
  id: string
  type: 'project' | 'task' | 'client'
  name: string
  subtitle?: string
  viewedAt: number
}

let memoryCache: RecentItem[] | null = null

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>(memoryCache ?? [])

  useEffect(() => {
    if (memoryCache) return
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      const parsed = raw ? (JSON.parse(raw) as RecentItem[]) : []
      memoryCache = parsed
      setItems(parsed)
    }).catch(() => {})
  }, [])

  const addItem = useCallback(async (item: Omit<RecentItem, 'viewedAt'>) => {
    const entry: RecentItem = { ...item, viewedAt: Date.now() }
    const filtered = (memoryCache ?? []).filter(i => !(i.id === item.id && i.type === item.type))
    const updated = [entry, ...filtered].slice(0, MAX_ITEMS)
    memoryCache = updated
    setItems(updated)
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {})
  }, [])

  return { items, addItem }
}
