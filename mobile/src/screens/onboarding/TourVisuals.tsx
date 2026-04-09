import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Plus, Home, FolderKanban, CheckSquare, Calendar, MoreHorizontal, ArrowDown } from 'lucide-react-native'
import { onboardingColors } from './onboardingTheme'

export function FABVisual() {
  return (
    <View style={vis.mockPhone}>
      {/* Mini task list */}
      <View style={vis.taskRow}>
        <View style={[vis.checkbox, { borderColor: '#d1d1d6' }]} />
        <View style={vis.taskLine} />
      </View>
      <View style={vis.taskRow}>
        <View style={[vis.checkbox, { borderColor: '#d1d1d6' }]} />
        <View style={[vis.taskLine, { width: '50%' }]} />
      </View>
      <View style={vis.taskRow}>
        <View style={[vis.checkbox, { borderColor: '#d1d1d6' }]} />
        <View style={[vis.taskLine, { width: '70%' }]} />
      </View>

      {/* Speed dial expanded */}
      <View style={vis.speedDialArea}>
        <View style={vis.speedDialOption}>
          <Text style={vis.speedDialLabel}>New Task</Text>
          <View style={vis.speedDialDot}>
            <CheckSquare size={12} color="#fff" />
          </View>
        </View>
        <View style={vis.speedDialOption}>
          <Text style={vis.speedDialLabel}>New Project</Text>
          <View style={vis.speedDialDot}>
            <FolderKanban size={12} color="#fff" />
          </View>
        </View>
      </View>

      {/* FAB button */}
      <View style={vis.fab}>
        <Plus size={24} color="#fff" />
      </View>
    </View>
  )
}

export function TabsVisual() {
  const tabs = [
    { icon: Home, label: 'Home', active: true },
    { icon: FolderKanban, label: 'Projects', active: false },
    { icon: CheckSquare, label: 'Tasks', active: false },
    { icon: Calendar, label: 'Calendar', active: false },
    { icon: MoreHorizontal, label: 'More', active: false },
  ]

  return (
    <View style={vis.mockPhone}>
      {/* Content area placeholder */}
      <View style={vis.contentPlaceholder}>
        <View style={[vis.placeholderBlock, { width: '60%', height: 14 }]} />
        <View style={[vis.placeholderBlock, { width: '80%', height: 10, marginTop: 8 }]} />
        <View style={[vis.placeholderBlock, { width: '40%', height: 10, marginTop: 8 }]} />
      </View>

      {/* Tab bar */}
      <View style={vis.tabBar}>
        {tabs.map((tab) => (
          <View key={tab.label} style={vis.tabItem}>
            <tab.icon
              size={20}
              color={tab.active ? onboardingColors.coral : '#666'}
            />
            <Text
              style={[
                vis.tabLabel,
                tab.active && { color: onboardingColors.coral },
              ]}
            >
              {tab.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export function PullRefreshVisual() {
  return (
    <View style={vis.mockPhone}>
      {/* Pull indicator */}
      <View style={vis.pullIndicator}>
        <ArrowDown size={16} color={onboardingColors.coral} />
        <Text style={vis.pullText}>Pull to refresh</Text>
      </View>

      {/* Task list being pulled */}
      <View style={[vis.taskRow, { marginTop: 16 }]}>
        <View style={[vis.checkbox, { borderColor: '#d1d1d6' }]} />
        <View style={vis.taskLine} />
        <View style={vis.taskMeta} />
      </View>
      <View style={vis.taskRow}>
        <View style={[vis.checkbox, { borderColor: '#d1d1d6' }]} />
        <View style={[vis.taskLine, { width: '55%' }]} />
        <View style={[vis.taskMeta, { backgroundColor: '#f59e0b33' }]} />
      </View>
      <View style={vis.taskRow}>
        <View style={[vis.checkbox, { borderColor: '#d1d1d6' }]} />
        <View style={[vis.taskLine, { width: '65%' }]} />
        <View style={vis.taskMeta} />
      </View>
    </View>
  )
}

export function ReadyVisual() {
  return (
    <View style={vis.mockPhone}>
      {/* Mini header */}
      <View style={vis.miniHeader}>
        <View style={vis.miniLogo}>
          <Text style={vis.miniLogoText}>P</Text>
        </View>
        <Text style={vis.miniTitle}>Dashboard</Text>
      </View>

      {/* Stats row */}
      <View style={vis.statsRow}>
        {[
          { label: 'Active', value: '3', color: onboardingColors.coral },
          { label: 'Due', value: '1', color: '#f59e0b' },
          { label: 'Done', value: '5', color: '#22c55e' },
        ].map((stat) => (
          <View key={stat.label} style={vis.statCard}>
            <Text style={vis.statValue}>{stat.value}</Text>
            <Text style={vis.statLabel}>{stat.label}</Text>
            <View style={[vis.statBar, { backgroundColor: stat.color }]} />
          </View>
        ))}
      </View>

      {/* Task previews */}
      {[
        { name: 'Finalize proposal', dot: onboardingColors.coral },
        { name: 'Review wireframes', dot: '#f59e0b' },
        { name: 'Send invoice', dot: '#666' },
      ].map((task) => (
        <View key={task.name} style={vis.taskRow}>
          <View style={[vis.dot, { backgroundColor: task.dot }]} />
          <Text style={vis.taskName}>{task.name}</Text>
        </View>
      ))}
    </View>
  )
}

const vis = StyleSheet.create({
  mockPhone: {
    backgroundColor: onboardingColors.surface,
    borderRadius: 20,
    padding: 16,
    width: 260,
    minHeight: 240,
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  // Task list items
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  taskLine: {
    height: 10,
    backgroundColor: '#e5e5ea',
    borderRadius: 4,
    width: '60%',
  },
  taskMeta: {
    width: 32,
    height: 10,
    backgroundColor: onboardingColors.coralTint,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  taskName: {
    fontSize: 12,
    color: onboardingColors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },

  // Speed dial
  speedDialArea: {
    position: 'absolute',
    bottom: 60,
    right: 16,
    alignItems: 'flex-end',
    gap: 8,
  },
  speedDialOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speedDialLabel: {
    fontSize: 11,
    color: onboardingColors.textPrimary,
    backgroundColor: '#f0f0f3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  speedDialDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e5ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: onboardingColors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    paddingTop: 8,
    marginTop: 'auto',
  },
  tabItem: {
    alignItems: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 9,
    color: '#8e8e93',
    fontWeight: '500',
  },

  // Content placeholder
  contentPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  placeholderBlock: {
    height: 12,
    backgroundColor: '#f0f0f3',
    borderRadius: 4,
  },

  // Pull refresh
  pullIndicator: {
    alignItems: 'center',
    gap: 4,
    paddingBottom: 8,
  },
  pullText: {
    fontSize: 11,
    color: onboardingColors.coral,
    fontWeight: '500',
  },

  // Mini dashboard
  miniHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  miniLogo: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: onboardingColors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniLogoText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
  },
  miniTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: onboardingColors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f0f0f3',
    borderRadius: 10,
    padding: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: onboardingColors.textPrimary,
  },
  statLabel: {
    fontSize: 9,
    color: onboardingColors.textSecondary,
    marginTop: 2,
  },
  statBar: {
    height: 3,
    width: 20,
    borderRadius: 2,
    marginTop: 6,
    opacity: 0.6,
  },
})
