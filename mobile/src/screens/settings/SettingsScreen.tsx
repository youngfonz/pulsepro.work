import React from 'react'
import { Text, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth, useUser } from '@clerk/expo'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { mockMe } from '../../data/mock'

export function SettingsScreen() {
  const { signOut } = useAuth()
  const { user } = useUser()
  const me = mockMe

  const planLabel = me.plan === 'pro' ? 'Pro' : me.plan === 'team' ? 'Team' : 'Free'

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
              <View style={[styles.planBadge, me.plan === 'pro' && styles.planPro]}>
                <Text style={[styles.planText, me.plan === 'pro' && styles.planProText]}>{planLabel}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>{me.status === 'active' ? 'Active' : me.status}</Text>
            </View>
          </View>
        </View>

        {/* Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage</Text>
          <View style={styles.infoCard}>
            <UsageRow label="Projects" current={me.usage.projects.current} limit={me.usage.projects.limit} />
            <UsageRow label="Tasks" current={me.usage.tasks.current} limit={me.usage.tasks.limit} />
            <UsageRow label="Clients" current={me.usage.clients.current} limit={me.usage.clients.limit} />
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
        <TouchableOpacity style={styles.signOutButton} onPress={() => signOut()}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function UsageRow({ label, current, limit }: { label: string; current: number; limit: number }) {
  const isUnlimited = limit === -1
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
