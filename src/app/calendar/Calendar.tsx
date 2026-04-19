'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { priorityColors, priorityLabels } from '@/lib/utils'

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
  } | null
}

interface CalendarProps {
  initialYear: number
  initialMonth: number
}

export function Calendar({ initialYear, initialMonth }: CalendarProps) {
  const router = useRouter()
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

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

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayNamesShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

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
    setSelectedDate(null)
  }

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
    setSelectedDate(null)
  }

  const goToToday = () => {
    const today = new Date()
    setYear(today.getFullYear())
    setMonth(today.getMonth())
    setSelectedDate(today)
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

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    )
  }

  const formatDateParam = (day: number) => {
    const date = new Date(year, month, day)
    return date.toISOString().split('T')[0]
  }

  const selectedDayTasks = selectedDate
    ? getTasksForDate(selectedDate.getDate())
    : []

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" onClick={prevMonth}>
            &larr;
          </Button>
          <h2 className="text-base sm:text-lg font-semibold text-foreground min-w-[140px] sm:min-w-[180px] text-center">
            {monthNames[month]} {year}
          </h2>
          <Button variant="ghost" size="sm" onClick={nextMonth}>
            &rarr;
          </Button>
        </div>
        <Button variant="secondary" size="sm" onClick={goToToday}>
          Today
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-t-lg overflow-hidden">
            {dayNames.map((day, i) => (
              <div
                key={day}
                className="bg-muted py-2 text-center text-xs sm:text-sm font-medium text-muted-foreground"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{dayNamesShort[i]}</span>
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-b-lg overflow-hidden">
            {calendarDays.map((day, index) => {
              const dayTasks = day ? getTasksForDate(day) : []
              const hasTasks = dayTasks.length > 0
              const hasHighPriority = dayTasks.some((t) => t.priority === 'high' && t.status !== 'done')
              const hasOverdue = dayTasks.some((t) => {
                if (!t.dueDate || t.status === 'done') return false
                const dueDate = new Date(t.dueDate)
                return dueDate < today && !(dueDate.toDateString() === today.toDateString())
              })

              return (
                <div
                  key={index}
                  onClick={() => day && setSelectedDate(new Date(year, month, day))}
                  className={`min-h-[56px] sm:min-h-[100px] p-1 sm:p-2 bg-card transition-colors ${
                    day ? 'cursor-pointer hover:bg-muted/50' : ''
                  } ${isSelected(day!) ? 'ring-2 ring-primary ring-inset' : ''}`}
                >
                  {day && (
                    <>
                      <div
                        className={`text-xs sm:text-sm font-medium mb-1 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ${
                          isToday(day)
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground'
                        }`}
                      >
                        {day}
                      </div>
                      {hasTasks && (
                        <>
                          {/* Mobile: dots only */}
                          <div className="flex gap-0.5 sm:hidden">
                            {dayTasks.slice(0, 3).map((task) => (
                              <div
                                key={task.id}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  task.status === 'done'
                                    ? 'bg-emerald-500'
                                    : task.priority === 'high'
                                    ? 'bg-rose-500'
                                    : 'bg-primary'
                                }`}
                              />
                            ))}
                          </div>
                          {/* Desktop: task labels */}
                          <div className="hidden sm:block space-y-0.5">
                            {dayTasks.slice(0, 2).map((task) => (
                              <div
                                key={task.id}
                                className={`text-xs truncate rounded px-1 py-0.5 font-medium ${
                                  task.status === 'done'
                                    ? 'bg-emerald-600 text-white line-through'
                                    : hasOverdue
                                    ? 'bg-rose-600 text-white'
                                    : task.priority === 'high'
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-primary text-primary-foreground'
                                }`}
                              >
                                {task.title}
                              </div>
                            ))}
                            {dayTasks.length > 2 && (
                              <div className="text-xs text-muted-foreground px-1">
                                +{dayTasks.length - 2} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected day details */}
        <div className="lg:col-span-1">
          <div className="border border-border  p-4 bg-card">
            {selectedDate ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  <Link
                    href={`/tasks?date=${formatDateParam(selectedDate.getDate())}`}
                    className="text-xs text-link hover:text-link/80"
                  >
                    View all tasks
                  </Link>
                </div>
                {selectedDayTasks.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No tasks for this day</p>
                    <Link
                      href="/tasks?add=true"
                      className="inline-flex items-center gap-1.5 mt-2 text-sm text-primary hover:text-primary/80"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Add a task
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDayTasks.map((task) => (
                      <Link
                        key={task.id}
                        href={task.project ? `/projects/${task.project.id}` : `/tasks/${task.id}`}
                        className="block p-3  border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`font-medium text-sm ${
                              task.status === 'done'
                                ? 'text-muted-foreground line-through'
                                : 'text-foreground'
                            }`}
                          >
                            {task.title}
                          </span>
                          <Badge className={`${priorityColors[task.priority]} text-xs flex-shrink-0`}>
                            {priorityLabels[task.priority]}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {task.project?.name ?? 'Quick task'}{task.project?.client?.name ? ` \u2022 ${task.project.client.name}` : ''}
                        </p>
                        {task.dueDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a day to see task details
              </p>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 p-4 border border-border  bg-card">
            <h4 className="text-sm font-medium text-foreground mb-2">Legend</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-rose-500" />
                <span className="text-muted-foreground">High priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary" />
                <span className="text-muted-foreground">Normal priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-600" />
                <span className="text-muted-foreground">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-rose-600" />
                <span className="text-muted-foreground">Overdue</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center text-muted-foreground text-sm">Loading tasks...</div>
      )}
    </div>
  )
}
