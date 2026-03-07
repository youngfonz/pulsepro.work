import React from 'react'
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg'
import { useAuth } from '@clerk/expo'
import { useDashboard } from '../../hooks/useDashboard'
import { useInsights } from '../../hooks/useInsights'
import type { Insight } from '../../api/insights'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { getHealthColor } from '../../utils/status'

const RING = {
  projects: { a: '#fb7185', b: '#f43f5e', bg: 'rgba(244,63,94,0.12)' },
  tasks:    { a: '#60a5fa', b: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  due:      { a: '#4ade80', b: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
}

const insightDotColor: Record<string, string> = {
  red: '#f43f5e',
  amber: '#f59e0b',
  blue: '#3b82f6',
  green: '#22c55e',
}

function useGreeting() {
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  return { greeting, dateStr }
}

export function DashboardScreen() {
  const { signOut } = useAuth()
  const { data, isLoading, isFetching, error, refetch } = useDashboard()
  const { data: insightsData } = useInsights()
  const { greeting, dateStr } = useGreeting()
  const stats = data?.stats
  const completed = stats ? stats.totalTasks - stats.pendingTasks : 0

  const pProg = stats && stats.totalProjects > 0 ? stats.activeProjects / stats.totalProjects : 0
  const tProg = stats && stats.totalTasks > 0 ? completed / stats.totalTasks : 0
  const cProg = stats && stats.totalClients > 0 ? stats.activeClients / stats.totalClients : 0

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={[styles.content, (!data && !isLoading) && styles.contentCenter]}
        refreshControl={<RefreshControl refreshing={isFetching && !!data} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>{greeting}</Text>
          <Text style={styles.greetingDate}>{dateStr}</Text>
        </View>

        {isLoading && !data && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        )}

        {error && (
          <View style={styles.centered}>
            <Text style={styles.errorTitle}>Couldn't load dashboard</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
            <Text style={styles.errorHint}>Pull down to retry</Text>
            {error.message === 'Not authenticated' && (
              <TouchableOpacity style={styles.signOutBtn} onPress={() => signOut()}>
                <Text style={styles.signOutText}>Sign Out & Re-Login</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Insights */}
        {insightsData?.insights && insightsData.insights.length > 0 && (
          <View style={styles.insightsCard}>
            <Text style={styles.insightsTitle}>Insights</Text>
            {insightsData.insights.map((insight: Insight) => (
              <View key={insight.id} style={styles.insightRow}>
                <View style={[styles.insightDot, { backgroundColor: insightDotColor[insight.color] ?? insightDotColor.blue }]} />
                <Text style={styles.insightMessage}>{insight.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Activity Rings */}
        {stats && (
          <View style={styles.ringsCard}>
            <View style={styles.ringsRow}>
              <View style={styles.ringsWrap}>
                <Svg width={180} height={180} viewBox="0 0 100 100">
                  <Defs>
                    <LinearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <Stop offset="0%" stopColor={RING.projects.a} />
                      <Stop offset="100%" stopColor={RING.projects.b} />
                    </LinearGradient>
                    <LinearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <Stop offset="0%" stopColor={RING.tasks.a} />
                      <Stop offset="100%" stopColor={RING.tasks.b} />
                    </LinearGradient>
                    <LinearGradient id="dg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <Stop offset="0%" stopColor={RING.due.a} />
                      <Stop offset="100%" stopColor={RING.due.b} />
                    </LinearGradient>
                  </Defs>
                  {/* Background */}
                  <Circle cx={50} cy={50} r={42} fill="none" stroke={RING.projects.bg} strokeWidth={6} />
                  <Circle cx={50} cy={50} r={32} fill="none" stroke={RING.tasks.bg} strokeWidth={6} />
                  <Circle cx={50} cy={50} r={22} fill="none" stroke={RING.due.bg} strokeWidth={6} />
                  {/* Progress */}
                  <Circle cx={50} cy={50} r={42} fill="none" stroke="url(#pg)" strokeWidth={6}
                    strokeLinecap="round" strokeDasharray={`${pProg * 264} 264`} rotation={-90} origin="50,50" />
                  <Circle cx={50} cy={50} r={32} fill="none" stroke="url(#tg)" strokeWidth={6}
                    strokeLinecap="round" strokeDasharray={`${tProg * 201} 201`} rotation={-90} origin="50,50" />
                  <Circle cx={50} cy={50} r={22} fill="none" stroke="url(#dg)" strokeWidth={6}
                    strokeLinecap="round" strokeDasharray={`${cProg * 138} 138`} rotation={-90} origin="50,50" />
                </Svg>
                <View style={styles.ringCenter}>
                  <Text style={styles.ringCenterNum}>{stats.pendingTasks}</Text>
                  <Text style={styles.ringCenterSub}>pending</Text>
                </View>
              </View>
              <View style={styles.legendCol}>
                <LegendRow color={RING.projects.b} label="Projects" value={`${stats.activeProjects}/${stats.totalProjects}`} />
                <LegendRow color={RING.tasks.b} label="Completed" value={`${completed}/${stats.totalTasks}`} />
                <LegendRow color={RING.due.b} label="Clients" value={`${stats.activeClients}/${stats.totalClients}`} />
              </View>
            </View>
          </View>
        )}

        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsGrid}>
            <StatCard label="Projects" value={stats.activeProjects} subtitle={`${stats.totalProjects} total`} />
            <StatCard label="Tasks" value={stats.pendingTasks} subtitle={`${stats.totalTasks} total`} />
            <StatCard label="Clients" value={stats.activeClients} subtitle={`${stats.totalClients} total`} />
          </View>
        )}

        {data?.overdueTasks && data.overdueTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overdue Tasks</Text>
            {data.overdueTasks.map(task => (
              <View key={task.id} style={styles.overdueRow}>
                <Text style={styles.overdueTitle} numberOfLines={1}>{task.title}</Text>
                <Text style={styles.overdueProject}>{task.project?.name ?? 'Quick task'}</Text>
              </View>
            ))}
          </View>
        )}

        {data?.projectHealth && data.projectHealth.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project Health</Text>
            {data.projectHealth.map(p => (
              <View key={p.projectId} style={styles.healthRow}>
                <View style={[styles.healthDot, { backgroundColor: getHealthColor(p.label) }]} />
                <View style={styles.healthInfo}>
                  <Text style={styles.healthName} numberOfLines={1}>{p.projectName}</Text>
                  <Text style={styles.healthMeta}>{p.completedTasks}/{p.totalTasks} tasks</Text>
                </View>
                <Text style={[styles.healthScore, { color: getHealthColor(p.label) }]}>{p.score}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function StatCard({ label, value, subtitle }: { label: string; value: number; subtitle: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  )
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <View style={styles.legendRow}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
      <Text style={styles.legendValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  greetingSection: { marginBottom: spacing.xl },
  greetingText: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  greetingDate: { fontSize: 15, color: colors.textSecondary, marginTop: 2 },
  insightsCard: {
    backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg, marginBottom: spacing.xl,
  },
  insightsTitle: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  insightDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  insightMessage: { flex: 1, fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  ringsCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: spacing.xl,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl,
  },
  ringsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  ringsWrap: { position: 'relative', width: 180, height: 180 },
  ringCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  ringCenterNum: { fontSize: 26, fontWeight: '700', color: colors.textPrimary },
  ringCenterSub: { fontSize: 12, color: colors.textSecondary, marginTop: -1 },
  legendCol: { flex: 1, gap: spacing.lg },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: 14, color: colors.textSecondary },
  legendValue: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  statsGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  statValue: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  statLabel: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs },
  statSubtitle: { fontSize: 11, color: colors.textSecondary },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  overdueRow: {
    backgroundColor: colors.surface, borderRadius: 10, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
  },
  overdueTitle: { fontSize: 15, color: colors.textPrimary, marginBottom: spacing.xs },
  overdueProject: { fontSize: 13, color: colors.textSecondary },
  healthRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: 10, padding: spacing.md, borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  healthDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.md },
  healthInfo: { flex: 1 },
  healthName: { fontSize: 15, color: colors.textPrimary },
  healthMeta: { fontSize: 13, color: colors.textSecondary },
  healthScore: { fontSize: 17, fontWeight: '600' },
  contentCenter: { flexGrow: 1, justifyContent: 'center' },
  centered: { alignItems: 'center', paddingVertical: spacing.xxxl },
  loadingText: { color: colors.textSecondary, fontSize: 15, marginTop: spacing.md },
  errorTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '600', marginBottom: spacing.sm },
  errorMessage: { color: colors.textSecondary, fontSize: 13, textAlign: 'center', marginBottom: spacing.md },
  errorHint: { color: colors.primary, fontSize: 13 },
  signOutBtn: {
    marginTop: spacing.lg, backgroundColor: colors.destructive, borderRadius: 8,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
  },
  signOutText: { color: '#fff', fontSize: 15, fontWeight: '600' },
})
