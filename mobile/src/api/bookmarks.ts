import { apiFetch, GetToken } from './client'
import { Task } from '../types/api'

interface BookmarksResponse { bookmarks: Task[] }

export function fetchBookmarks(getToken: GetToken, filters?: Record<string, string>) {
  const params = new URLSearchParams(filters || {}).toString()
  return apiFetch<BookmarksResponse>(`/bookmarks${params ? `?${params}` : ''}`, getToken)
}
