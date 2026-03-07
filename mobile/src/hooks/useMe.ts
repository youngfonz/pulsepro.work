import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { fetchMe } from '../api/auth'

export function useMe() {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['me'],
    queryFn: () => fetchMe(getToken),
  })
}
