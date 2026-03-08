import React from 'react'
import { Text, ScrollView, RefreshControl, StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Send, CheckCircle } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { useInvoiceDetail, useSendInvoice, useMarkInvoicePaid } from '../../hooks/useInvoices'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { getStatusLabel, getStatusColor } from '../../utils/status'
import { formatDate } from '../../utils/dates'
import type { MoreStackParamList } from '../../types/navigation'

type Props = NativeStackScreenProps<MoreStackParamList, 'InvoiceDetail'>

export function InvoiceDetailScreen({ route }: Props) {
  const { id } = route.params
  const { data: invoice, isLoading, refetch } = useInvoiceDetail(id)
  const sendMutation = useSendInvoice()
  const markPaidMutation = useMarkInvoicePaid()

  const handleSend = () => {
    Alert.alert('Send Invoice', `Send invoice ${invoice?.number} to ${invoice?.client?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send', onPress: async () => {
          try {
            await sendMutation.mutateAsync(id)
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to send invoice')
          }
        }
      },
    ])
  }

  const handleMarkPaid = () => {
    Alert.alert('Mark as Paid', `Mark invoice ${invoice?.number} as paid?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Paid', onPress: async () => {
          try {
            await markPaidMutation.mutateAsync(id)
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to mark invoice as paid')
          }
        }
      },
    ])
  }

  const canSend = invoice && invoice.status === 'draft'
  const canMarkPaid = invoice && (invoice.status === 'sent' || invoice.status === 'overdue')

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
            {invoice.project && (
              <Text style={styles.project}>{invoice.project.name}</Text>
            )}
            {invoice.dueDate && (
              <Text style={styles.due}>Due: {formatDate(invoice.dueDate)}</Text>
            )}

            {invoice.fromName && (
              <View style={styles.fromSection}>
                <Text style={styles.fromLabel}>From</Text>
                <Text style={styles.fromValue}>{invoice.fromName}</Text>
                {invoice.fromEmail && <Text style={styles.fromEmail}>{invoice.fromEmail}</Text>}
              </View>
            )}

            {invoice.items && invoice.items.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Line Items</Text>
                {invoice.items.map(item => (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemDesc} numberOfLines={1}>{item.description}</Text>
                      <Text style={styles.itemQty}>{item.quantity} x ${item.rate.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.itemAmount}>${item.amount.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            )}

            {invoice.subtotal !== undefined && (
              <View style={styles.totalsSection}>
                <View style={styles.totalLine}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <Text style={styles.totalValue}>${invoice.subtotal.toFixed(2)}</Text>
                </View>
                {invoice.taxRate > 0 && (
                  <View style={styles.totalLine}>
                    <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%)</Text>
                    <Text style={styles.totalValue}>${((invoice.subtotal ?? 0) * invoice.taxRate / 100).toFixed(2)}</Text>
                  </View>
                )}
              </View>
            )}

            {invoice.total !== undefined && (
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>Total</Text>
                <Text style={styles.grandTotalValue}>${invoice.total.toFixed(2)}</Text>
              </View>
            )}

            {invoice.notes && (
              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>Notes</Text>
                <Text style={styles.notesText}>{invoice.notes}</Text>
              </View>
            )}

            {invoice.paidAt && (
              <Text style={styles.paidAt}>Paid on {formatDate(invoice.paidAt)}</Text>
            )}

            {(canSend || canMarkPaid) && (
              <View style={styles.actions}>
                {canSend && (
                  <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sendMutation.isPending}>
                    {sendMutation.isPending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Send size={18} color="#fff" />
                        <Text style={styles.sendButtonText}>Send Invoice</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                {canMarkPaid && (
                  <TouchableOpacity style={styles.paidButton} onPress={handleMarkPaid} disabled={markPaidMutation.isPending}>
                    {markPaidMutation.isPending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <CheckCircle size={18} color="#fff" />
                        <Text style={styles.paidButtonText}>Mark as Paid</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
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
  content: { padding: spacing.lg, paddingBottom: 40 },
  number: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  badge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 8, alignSelf: 'flex-start', marginTop: spacing.md },
  badgeText: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  client: { fontSize: 15, color: colors.textSecondary, marginTop: spacing.md },
  project: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs },
  due: { fontSize: 15, color: colors.textSecondary, marginTop: spacing.sm },
  fromSection: { marginTop: spacing.lg },
  fromLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs },
  fromValue: { fontSize: 15, color: colors.textPrimary },
  fromEmail: { fontSize: 13, color: colors.textSecondary },
  section: { marginTop: spacing.xl },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  itemInfo: { flex: 1 },
  itemDesc: { fontSize: 15, color: colors.textPrimary },
  itemQty: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  itemAmount: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginLeft: spacing.md },
  totalsSection: { marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  totalLabel: { fontSize: 15, color: colors.textSecondary },
  totalValue: { fontSize: 15, color: colors.textPrimary },
  grandTotalRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm,
    paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border,
  },
  grandTotalLabel: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  grandTotalValue: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  notesSection: { marginTop: spacing.xl },
  notesLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs },
  notesText: { fontSize: 15, color: colors.textPrimary, lineHeight: 22 },
  paidAt: { fontSize: 13, color: colors.success, marginTop: spacing.lg, fontWeight: '600' },
  actions: { marginTop: spacing.xl, gap: spacing.sm },
  sendButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, borderRadius: 10, padding: spacing.lg,
  },
  sendButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  paidButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.success, borderRadius: 10, padding: spacing.lg,
  },
  paidButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
})
