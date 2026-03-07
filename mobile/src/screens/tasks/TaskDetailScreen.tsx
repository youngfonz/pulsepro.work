import React from 'react'
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useTaskDetail } from '../../hooks/useTasks'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { getStatusLabel, getStatusColor, getPriorityColor } from '../../utils/status'
import { formatDate } from '../../utils/dates'
import type { TasksStackParamList } from '../../types/navigation'

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskDetail'>

export function TaskDetailScreen({ route }: Props) {
  const { id } = route.params
  const { data: task, isLoading, refetch } = useTaskDetail(id)

  if (isLoading && !task) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  if (!task && !isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Text style={styles.empty}>Task not found</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {task && (
          <>
            <Text style={styles.title}>{task.title}</Text>
            {task.project && <Text style={styles.project}>{task.project.name}</Text>}

            <View style={styles.metaRow}>
              <View style={[styles.badge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
                <Text style={[styles.badgeText, { color: getStatusColor(task.status) }]}>
                  {getStatusLabel(task.status)}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                <Text style={[styles.badgeText, { color: getPriorityColor(task.priority) }]}>
                  {task.priority}
                </Text>
              </View>
            </View>

            {task.dueDate && <Text style={styles.due}>Due: {formatDate(task.dueDate)}</Text>}

            {task.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.body}>{task.description}</Text>
              </View>
            )}

            {task.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.body}>{task.notes}</Text>
              </View>
            )}

            {task.comments && task.comments.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Comments ({task.comments.length})</Text>
                {task.comments.map(c => (
                  <View key={c.id} style={styles.comment}>
                    <Text style={styles.commentText}>{c.content}</Text>
                    <Text style={styles.commentDate}>{formatDate(c.createdAt)}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  project: { fontSize: 15, color: colors.textSecondary, marginTop: spacing.xs },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  badge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 8 },
  badgeText: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  due: { fontSize: 15, color: colors.textSecondary, marginTop: spacing.md },
  section: { marginTop: spacing.xl },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  body: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  comment: {
    backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  commentText: { fontSize: 15, color: colors.textPrimary },
  commentDate: { fontSize: 11, color: colors.textSecondary, marginTop: spacing.xs },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: 60, fontSize: 15 },
})
