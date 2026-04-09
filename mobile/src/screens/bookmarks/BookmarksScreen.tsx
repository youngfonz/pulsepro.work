import React from 'react'
import { Text, FlatList, TouchableOpacity, StyleSheet, View, RefreshControl, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ExternalLink } from 'lucide-react-native'
import * as Linking from 'expo-linking'
import { useBookmarks } from '../../hooks/useBookmarks'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import type { Task } from '../../types/api'

function getBookmarkIcon(type: string | null): string {
  switch (type) {
    case 'figma': return 'F'
    case 'google': return 'G'
    case 'github': return 'GH'
    default: return 'L'
  }
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

export function BookmarksScreen() {
  const { data, isLoading, isFetching, error, refetch } = useBookmarks()

  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => item.url && Linking.openURL(item.url)}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrap}>
        <Text style={styles.iconText}>{getBookmarkIcon(item.bookmarkType)}</Text>
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.domain} numberOfLines={1}>{item.url ? getDomain(item.url) : ''}</Text>
        <Text style={styles.project}>{item.project?.name ?? 'Quick task'}</Text>
      </View>
      <ExternalLink size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  )

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center' }}>Something went wrong</Text>
          <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 12, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primary, borderRadius: 8 }} activeOpacity={0.7}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={data?.bookmarks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isFetching && !!data} onRefresh={refetch} tintColor={colors.primary} />}
        ListEmptyComponent={
          isLoading
            ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
            : <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🔖</Text>
                <Text style={styles.emptyTitle}>No bookmarks yet</Text>
                <Text style={styles.empty}>Save links from your projects to find them fast.</Text>
              </View>
        }
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
  iconWrap: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  rowContent: { flex: 1 },
  title: { fontSize: 15, color: colors.textPrimary },
  domain: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  project: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  empty: { color: colors.textSecondary, textAlign: 'center', fontSize: 15 },
})
