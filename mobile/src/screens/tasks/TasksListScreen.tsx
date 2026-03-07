import React from 'react'
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { CheckSquare, Square } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { useTasks, useToggleTask } from '../../hooks/useTasks'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { getPriorityColor } from '../../utils/status'
import { formatDate, isOverdue } from '../../utils/dates'
import type { TasksStackParamList } from '../../types/navigation'
import type { Task } from '../../types/api'

type Props = { navigation: NativeStackNavigationProp<TasksStackParamList, 'TasksList'> }

export function TasksListScreen({ navigation }: Props) {
  const { data, isLoading, isFetching, refetch } = useTasks()
  const toggleMutation = useToggleTask()

  const handleToggle = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    toggleMutation.mutate(id)
  }

  const renderItem = ({ item }: { item: Task }) => {
    const overdue = isOverdue(item.dueDate, item.status)
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('TaskDetail', { id: item.id })}
      >
        <TouchableOpacity onPress={() => handleToggle(item.id)} hitSlop={8}>
          {item.status === 'done'
            ? <CheckSquare size={22} color={colors.success} />
            : <Square size={22} color={colors.textSecondary} />
          }
        </TouchableOpacity>
        <View style={styles.rowContent}>
          <Text style={[styles.rowTitle, item.status === 'done' && styles.done]} numberOfLines={1}>
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
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={data?.tasks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isFetching && !!data} onRefresh={refetch} tintColor={colors.primary} />}
        ListEmptyComponent={!isLoading ? <Text style={styles.empty}>No tasks yet</Text> : null}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg },
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
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: 60, fontSize: 15 },
})
