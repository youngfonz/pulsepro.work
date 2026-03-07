import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { fetchDashboard } from '../api/dashboard'
import { mockDashboard } from '../data/mock'

export function useDashboard() {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetchDashboard(getToken),
    initialData: mockDashboard,
    initialDataUpdatedAt: 0,
  })
}
