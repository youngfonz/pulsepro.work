import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { fetchCalendarTasks } from '../api/calendar'
import { mockTasks } from '../data/mock'

export function useCalendar(year: number, month: number) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['calendar', year, month],
    queryFn: () => fetchCalendarTasks(getToken, year, month),
    initialData: { tasks: mockTasks },
    initialDataUpdatedAt: 0,
  })
}
