import React, { useLayoutEffect, useRef, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, Animated } from 'react-native'
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

  const renderRightActions = (_progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const opacity = dragX.interpolate({ inputRange: [-80, -40, 0], outputRange: [1, 0.5, 0] })
    return (
      <Animated.View style={[styles.swipeAction, styles.swipeDelete, { opacity }]}>
        <Text style={styles.swipeActionText}>{isDone ? 'Reopen' : 'Done'}</Text>
      </Animated.View>
    )
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
          <TouchableOpacity onPress={handleToggle} hitSlop={8}>
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('CreateTask')} hitSlop={8}>
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

  const renderItem = useCallback(({ item }: { item: Task }) => (
    <TaskRow item={item} onToggle={handleToggle} onPress={handlePress} />
  ), [handleToggle, handlePress])

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={data?.tasks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isFetching && !!data} onRefresh={refetch} tintColor={colors.primary} />}
        ListEmptyComponent={!isLoading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>All clear</Text>
            <Text style={styles.empty}>No tasks yet. Tap + to create one.</Text>
          </View>
        ) : null}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
