import React, { useState, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, CommonActions } from '@react-navigation/native'
import { FolderKanban, CheckSquare, Users, Bookmark } from 'lucide-react-native'
import { SearchBar } from '../../components/shared/SearchBar'
import { useSearch } from '../../hooks/useSearch'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { getStatusColor, getPriorityColor } from '../../utils/status'
import type { SearchResult } from '../../types/api'

const typeIcons: Record<string, typeof FolderKanban> = {
  project: FolderKanban,
  task: CheckSquare,
  client: Users,
  bookmark: Bookmark,
}

const typeColors: Record<string, string> = {
  project: colors.primary,
  task: colors.success,
  client: colors.warning,
  bookmark: '#8b5cf6',
}

function ResultRow({ item, onPress }: { item: SearchResult; onPress: () => void }) {
  const Icon = typeIcons[item.type] || CheckSquare
  const iconColor = typeColors[item.type] || colors.textSecondary

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconWrap, { backgroundColor: iconColor + '15' }]}>
        <Icon size={18} color={iconColor} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.rowSubtitle} numberOfLines={1}>{item.subtitle}</Text>
      </View>
      {item.status && (
        <View style={[styles.dot, { backgroundColor: getStatusColor(item.status) }]} />
      )}
      {item.priority && !item.status && (
        <View style={[styles.dot, { backgroundColor: getPriorityColor(item.priority) }]} />
      )}
    </TouchableOpacity>
  )
}

export function SearchScreen() {
  const [query, setQuery] = useState('')
  const { data, isLoading } = useSearch(query)
  const navigation = useNavigation()

  const navigateToResult = useCallback((item: SearchResult) => {
    switch (item.type) {
      case 'project':
        navigation.dispatch(CommonActions.navigate({ name: 'ProjectsTab', params: { screen: 'ProjectDetail', params: { id: item.id } } }))
        break
      case 'task':
        navigation.dispatch(CommonActions.navigate({ name: 'TasksTab', params: { screen: 'TaskDetail', params: { id: item.id } } }))
        break
      case 'client':
        navigation.dispatch(CommonActions.navigate({ name: 'MoreTab', params: { screen: 'ClientDetail', params: { id: item.id } } }))
        break
      case 'bookmark':
        navigation.dispatch(CommonActions.navigate({ name: 'TasksTab', params: { screen: 'TaskDetail', params: { id: item.id } } }))
        break
    }
  }, [navigation])

  const results = data?.results ?? []

  const renderItem = useCallback(({ item }: { item: SearchResult }) => (
    <ResultRow item={item} onPress={() => navigateToResult(item)} />
  ), [navigateToResult])

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchWrap}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search projects, tasks, clients..." />
      </View>

      {isLoading && query.length >= 2 && (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      )}

      {query.length < 2 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Search Pulse Pro</Text>
          <Text style={styles.emptyText}>Type at least 2 characters to search across projects, tasks, clients, and bookmarks.</Text>
        </View>
      ) : results.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No results</Text>
          <Text style={styles.emptyText}>Nothing matched "{query}"</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => `${item.type}-${item.id}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 10, padding: spacing.md, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.sm, gap: spacing.md,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 15, color: colors.textPrimary, fontWeight: '500' },
  rowSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  loader: { marginTop: spacing.xl },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: spacing.xxl },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  emptyText: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
})
