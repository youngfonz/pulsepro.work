import React from 'react'
import { Text, ScrollView, RefreshControl, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useInvoiceDetail } from '../../hooks/useInvoices'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { getStatusLabel, getStatusColor } from '../../utils/status'
import type { MoreStackParamList } from '../../types/navigation'

type Props = NativeStackScreenProps<MoreStackParamList, 'InvoiceDetail'>

export function InvoiceDetailScreen({ route }: Props) {
  const { id } = route.params
  const { data: invoice, isLoading, refetch } = useInvoiceDetail(id)

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {invoice && (
          <>
            <Text style={styles.number}>{invoice.number}</Text>
            <View style={[styles.badge, { backgroundColor: getStatusColor(invoice.status) + '20' }]}>
              <Text style={[styles.badgeText, { color: getStatusColor(invoice.status) }]}>
                {getStatusLabel(invoice.status)}
              </Text>
            </View>
            <Text style={styles.client}>{invoice.client?.name}</Text>

            {invoice.items && invoice.items.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Line Items</Text>
                {invoice.items.map(item => (
                  <View key={item.id} style={styles.itemRow}>
                    <Text style={styles.itemDesc} numberOfLines={1}>{item.description}</Text>
                    <Text style={styles.itemAmount}>${item.amount.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            )}

            {invoice.total !== undefined && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${invoice.total.toFixed(2)}</Text>
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
  number: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  badge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 8, alignSelf: 'flex-start', marginTop: spacing.md },
  badgeText: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  client: { fontSize: 15, color: colors.textSecondary, marginTop: spacing.md },
  section: { marginTop: spacing.xl },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.surface,
    borderRadius: 10, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  itemDesc: { fontSize: 15, color: colors.textPrimary, flex: 1 },
  itemAmount: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl,
    paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border,
  },
  totalLabel: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  totalValue: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
})
