import React from 'react'
import { Text, ScrollView, RefreshControl, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useClientDetail } from '../../hooks/useClients'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import type { MoreStackParamList } from '../../types/navigation'

type Props = NativeStackScreenProps<MoreStackParamList, 'ClientDetail'>

export function ClientDetailScreen({ route }: Props) {
  const { id } = route.params
  const { data: client, isLoading, refetch } = useClientDetail(id)

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />}
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
                  <View key={p.id} style={styles.projectRow}>
                    <Text style={styles.projectName}>{p.name}</Text>
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
  detail: { fontSize: 15, color: colors.textSecondary, marginTop: spacing.sm },
  section: { marginTop: spacing.xl },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  projectRow: {
    backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  projectName: { fontSize: 15, color: colors.textPrimary },
})
