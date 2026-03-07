import React from 'react'
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useProjects } from '../../hooks/useProjects'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { getStatusColor, getPriorityColor, getStatusLabel } from '../../utils/status'
import type { ProjectsStackParamList } from '../../types/navigation'
import type { Project } from '../../types/api'

type Props = { navigation: NativeStackNavigationProp<ProjectsStackParamList, 'ProjectsList'> }

export function ProjectsListScreen({ navigation }: Props) {
  const { data, isLoading, isFetching, refetch } = useProjects()

  const renderItem = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProjectDetail', { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <View style={[styles.badge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
          <Text style={[styles.badgeText, { color: getPriorityColor(item.priority) }]}>{item.priority}</Text>
        </View>
      </View>
      <Text style={styles.cardSubtitle}>{item.client.name}</Text>
      <View style={styles.cardFooter}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
        <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        {item._count && <Text style={styles.taskCount}>{item._count.tasks} tasks</Text>}
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={data?.projects}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isFetching && !!data} onRefresh={refetch} tintColor={colors.primary} />}
        ListEmptyComponent={!isLoading ? <Text style={styles.empty}>No projects yet</Text> : null}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg },
  card: {
    backgroundColor: colors.surface, borderRadius: 12, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  cardSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  statusText: { fontSize: 13, color: colors.textSecondary },
  taskCount: { fontSize: 13, color: colors.textSecondary, marginLeft: 'auto' },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: 60, fontSize: 15 },
})
