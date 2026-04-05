import React, { useEffect } from 'react'
import { Text, ScrollView, RefreshControl, StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useNavigation, CommonActions } from '@react-navigation/native'
import { useClientDetail } from '../../hooks/useClients'
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import type { MoreStackParamList } from '../../types/navigation'

type Props = NativeStackScreenProps<MoreStackParamList, 'ClientDetail'>

export function ClientDetailScreen({ route }: Props) {
  const { id } = route.params
  const navigation = useNavigation()
  const { data: client, isLoading, isRefetching, error, refetch } = useClientDetail(id)
  const { addItem } = useRecentlyViewed()

  useEffect(() => {
    if (client) {
      addItem({ id: client.id, type: 'client', name: client.name, subtitle: client.company ?? undefined })
    }
  }, [client?.id])

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

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
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {client && (
          <>
            <Text style={styles.name}>{client.name}</Text>
            {client.company && <Text style={styles.detail}>{client.company}</Text>}
            {client.email && <Text style={styles.detail}>{client.email}</Text>}
            {client.phone && <Text style={styles.detail}>{client.phone}</Text>}

            {client.projects && client.projects.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Projects ({client.projects.length})</Text>
                {client.projects.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.projectRow}
                    onPress={() => navigation.dispatch(CommonActions.navigate({ name: 'ProjectsTab', params: { screen: 'ProjectDetail', params: { id: p.id } } }))}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.projectName}>{p.name}</Text>
                  </TouchableOpacity>
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
  detail: { fontSize: 15, color: colors.textSecondary, marginTop: spacing.sm },
  section: { marginTop: spacing.xl },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  projectRow: {
    backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  projectName: { fontSize: 15, color: colors.textPrimary },
})
