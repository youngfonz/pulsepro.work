import { apiFetch, GetToken } from './client'
import { Task } from '../types/api'

interface CalendarResponse { tasks: Task[] }

export function fetchCalendarTasks(getToken: GetToken, year: number, month: number) {
  return apiFetch<CalendarResponse>(`/calendar?year=${year}&month=${month}`, getToken)
}
