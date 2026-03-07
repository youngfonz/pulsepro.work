import { apiFetch, GetToken } from './client'

interface SubscriptionResponse {
  plan: string
  status: string
  usage: {
    projects: { current: number; limit: number }
    tasks: { current: number; limit: number }
    clients: { current: number; limit: number }
  }
}

export function fetchSubscription(getToken: GetToken) {
  return apiFetch<SubscriptionResponse>('/subscription', getToken)
}
