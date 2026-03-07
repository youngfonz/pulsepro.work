import React from 'react'
import { Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useClients } from '../../hooks/useClients'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import type { MoreStackParamList } from '../../types/navigation'
import type { Client } from '../../types/api'

type Props = { navigation: NativeStackNavigationProp<MoreStackParamList, 'ClientsList'> }

export function ClientsListScreen({ navigation }: Props) {
  const { data, isLoading, isFetching, refetch } = useClients()

  const renderItem = ({ item }: { item: Client }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('ClientDetail', { id: item.id })}
    >
      <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.company}>{item.company || 'No company'}</Text>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={data?.clients}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isFetching && !!data} onRefresh={refetch} tintColor={colors.primary} />}
        ListEmptyComponent={!isLoading ? <Text style={styles.empty}>No clients yet</Text> : null}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg },
  row: {
    backgroundColor: colors.surface, borderRadius: 10, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  name: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  company: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: 60, fontSize: 15 },
})
