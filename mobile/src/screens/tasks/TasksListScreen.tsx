import React, { useLayoutEffect, useRef, useCallback, useState, useMemo } from 'react'
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, Animated, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Swipeable } from 'react-native-gesture-handler'
import { CheckSquare, Square, Plus, Check } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { useTasks, useToggleTask } from '../../hooks/useTasks'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { getPriorityColor } from '../../utils/status'
import { formatDate, isOverdue } from '../../utils/dates'
import type { TasksStackParamList } from '../../types/navigation'
import type { Task } from '../../types/api'

type Props = { navigation: NativeStackNavigationProp<TasksStackParamList, 'TasksList'> }

type StatusFilter = 'all' | 'todo' | 'done'
type PriorityFilter = 'all' | 'high' | 'medium' | 'low'
type SortOption = 'newest' | 'due' | 'priority'

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'Active' },
  { key: 'done', label: 'Done' },
]

const priorityFilters: { key: PriorityFilter; label: string; color: string }[] = [
  { key: 'all', label: 'Any', color: colors.textSecondary },
  { key: 'high', label: 'High', color: colors.destructive },
  { key: 'medium', label: 'Medium', color: colors.warning },
  { key: 'low', label: 'Low', color: colors.success },
]

const sortOptions: { key: SortOption; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'due', label: 'Due Date' },
  { key: 'priority', label: 'Priority' },
]

const priorityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 }

function TaskRow({ item, onToggle, onPress }: { item: Task; onToggle: (id: string) => void; onPress: (id: string) => void }) {
  const scale = useRef(new Animated.Value(1)).current
  const swipeRef = useRef<Swipeable>(null)
  const overdue = isOverdue(item.dueDate, item.status)
  const isDone = item.status === 'done'

  const handleToggle = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, friction: 3, tension: 200 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 3, tension: 80 }),
    ]).start()
    onToggle(item.id)
  }

  const renderLeftActions = (_progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const opacity = dragX.interpolate({ inputRange: [0, 40, 80], outputRange: [0, 0.5, 1] })
    return (
      <Animated.View style={[styles.swipeAction, styles.swipeComplete, { opacity }]}>
        <Check size={20} color="#fff" />
        <Text style={styles.swipeActionText}>{isDone ? 'Reopen' : 'Done'}</Text>
      </Animated.View>
    )
  }

  const handleSwipe = () => {
    swipeRef.current?.close()
    onToggle(item.id)
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Swipeable
        ref={swipeRef}
        renderLeftActions={renderLeftActions}
        onSwipeableOpen={handleSwipe}
        overshootLeft={false}
        overshootRight={false}
        friction={2}
      >
        <TouchableOpacity
          style={styles.row}
          onPress={() => onPress(item.id)}
          activeOpacity={0.7}
        >
          <TouchableOpacity onPress={handleToggle} hitSlop={8} activeOpacity={0.7}>
            {isDone
              ? <CheckSquare size={22} color={colors.success} />
              : <Square size={22} color={colors.textSecondary} />
            }
          </TouchableOpacity>
          <View style={styles.rowContent}>
            <Text style={[styles.rowTitle, isDone && styles.done]} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.rowMeta}>
              <Text style={styles.rowProject}>{item.project?.name ?? 'Quick task'}</Text>
              {item.dueDate && (
                <Text style={[styles.rowDue, overdue && styles.overdue]}>{formatDate(item.dueDate)}</Text>
              )}
            </View>
          </View>
          <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  )
}

export function TasksListScreen({ navigation }: Props) {
  const { data, isLoading, isFetching, refetch } = useTasks()
  const toggleMutation = useToggleTask()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('CreateTask')} hitSlop={8} activeOpacity={0.7}>
          <Plus size={24} color={colors.primary} />
        </TouchableOpacity>
      ),
    })
  }, [navigation])

  const handleToggle = useCallback(async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    toggleMutation.mutate(id)
  }, [toggleMutation])

  const handlePress = useCallback((id: string) => {
    navigation.navigate('TaskDetail', { id })
  }, [navigation])

  const filteredTasks = useMemo(() => {
    let tasks = data?.tasks ?? []

    if (statusFilter === 'todo') tasks = tasks.filter(t => t.status !== 'done')
    else if (statusFilter === 'done') tasks = tasks.filter(t => t.status === 'done')

    if (priorityFilter !== 'all') tasks = tasks.filter(t => t.priority === priorityFilter)

    const sorted = [...tasks]
    if (sortBy === 'due') {
      sorted.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })
    } else if (sortBy === 'priority') {
      sorted.sort((a, b) => (priorityWeight[b.priority] ?? 0) - (priorityWeight[a.priority] ?? 0))
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return sorted
  }, [data?.tasks, statusFilter, priorityFilter, sortBy])

  const handleStatusFilter = useCallback((key: StatusFilter) => {
    Haptics.selectionAsync()
    setStatusFilter(key)
  }, [])

  const handlePriorityFilter = useCallback((key: PriorityFilter) => {
    Haptics.selectionAsync()
    setPriorityFilter(key)
  }, [])

  const handleSort = useCallback((key: SortOption) => {
    Haptics.selectionAsync()
    setSortBy(key)
  }, [])

  const renderItem = useCallback(({ item }: { item: Task }) => (
    <TaskRow item={item} onToggle={handleToggle} onPress={handlePress} />
  ), [handleToggle, handlePress])

  const activeFilterCount = (statusFilter !== 'all' ? 1 : 0) + (priorityFilter !== 'all' ? 1 : 0)

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {statusFilters.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, statusFilter === f.key && styles.filterChipActive]}
              onPress={() => handleStatusFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, statusFilter === f.key && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.filterDivider} />
          {priorityFilters.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, priorityFilter === f.key && styles.filterChipActive]}
              onPress={() => handlePriorityFilter(f.key)}
              activeOpacity={0.7}
            >
              {f.key !== 'all' && <View style={[styles.filterDot, { backgroundColor: f.color }]} />}
              <Text style={[styles.filterChipText, priorityFilter === f.key && styles.filterChipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.filterDivider} />
          {sortOptions.map(s => (
            <TouchableOpacity
              key={s.key}
              style={[styles.filterChip, sortBy === s.key && styles.filterChipActive]}
              onPress={() => handleSort(s.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, sortBy === s.key && styles.filterChipTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isFetching && !!data} onRefresh={refetch} tintColor={colors.primary} />}
        ListEmptyComponent={
          isLoading
            ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 80 }} />
            : (
              <View style={styles.emptyContainer}>
                {activeFilterCount > 0 ? (
                  <>
                    <Text style={styles.emptyTitle}>No matches</Text>
                    <Text style={styles.empty}>No tasks match the current filters.</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.emptyEmoji}>✅</Text>
                    <Text style={styles.emptyTitle}>All clear</Text>
                    <Text style={styles.empty}>No tasks yet. Tap + to create one.</Text>
                  </>
                )}
              </View>
            )
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterSection: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  filterRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.xs },
  filterChip: {
    paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: 8,
    backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  filterChipActive: { backgroundColor: colors.primary + '15', borderColor: colors.primary },
  filterChipText: { fontSize: 13, color: colors.textSecondary },
  filterChipTextActive: { color: colors.primary, fontWeight: '600' },
  filterDot: { width: 6, height: 6, borderRadius: 3 },
  filterDivider: { width: 1, height: 20, backgroundColor: colors.border, marginHorizontal: 4 },
  list: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 10, padding: spacing.md, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.sm, gap: spacing.md,
  },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 15, color: colors.textPrimary },
  done: { textDecorationLine: 'line-through', color: colors.textSecondary },
  rowMeta: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  rowProject: { fontSize: 13, color: colors.textSecondary },
  rowDue: { fontSize: 13, color: colors.textSecondary },
  overdue: { color: colors.destructive },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  swipeAction: {
    justifyContent: 'center', alignItems: 'center', flexDirection: 'row',
    gap: 6, paddingHorizontal: spacing.xl, borderRadius: 10, marginBottom: spacing.sm,
  },
  swipeComplete: { backgroundColor: colors.success },
  swipeDelete: { backgroundColor: colors.destructive },
  swipeActionText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  empty: { color: colors.textSecondary, textAlign: 'center', fontSize: 15 },
})
