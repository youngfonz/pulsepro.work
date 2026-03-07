import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { fetchBookmarks } from '../api/bookmarks'

export function useBookmarks(filters?: Record<string, string>) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['bookmarks', filters],
    queryFn: () => fetchBookmarks(getToken, filters),
  })
}
