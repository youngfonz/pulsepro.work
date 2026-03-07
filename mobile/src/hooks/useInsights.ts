import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { fetchInsights } from '../api/insights'

export function useInsights() {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['insights'],
    queryFn: () => fetchInsights(getToken),
  })
}
