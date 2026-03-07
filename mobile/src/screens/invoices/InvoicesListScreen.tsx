import React from 'react'
import { Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useInvoices } from '../../hooks/useInvoices'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { getStatusColor, getStatusLabel } from '../../utils/status'
import type { MoreStackParamList } from '../../types/navigation'
import type { Invoice } from '../../types/api'

type Props = { navigation: NativeStackNavigationProp<MoreStackParamList, 'InvoicesList'> }

export function InvoicesListScreen({ navigation }: Props) {
  const { data, isLoading, isFetching, refetch } = useInvoices()

  const renderItem = ({ item }: { item: Invoice }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('InvoiceDetail', { id: item.id })}
    >
      <View style={styles.rowHeader}>
        <Text style={styles.number}>{item.number}</Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
      <Text style={styles.client}>{item.client?.name}</Text>
      {item.total !== undefined && (
        <Text style={styles.total}>${item.total.toFixed(2)}</Text>
      )}
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={data?.invoices}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isFetching && !!data} onRefresh={refetch} tintColor={colors.primary} />}
        ListEmptyComponent={!isLoading ? <Text style={styles.empty}>No invoices yet</Text> : null}
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
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  number: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  client: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs },
  total: { fontSize: 17, fontWeight: '600', color: colors.textPrimary, marginTop: spacing.sm },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: 60, fontSize: 15 },
})
