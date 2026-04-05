import React from 'react'
import { Text, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth, useUser } from '@clerk/expo'
import { useSubscription } from '../../hooks/useSubscription'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'

export function SettingsScreen() {
  const { signOut } = useAuth()
  const { user } = useUser()
  const { data: sub } = useSubscription()

  const plan = sub?.plan ?? 'free'
  const status = sub?.status ?? 'active'
  const planLabel = plan === 'pro' ? 'Pro' : plan === 'team' ? 'Team' : 'Free'

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0] ?? 'U').toUpperCase()}
              </Text>
            </View>
            <View style={styles.accountInfo}>
              {user?.firstName && (
                <Text style={styles.name}>{user.firstName} {user.lastName ?? ''}</Text>
              )}
              <Text style={styles.email}>{user?.emailAddresses?.[0]?.emailAddress ?? ''}</Text>
            </View>
          </View>
        </View>

        {/* Plan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current plan</Text>
              <View style={[styles.planBadge, plan === 'pro' && styles.planPro]}>
                <Text style={[styles.planText, plan === 'pro' && styles.planProText]}>{planLabel}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>{status === 'active' ? 'Active' : status}</Text>
            </View>
          </View>
        </View>

        {/* Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage</Text>
          <View style={styles.infoCard}>
            <UsageRow label="Projects" current={sub?.usage.projects.current ?? 0} limit={sub?.usage.projects.limit ?? 0} />
            <UsageRow label="Tasks" current={sub?.usage.tasks.current ?? 0} limit={sub?.usage.tasks.limit ?? 0} />
            <UsageRow label="Clients" current={sub?.usage.clients.current ?? 0} limit={sub?.usage.clients.limit ?? 0} />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={() => signOut()} activeOpacity={0.7}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function UsageRow({ label, current, limit }: { label: string; current: number; limit: number | null }) {
  const isUnlimited = limit === null || limit === -1 || !isFinite(limit)
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>
        {current}{isUnlimited ? '' : ` / ${limit}`}
        {isUnlimited && <Text style={styles.unlimited}> Unlimited</Text>}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 12, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.lg,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  accountInfo: { flex: 1 },
  name: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  email: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  infoCard: {
    backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  infoLabel: { fontSize: 15, color: colors.textPrimary },
  infoValue: { fontSize: 15, color: colors.textSecondary },
  unlimited: { fontSize: 12, color: colors.success },
  planBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 6,
    backgroundColor: colors.surfaceAlt,
  },
  planPro: { backgroundColor: colors.primary + '20' },
  planText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  planProText: { color: colors.primary },
  signOutButton: {
    backgroundColor: colors.destructive, borderRadius: 10, padding: spacing.lg,
    alignItems: 'center', marginTop: spacing.md,
  },
  signOutText: { color: '#fff', fontSize: 17, fontWeight: '600' },
})
