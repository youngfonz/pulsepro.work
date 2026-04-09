import React, { useLayoutEffect } from 'react'
import { Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, View, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Plus } from 'lucide-react-native'
import { useInvoices } from '../../hooks/useInvoices'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { getStatusColor, getStatusLabel } from '../../utils/status'
import { formatDate } from '../../utils/dates'
import type { MoreStackParamList } from '../../types/navigation'
import type { Invoice } from '../../types/api'

type Props = { navigation: NativeStackNavigationProp<MoreStackParamList, 'InvoicesList'> }

export function InvoicesListScreen({ navigation }: Props) {
  const { data, isLoading, isFetching, refetch } = useInvoices()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('CreateInvoice')} hitSlop={8} activeOpacity={0.7}>
          <Plus size={24} color={colors.primary} />
        </TouchableOpacity>
      ),
    })
  }, [navigation])

  const renderItem = ({ item }: { item: Invoice }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('InvoiceDetail', { id: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.rowHeader}>
        <Text style={styles.number}>{item.number}</Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
      <View style={styles.rowMeta}>
        <Text style={styles.client}>{item.client?.name}</Text>
        {item.dueDate && <Text style={styles.due}>{formatDate(item.dueDate)}</Text>}
      </View>
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
        ListEmptyComponent={
          isLoading
            ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
            : <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>💸</Text>
                <Text style={styles.emptyTitle}>No invoices yet</Text>
                <Text style={styles.empty}>Tap + to create your first invoice.</Text>
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
    backgroundColor: colors.surface, borderRadius: 10, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  number: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  rowMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  client: { fontSize: 13, color: colors.textSecondary },
  due: { fontSize: 13, color: colors.textSecondary },
  total: { fontSize: 17, fontWeight: '600', color: colors.textPrimary, marginTop: spacing.sm },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
  empty: { color: colors.textSecondary, textAlign: 'center', fontSize: 15 },
})
