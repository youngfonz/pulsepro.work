import { apiFetch, GetToken } from './client'

export interface Insight {
  id: string
  color: 'red' | 'amber' | 'blue' | 'green'
  message: string
}

interface InsightsResponse {
  insights: Insight[]
}

export function fetchInsights(getToken: GetToken) {
  return apiFetch<InsightsResponse>('/insights', getToken)
}
