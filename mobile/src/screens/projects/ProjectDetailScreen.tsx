import React from 'react'
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useProjectDetail } from '../../hooks/useProjects'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { getStatusLabel, getStatusColor, getPriorityColor } from '../../utils/status'
import { formatDate } from '../../utils/dates'
import type { ProjectsStackParamList } from '../../types/navigation'

type Props = NativeStackScreenProps<ProjectsStackParamList, 'ProjectDetail'>

export function ProjectDetailScreen({ route }: Props) {
  const { id } = route.params
  const { data: project, isLoading, refetch } = useProjectDetail(id)

  if (isLoading && !project) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  if (!project && !isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Text style={styles.empty}>Project not found</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {project && (
          <>
            <Text style={styles.name}>{project.name}</Text>
            <Text style={styles.client}>{project.client.name}</Text>

            <View style={styles.metaRow}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
                  {getStatusLabel(project.status)}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getPriorityColor(project.priority) + '20' }]}>
                <Text style={[styles.statusText, { color: getPriorityColor(project.priority) }]}>
                  {project.priority}
                </Text>
              </View>
            </View>

            {project.dueDate && (
              <Text style={styles.due}>Due: {formatDate(project.dueDate)}</Text>
            )}

            {project.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{project.description}</Text>
              </View>
            )}

            {project.tasks && project.tasks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tasks ({project.tasks.length})</Text>
                {project.tasks.map(task => (
                  <View key={task.id} style={styles.taskRow}>
                    <View style={[styles.taskDot, { backgroundColor: getStatusColor(task.status) }]} />
                    <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
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
  name: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  client: { fontSize: 15, color: colors.textSecondary, marginTop: spacing.xs },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 8 },
  statusText: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  due: { fontSize: 15, color: colors.textSecondary, marginTop: spacing.md },
  section: { marginTop: spacing.xl },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  description: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  taskRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 10, padding: spacing.md, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  taskDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.md },
  taskTitle: { fontSize: 15, color: colors.textPrimary, flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: 60, fontSize: 15 },
})
