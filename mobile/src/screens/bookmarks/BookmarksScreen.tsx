import React from 'react'
import { Text, FlatList, TouchableOpacity, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ExternalLink } from 'lucide-react-native'
import * as Linking from 'expo-linking'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { mockBookmarks } from '../../data/mock'
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
  const bookmarks = mockBookmarks

  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => item.url && Linking.openURL(item.url)}
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

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={bookmarks}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No bookmarks yet</Text>}
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
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: 60, fontSize: 15 },
})
