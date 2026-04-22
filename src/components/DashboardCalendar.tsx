'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  status: string
  priority: string
  startDate: string | null
  dueDate: string | null
  project: {
    id: string
    name: string
    client: {
      name: string
    }
  }
}

export function DashboardCalendar() {
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth())
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/calendar?year=${year}&month=${month}`)
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  // Create calendar grid
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  // Get tasks for a specific date
  const getTasksForDate = (day: number) => {
    const date = new Date(year, month, day)
    date.setHours(0, 0, 0, 0)
    const dateStr = date.toISOString().split('T')[0]

    return tasks.filter((task) => {
      const taskDueDate = task.dueDate ? task.dueDate.split('T')[0] : null
      const taskStartDate = task.startDate ? task.startDate.split('T')[0] : null
      return taskDueDate === dateStr || taskStartDate === dateStr
    })
  }

  const isToday = (day: number) => {
    return isCurrentMonth && day === today.getDate()
  }

  const formatDateParam = (day: number) => {
    const date = new Date(year, month, day)
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-medium text-foreground">
          {monthNames[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={index} className="h-8" />
          }

          const dayTasks = getTasksForDate(day)
          const hasTasks = dayTasks.length > 0
          const hasPendingTasks = dayTasks.some((t) => t.status !== 'done')
          const hasHighPriority = dayTasks.some((t) => t.priority === 'high' && t.status !== 'done')

          return (
            <Link
              key={index}
              href={`/tasks?date=${formatDateParam(day)}`}
              className={`h-8 flex items-center justify-center text-sm  relative transition-colors ${
                isToday(day)
                  ? 'bg-primary text-primary-foreground font-medium hover:bg-primary/90'
                  : hasTasks
                  ? 'hover:bg-muted font-medium text-foreground'
                  : 'hover:bg-muted/50 text-foreground'
              }`}
            >
              {day}
              {hasTasks && !isToday(day) && (
                <span
                  className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                    hasHighPriority
                      ? 'bg-destructive'
                      : hasPendingTasks
                      ? 'bg-primary'
                      : 'bg-success'
                  }`}
                />
              )}
            </Link>
          )
        })}
      </div>

      {loading && (
        <div className="text-center text-xs text-muted-foreground">Loading...</div>
      )}
    </div>
  )
}
