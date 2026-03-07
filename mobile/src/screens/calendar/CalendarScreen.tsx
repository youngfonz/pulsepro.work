import React, { useState, useMemo } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { useCalendar } from '../../hooks/useCalendar'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { getPriorityColor, getStatusColor } from '../../utils/status'
import type { Task } from '../../types/api'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const CELL_SIZE = Math.floor((Dimensions.get('window').width - spacing.lg * 2) / 7)

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

export function CalendarScreen() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(today)

  const { data } = useCalendar(year, month)
  const tasks = data?.tasks ?? []

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const task of tasks) {
      const date = task.dueDate || task.startDate
      if (!date) continue
      const key = new Date(date).toDateString()
      const existing = map.get(key) || []
      existing.push(task)
      map.set(key, existing)
    }
    return map
  }, [tasks])

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    return days
  }, [year, month])

  const selectedTasks = useMemo(() => {
    return tasksByDate.get(selectedDate.toDateString()) || []
  }, [tasksByDate, selectedDate])

  const goToPrev = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  const goToNext = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        {/* Month navigation */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goToPrev} hitSlop={12}>
            <ChevronLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
          <TouchableOpacity onPress={goToNext} hitSlop={12}>
            <ChevronRight size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={styles.dayHeaders}>
          {DAYS.map(d => (
            <View key={d} style={styles.dayHeaderCell}>
              <Text style={styles.dayHeaderText}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {calendarDays.map((day, i) => {
            if (day === null) return <View key={`empty-${i}`} style={styles.cell} />

            const date = new Date(year, month, day)
            const isToday = isSameDay(date, today)
            const isSelected = isSameDay(date, selectedDate)
            const dayTasks = tasksByDate.get(date.toDateString()) || []
            const hasTasks = dayTasks.length > 0

            return (
              <TouchableOpacity
                key={day}
                style={[styles.cell, isSelected && styles.cellSelected]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.dayText,
                  isToday && styles.dayToday,
                  isSelected && styles.daySelectedText,
                ]}>
                  {day}
                </Text>
                {hasTasks && (
                  <View style={styles.dots}>
                    {dayTasks.slice(0, 3).map((t, j) => (
                      <View key={j} style={[styles.dot, { backgroundColor: getPriorityColor(t.priority) }]} />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Selected day tasks */}
        <View style={styles.taskSection}>
          <Text style={styles.taskSectionTitle}>
            {isSameDay(selectedDate, today) ? 'Today' : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
          {selectedTasks.length === 0 ? (
            <Text style={styles.noTasks}>No tasks scheduled</Text>
          ) : (
            selectedTasks.map(task => (
              <View key={task.id} style={styles.taskRow}>
                <View style={[styles.taskDot, { backgroundColor: getStatusColor(task.status) }]} />
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                  <Text style={styles.taskProject}>{task.project?.name ?? 'Quick task'}</Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>{task.priority}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  monthTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  dayHeaders: { flexDirection: 'row', paddingHorizontal: spacing.lg },
  dayHeaderCell: { width: CELL_SIZE, alignItems: 'center', paddingVertical: spacing.xs },
  dayHeaderText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg },
  cell: {
    width: CELL_SIZE, height: CELL_SIZE, alignItems: 'center', justifyContent: 'center',
    borderRadius: CELL_SIZE / 2,
  },
  cellSelected: { backgroundColor: colors.primary },
  dayText: { fontSize: 15, color: colors.textPrimary },
  dayToday: { fontWeight: '700', color: colors.primary },
  daySelectedText: { color: '#fff', fontWeight: '700' },
  dots: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  taskSection: { padding: spacing.lg, marginTop: spacing.sm },
  taskSectionTitle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  noTasks: { fontSize: 15, color: colors.textSecondary },
  taskRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 10, padding: spacing.md, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  taskDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.md },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, color: colors.textPrimary },
  taskProject: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  priorityBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 6 },
  priorityText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
})
