const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://www.pulsepro.work/api/v1'

export type GetToken = () => Promise<string | null>

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function apiFetch<T>(
  path: string,
  getToken: GetToken,
  options?: RequestInit
): Promise<T> {
  const token = await getToken()
  if (!token) {
    if (__DEV__) console.log(`[API] No token — user not authenticated. Path: ${path}`)
    throw new AuthError('Not authenticated')
  }

  const url = `${API_BASE}${path}`
  if (__DEV__) console.log(`[API] ${options?.method ?? 'GET'} ${url}`)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
    })

    if (res.status === 401 || res.status === 403) {
      if (__DEV__) console.log(`[API] AUTH ${res.status} ${url}`)
      throw new AuthError('Session expired. Please sign in again.')
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const msg = body.error || `Request failed: ${res.status}`
      if (__DEV__) console.log(`[API] FAIL ${res.status} ${url}: ${msg}`)
      throw new Error(msg)
    }

    const data = await res.json()
    if (__DEV__) console.log(`[API] OK ${res.status} ${url}`)
    return data
  } catch (err: any) {
    if (err.name === 'AbortError') {
      if (__DEV__) console.log(`[API] TIMEOUT ${url}`)
      throw new Error('Request timed out')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}
