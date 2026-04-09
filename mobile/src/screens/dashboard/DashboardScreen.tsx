import React from 'react'
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg'
import { useNavigation, CommonActions } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { FolderKanban, CheckSquare, Users, Search, ChevronRight, AlertTriangle, Plus, CircleCheckBig } from 'lucide-react-native'
import { SpeedDialFAB } from '../../components/SpeedDialFAB'
import { useCreateTask } from '../../hooks/useTasks'
import { parseTaskFromVoice } from '../../lib/voice'
import { AnimatedEntry } from '../../components/AnimatedEntry'
import { useAuth, useUser } from '@clerk/expo'
import { useDashboard } from '../../hooks/useDashboard'
import { useInsights } from '../../hooks/useInsights'
import { useRecentlyViewed, RecentItem } from '../../hooks/useRecentlyViewed'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ONBOARDING_KEY_PREFIX } from '../../hooks/useOnboardingStatus'
import type { Insight } from '../../api/insights'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import { getHealthColor } from '../../utils/status'
import type { DashboardStackParamList } from '../../types/navigation'

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
  const day = now.getDay()
  let greeting: string
  if (hour < 5) greeting = 'Late night grind'
  else if (hour < 12) greeting = 'Good morning'
  else if (hour < 17) greeting = 'Good afternoon'
  else if (hour < 21) greeting = 'Good evening'
  else greeting = 'Burning the midnight oil'
  if (day === 5 && hour >= 12) greeting = 'Happy Friday'
  if (day === 1 && hour < 12) greeting = 'New week, let\'s go'
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  return { greeting, dateStr }
}

function formatDate(date: string | Date | null | undefined) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const priorityColors: Record<string, { bg: string; text: string }> = {
  urgent: { bg: '#fef2f2', text: '#dc2626' },
  high: { bg: '#fff7ed', text: '#ea580c' },
  medium: { bg: '#fefce8', text: '#ca8a04' },
  low: { bg: '#f0fdf4', text: '#16a34a' },
}

function capFirst(s: string | undefined) {
  if (!s) return 'Medium'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<DashboardStackParamList>>()
  const { signOut } = useAuth()
  const { user } = useUser()
  const { data, isLoading, isFetching, error, refetch } = useDashboard()
  const { data: insightsData } = useInsights()
  const { items: recentItems } = useRecentlyViewed(user?.id)
  const { greeting, dateStr } = useGreeting()
  const createTask = useCreateTask()

  const handleVoiceCreate = (transcript: string) => {
    const parsed = parseTaskFromVoice(transcript)
    if (parsed.title.length < 3) {
      navigation.navigate('CreateTask')
      return
    }
    const payload: Record<string, unknown> = { title: parsed.title }
    if (parsed.description) payload.description = parsed.description
    if (parsed.priority) payload.priority = parsed.priority
    if (parsed.dueDate) payload.dueDate = parsed.dueDate
    createTask.mutate(payload)
  }

  const goToSettings = () => {
    navigation.dispatch(CommonActions.navigate({ name: 'MoreTab', params: { screen: 'Settings' } }))
  }
  const goToRecent = (item: RecentItem) => {
    if (item.type === 'project') {
      navigation.dispatch(CommonActions.navigate({ name: 'ProjectsTab', params: { screen: 'ProjectDetail', params: { id: item.id } } }))
    } else if (item.type === 'task') {
      navigation.dispatch(CommonActions.navigate({ name: 'TasksTab', params: { screen: 'TaskDetail', params: { id: item.id } } }))
    } else if (item.type === 'client') {
      navigation.dispatch(CommonActions.navigate({ name: 'MoreTab', params: { screen: 'ClientDetail', params: { id: item.id } } }))
    }
  }
  const goToProjects = () => navigation.dispatch(CommonActions.navigate({ name: 'ProjectsTab' }))
  const goToTasks = () => navigation.dispatch(CommonActions.navigate({ name: 'TasksTab' }))
  const goToClients = () => navigation.dispatch(CommonActions.navigate({ name: 'MoreTab', params: { screen: 'ClientsList' } }))
  const goToTask = (id: string) => navigation.dispatch(CommonActions.navigate({ name: 'TasksTab', params: { screen: 'TaskDetail', params: { id } } }))
  const goToProject = (id: string) => navigation.dispatch(CommonActions.navigate({ name: 'ProjectsTab', params: { screen: 'ProjectDetail', params: { id } } }))

  const firstName = user?.firstName || 'there'
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || 'U'
    : 'U'
  const stats = data?.stats
  const completed = stats ? stats.totalTasks - stats.pendingTasks : 0

  const pProg = stats && stats.totalProjects > 0 ? stats.activeProjects / stats.totalProjects : 0
  const tProg = stats && stats.totalTasks > 0 ? completed / stats.totalTasks : 0
  const dProg = stats && stats.totalClients > 0 ? stats.activeClients / stats.totalClients : 0

  const hasOverdue = data?.overdueTasks && data.overdueTasks.length > 0
  const hasProjectsDue = data?.projectsDueThisWeek && data.projectsDueThisWeek.length > 0
  const hasHealth = data?.projectHealth && data.projectHealth.length > 0
  const hasInsights = insightsData?.insights && insightsData.insights.length > 0
  const hasRecent = recentItems.length > 0

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeTop} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isFetching && !!data} onRefresh={refetch} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <AnimatedEntry delay={0}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.dateText}>{dateStr}</Text>
            </View>
            <TouchableOpacity style={styles.searchBtn} onPress={() => navigation.navigate('Search')} activeOpacity={0.7}>
              <Search size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatar} onPress={goToSettings} activeOpacity={0.7}>
              <Text style={styles.avatarText}>{initials}</Text>
            </TouchableOpacity>
          </View>
        </AnimatedEntry>

        {/* Quick Actions — like desktop Add Task / Add Project buttons */}
        <AnimatedEntry delay={40}>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('CreateTask')} activeOpacity={0.7}>
              <View style={styles.quickBtnIcon}>
                <Plus size={14} color={colors.primary} />
              </View>
              <Text style={styles.quickBtnText}>Add Task</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('CreateProject')} activeOpacity={0.7}>
              <View style={[styles.quickBtnIcon, { backgroundColor: colors.primary }]}>
                <Plus size={14} color="#fff" />
              </View>
              <Text style={styles.quickBtnText}>Add Project</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('CreateClient')} activeOpacity={0.7}>
              <View style={styles.quickBtnIcon}>
                <Plus size={14} color={colors.primary} />
              </View>
              <Text style={styles.quickBtnText}>Add Client</Text>
            </TouchableOpacity>
          </View>
        </AnimatedEntry>

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
              <TouchableOpacity style={styles.signOutBtn} onPress={() => signOut()} activeOpacity={0.7}>
                <Text style={styles.signOutText}>Sign Out & Re-Login</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Activity Rings Card */}
        {stats && (
          <AnimatedEntry delay={80}>
            <View style={styles.card}>
              <View style={styles.ringsRow}>
                <TouchableOpacity onPress={goToProjects} activeOpacity={0.7} style={styles.ringsWrap}>
                  <Svg width={140} height={140} viewBox="0 0 100 100">
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
                    <Circle cx={50} cy={50} r={42} fill="none" stroke={RING.projects.bg} strokeWidth={6} />
                    <Circle cx={50} cy={50} r={32} fill="none" stroke={RING.tasks.bg} strokeWidth={6} />
                    <Circle cx={50} cy={50} r={22} fill="none" stroke={RING.due.bg} strokeWidth={6} />
                    <Circle cx={50} cy={50} r={42} fill="none" stroke="url(#pg)" strokeWidth={6}
                      strokeLinecap="round" strokeDasharray={`${pProg * 264} 264`} rotation={-90} origin="50,50" />
                    <Circle cx={50} cy={50} r={32} fill="none" stroke="url(#tg)" strokeWidth={6}
                      strokeLinecap="round" strokeDasharray={`${tProg * 201} 201`} rotation={-90} origin="50,50" />
                    <Circle cx={50} cy={50} r={22} fill="none" stroke="url(#dg)" strokeWidth={6}
                      strokeLinecap="round" strokeDasharray={`${dProg * 138} 138`} rotation={-90} origin="50,50" />
                  </Svg>
                </TouchableOpacity>

                <View style={styles.legendCol}>
                  <TouchableOpacity style={styles.legendItem} onPress={goToProjects} activeOpacity={0.7}>
                    <View style={[styles.legendDot, { backgroundColor: RING.projects.b }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.legendValue}>{stats.activeProjects}<Text style={styles.legendTotal}>/{stats.totalProjects}</Text></Text>
                      <Text style={styles.legendLabel}>Active Projects</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.legendItem} onPress={goToTasks} activeOpacity={0.7}>
                    <View style={[styles.legendDot, { backgroundColor: RING.tasks.b }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.legendValue}>{completed}<Text style={styles.legendTotal}>/{stats.totalTasks}</Text></Text>
                      <Text style={styles.legendLabel}>Tasks Done</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.legendItem} onPress={goToClients} activeOpacity={0.7}>
                    <View style={[styles.legendDot, { backgroundColor: RING.due.b }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.legendValue}>{stats.activeClients}<Text style={styles.legendTotal}>/{stats.totalClients}</Text></Text>
                      <Text style={styles.legendLabel}>Clients</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </AnimatedEntry>
        )}

        {/* Overdue Tasks */}
        {hasOverdue && (
          <AnimatedEntry delay={160}>
            <View style={[styles.card, styles.overdueCard]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <AlertTriangle size={16} color="#f43f5e" />
                  <Text style={[styles.cardTitle, { color: '#f43f5e' }]}>Overdue</Text>
                </View>
                <TouchableOpacity onPress={goToTasks} activeOpacity={0.7}>
                  <Text style={styles.viewAll}>View all</Text>
                </TouchableOpacity>
              </View>
              {data!.overdueTasks.map((task, i) => {
                const isLast = i === data!.overdueTasks.length - 1
                const pColor = priorityColors[task.priority] || priorityColors.medium
                return (
                  <TouchableOpacity key={task.id} style={[styles.listRow, isLast && { borderBottomWidth: 0 }]} onPress={() => goToTask(task.id)} activeOpacity={0.7}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.listTitle} numberOfLines={1}>{task.title}</Text>
                      <Text style={styles.listMeta}>{task.project?.name ?? 'Quick task'} · Due {formatDate(task.dueDate)}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: pColor.bg }]}>
                      <Text style={[styles.badgeText, { color: pColor.text }]}>{capFirst(task.priority)}</Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </AnimatedEntry>
        )}

        {/* Upcoming — always shown */}
        {data && (
          <AnimatedEntry delay={240}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Upcoming</Text>
                <TouchableOpacity onPress={goToTasks} activeOpacity={0.7}>
                  <Text style={styles.viewAll}>View all</Text>
                </TouchableOpacity>
              </View>
              {hasProjectsDue ? (
                <>
                  {data.projectsDueThisWeek.map((project: any, i: number) => {
                    const isLast = i === data.projectsDueThisWeek.length - 1
                    const pColor = priorityColors[project.priority] || priorityColors.medium
                    return (
                      <TouchableOpacity key={project.id} style={[styles.listRow, isLast && { borderBottomWidth: 0 }]} onPress={() => goToProject(project.id)} activeOpacity={0.7}>
                        <View style={styles.listIcon}>
                          <FolderKanban size={14} color={colors.textSecondary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.listTitle} numberOfLines={1}>{project.name}</Text>
                          <Text style={styles.listMeta}>{project.client?.name} · Due {formatDate(project.dueDate)}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: pColor.bg }]}>
                          <Text style={[styles.badgeText, { color: pColor.text }]}>{capFirst(project.priority)}</Text>
                        </View>
                      </TouchableOpacity>
                    )
                  })}
                </>
              ) : (
                <View style={styles.emptyState}>
                  <CircleCheckBig size={28} color="#22c55e" />
                  <Text style={styles.emptyText}>Nothing due this week</Text>
                </View>
              )}
            </View>
          </AnimatedEntry>
        )}

        {/* Insights */}
        {hasInsights && (
          <AnimatedEntry delay={320}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Insights</Text>
              </View>
              {insightsData!.insights.map((insight: Insight) => (
                <View key={insight.id} style={styles.insightRow}>
                  <View style={[styles.insightDot, { backgroundColor: insightDotColor[insight.color] ?? insightDotColor.blue }]} />
                  <Text style={styles.insightMessage}>{insight.message}</Text>
                </View>
              ))}
            </View>
          </AnimatedEntry>
        )}

        {/* Project Health — always shown when we have data */}
        {data && (
          <AnimatedEntry delay={400}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Project Health</Text>
                <TouchableOpacity onPress={goToProjects} activeOpacity={0.7}>
                  <Text style={styles.viewAll}>View all</Text>
                </TouchableOpacity>
              </View>
              {hasHealth ? (
                data.projectHealth.slice(0, 6).map((p, i) => {
                  const healthLabel = p.label === 'completed' ? 'Done' : p.label === 'healthy' ? 'Healthy' : p.label === 'at_risk' ? 'At Risk' : 'Critical'
                  const healthColor = getHealthColor(p.label)
                  const isLast = i === Math.min(data.projectHealth.length, 6) - 1
                  return (
                    <TouchableOpacity key={p.projectId} style={[styles.listRow, isLast && { borderBottomWidth: 0 }]} onPress={() => goToProject(p.projectId)} activeOpacity={0.7}>
                      <View style={[styles.healthBar, { backgroundColor: healthColor }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.listTitle} numberOfLines={1}>{p.projectName}</Text>
                        <Text style={styles.listMeta}>{p.clientName ? `${p.clientName} · ` : ''}{p.completedTasks}/{p.totalTasks} tasks</Text>
                      </View>
                      <View style={[styles.healthBadge, { backgroundColor: healthColor + '15' }]}>
                        <View style={[styles.healthBadgeDot, { backgroundColor: healthColor }]} />
                        <Text style={[styles.healthBadgeText, { color: healthColor }]}>{healthLabel}</Text>
                      </View>
                    </TouchableOpacity>
                  )
                })
              ) : (
                <View style={styles.emptyState}>
                  <Text style={{ fontSize: 32 }}>📁</Text>
                  <Text style={styles.emptyText}>No projects yet</Text>
                </View>
              )}
            </View>
          </AnimatedEntry>
        )}

        {/* Recently Viewed — always shown */}
        {data && (
          <AnimatedEntry delay={480}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Recently Viewed</Text>
              </View>
              {hasRecent ? (
                recentItems.slice(0, 5).map((item, i) => {
                  const isLast = i === Math.min(recentItems.length, 5) - 1
                  const iconBg = item.type === 'project' ? '#3b82f610' : item.type === 'task' ? '#22c55e10' : '#f59e0b10'
                  const iconColor = item.type === 'project' ? colors.primary : item.type === 'task' ? colors.success : colors.warning
                  return (
                    <TouchableOpacity key={`${item.type}-${item.id}`} style={[styles.listRow, isLast && { borderBottomWidth: 0 }]} onPress={() => goToRecent(item)} activeOpacity={0.7}>
                      <View style={[styles.listIcon, { backgroundColor: iconBg }]}>
                        {item.type === 'project' ? <FolderKanban size={14} color={iconColor} /> :
                         item.type === 'task' ? <CheckSquare size={14} color={iconColor} /> :
                         <Users size={14} color={iconColor} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.listTitle} numberOfLines={1}>{item.name}</Text>
                        {item.subtitle ? <Text style={styles.listMeta} numberOfLines={1}>{item.subtitle}</Text> : null}
                      </View>
                      <ChevronRight size={16} color="#d1d5db" />
                    </TouchableOpacity>
                  )
                })
              ) : (
                <View style={styles.emptyState}>
                  <Text style={{ fontSize: 32 }}>👀</Text>
                  <Text style={styles.emptyText}>View a project or task to see it here</Text>
                </View>
              )}
            </View>
          </AnimatedEntry>
        )}

        {/* DEV: Reset onboarding for testing */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.devResetBtn}
            onPress={async () => {
              const key = `${ONBOARDING_KEY_PREFIX}-${user?.id}`
              await AsyncStorage.removeItem(key)
              // Also remove answers
              await AsyncStorage.removeItem(`@pulsepro:onboarding-answers-${user?.id}`)
              Alert.alert(
                'Onboarding Reset',
                'Reload the app (shake → Reload) to see onboarding again.',
              )
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.devResetText}>Reset Onboarding (Dev)</Text>
          </TouchableOpacity>
        )}


        <View style={{ height: 100 }} />
      </ScrollView>
      <SpeedDialFAB
        onAddTask={() => navigation.navigate('CreateTask')}
        onAddProject={() => navigation.navigate('CreateProject')}
        onAddClient={() => navigation.navigate('CreateClient')}
        onVoiceCreate={handleVoiceCreate}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeTop: {
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  quickBtnIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(229, 77, 46, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  overdueCard: {
    borderLeftWidth: 2,
    borderLeftColor: '#f43f5e',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  // List rows
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  listIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  listMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },

  // Badges
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Rings
  ringsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  ringsWrap: {
    width: 140,
    height: 140,
  },
  legendCol: {
    flex: 1,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendValue: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  legendTotal: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  legendLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Health
  healthBar: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  healthBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  healthBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Insights
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  insightMessage: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },

  // Utility
  centered: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 12,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorMessage: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 40,
  },
  errorHint: {
    color: colors.primary,
    fontSize: 13,
  },
  signOutBtn: {
    marginTop: 16,
    backgroundColor: colors.destructive,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  signOutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  devResetBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  devResetText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
})
