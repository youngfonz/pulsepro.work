const API_BASE = 'https://pulsepro.work/api/v1'

export type GetToken = () => Promise<string | null>

export async function apiFetch<T>(
  path: string,
  getToken: GetToken,
  options?: RequestInit
): Promise<T> {
  const token = await getToken()
  if (!token) throw new Error('Not authenticated')

  const url = `${API_BASE}${path}`
  console.log(`[API] ${options?.method ?? 'GET'} ${url}`)

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

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const msg = body.error || `Request failed: ${res.status}`
      console.log(`[API] FAIL ${res.status} ${url}: ${msg}`)
      throw new Error(msg)
    }

    const data = await res.json()
    console.log(`[API] OK ${res.status} ${url}`)
    return data
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.log(`[API] TIMEOUT ${url}`)
      throw new Error('Request timed out')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}
