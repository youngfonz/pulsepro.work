import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { fetchSubscription } from '../api/subscription'

export function useSubscription() {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['subscription'],
    queryFn: () => fetchSubscription(getToken),
  })
}
