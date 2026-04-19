import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Plus, Home, FolderKanban, CheckSquare, Calendar, MoreHorizontal, ArrowDown } from 'lucide-react-native'
import { onboardingColors } from './onboardingTheme'
import { fontFamily } from '../../theme'

export function FABVisual() {
  return (
    <View style={vis.container}>
      <View style={vis.header}>
        <View style={vis.miniLogo}>
          <Text style={vis.miniLogoText}>P</Text>
        </View>
        <Text style={vis.miniTitle}>Tasks</Text>
      </View>

      {/* Task list */}
      <View style={vis.taskRow}>
        <View style={vis.checkbox} />
        <View style={vis.taskLine} />
      </View>
      <View style={vis.taskRow}>
        <View style={vis.checkbox} />
        <View style={[vis.taskLine, { width: '50%' }]} />
      </View>
      <View style={vis.taskRow}>
        <View style={vis.checkbox} />
        <View style={[vis.taskLine, { width: '70%' }]} />
      </View>

      {/* Speed dial */}
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

      {/* FAB */}
      <View style={vis.fab}>
        <Plus size={22} color="#fff" />
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
    <View style={vis.container}>
      <View style={vis.contentPlaceholder}>
        <View style={vis.header}>
          <View style={vis.miniLogo}>
            <Text style={vis.miniLogoText}>P</Text>
          </View>
          <Text style={vis.miniTitle}>Home</Text>
        </View>
        <View style={[vis.placeholderBlock, { width: '60%', height: 14, marginTop: 18 }]} />
        <View style={[vis.placeholderBlock, { width: '80%', height: 10, marginTop: 8 }]} />
        <View style={[vis.placeholderBlock, { width: '40%', height: 10, marginTop: 8 }]} />
      </View>

      <View style={vis.tabBar}>
        {tabs.map((tab) => (
          <View key={tab.label} style={vis.tabItem}>
            <tab.icon size={18} color={tab.active ? onboardingColors.coral : '#b0b0b5'} />
            <Text style={[vis.tabLabel, tab.active && { color: onboardingColors.coral }]}>{tab.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export function PullRefreshVisual() {
  return (
    <View style={vis.container}>
      <View style={vis.pullIndicator}>
        <ArrowDown size={16} color={onboardingColors.coral} />
        <Text style={vis.pullText}>Pull to refresh</Text>
      </View>

      <View style={[vis.taskRow, { marginTop: 16 }]}>
        <View style={vis.checkbox} />
        <View style={vis.taskLine} />
        <View style={vis.taskMeta} />
      </View>
      <View style={vis.taskRow}>
        <View style={vis.checkbox} />
        <View style={[vis.taskLine, { width: '55%' }]} />
        <View style={[vis.taskMeta, { backgroundColor: '#f59e0b33' }]} />
      </View>
      <View style={vis.taskRow}>
        <View style={vis.checkbox} />
        <View style={[vis.taskLine, { width: '65%' }]} />
        <View style={vis.taskMeta} />
      </View>
    </View>
  )
}

export function ReadyVisual() {
  return (
    <View style={vis.container}>
      <View style={vis.header}>
        <View style={vis.miniLogo}>
          <Text style={vis.miniLogoText}>P</Text>
        </View>
        <Text style={vis.miniTitle}>Dashboard</Text>
      </View>

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

      {[
        { name: 'Finalize proposal', dot: onboardingColors.coral },
        { name: 'Review wireframes', dot: '#f59e0b' },
        { name: 'Send invoice', dot: '#b0b0b5' },
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
  container: { flex: 1, width: '100%', overflow: 'hidden' },

  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  miniLogo: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: onboardingColors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniLogoText: {
    fontFamily: fontFamily.displayExtraBold,
    fontSize: 12,
    color: '#fff',
  },
  miniTitle: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 14,
    color: onboardingColors.textPrimary,
  },

  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  checkbox: { width: 16, height: 16, borderRadius: 4, borderWidth: 1.5, borderColor: '#d1d1d6' },
  taskLine: { height: 10, backgroundColor: '#e5e5ea', borderRadius: 4, width: '60%' },
  taskMeta: {
    width: 32,
    height: 10,
    backgroundColor: onboardingColors.coralTint,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  taskName: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
    color: onboardingColors.textPrimary,
    flex: 1,
  },

  speedDialArea: { position: 'absolute', bottom: 60, right: 12, alignItems: 'flex-end', gap: 6 },
  speedDialOption: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  speedDialLabel: {
    fontFamily: fontFamily.bodyMedium,
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
    backgroundColor: '#c0c0c5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: onboardingColors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    paddingTop: 6,
    marginTop: 'auto',
    marginBottom: -12,
    marginHorizontal: -12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  tabItem: { alignItems: 'center', gap: 2 },
  tabLabel: { fontFamily: fontFamily.bodyMedium, fontSize: 9, color: '#8e8e93' },

  contentPlaceholder: { flex: 1, paddingTop: 6 },
  placeholderBlock: { height: 12, backgroundColor: '#f0f0f3', borderRadius: 4 },

  pullIndicator: { alignItems: 'center', gap: 4, paddingBottom: 8 },
  pullText: { fontFamily: fontFamily.bodyMedium, fontSize: 11, color: onboardingColors.coral },

  statsRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: '#f5f5f7', borderRadius: 10, padding: 10 },
  statValue: {
    fontFamily: fontFamily.displayExtraBold,
    fontSize: 20,
    color: onboardingColors.textPrimary,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 9,
    color: onboardingColors.textSecondary,
    marginTop: 2,
  },
  statBar: { height: 3, width: 20, borderRadius: 2, marginTop: 6, opacity: 0.7 },
})
