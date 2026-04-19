import React, { useEffect, useRef, useState } from 'react'
import { Animated, Easing, StyleSheet, View, Text } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { colors, fontFamily } from '../../theme'

const PHONE_WIDTH = 210
const PHONE_HEIGHT = 420
const DESKTOP_WIDTH = 320
const DESKTOP_HEIGHT = 220

function PhoneMock() {
  return (
    <View style={phoneStyles.chassis}>
      <View style={phoneStyles.notch} />
      <View style={phoneStyles.screen}>
        <View style={phoneStyles.header}>
          <View>
            <Text style={phoneStyles.eyebrow}>WEDNESDAY</Text>
            <Text style={phoneStyles.greeting}>Good morning</Text>
          </View>
          <View style={phoneStyles.avatar}>
            <Text style={phoneStyles.avatarText}>JD</Text>
          </View>
        </View>

        <View style={phoneStyles.activityCard}>
          <Svg width={68} height={68} viewBox="0 0 120 120">
            <Circle cx={60} cy={60} r={52} fill="none" stroke="rgba(229,77,46,0.18)" strokeWidth={12} />
            <Circle cx={60} cy={60} r={52} fill="none" stroke={colors.primary} strokeWidth={12} strokeDasharray="327 600" strokeLinecap="round" transform="rotate(-90 60 60)" />
            <Circle cx={60} cy={60} r={36} fill="none" stroke="rgba(245,158,11,0.18)" strokeWidth={12} />
            <Circle cx={60} cy={60} r={36} fill="none" stroke="#f59e0b" strokeWidth={12} strokeDasharray="176 600" strokeLinecap="round" transform="rotate(-90 60 60)" />
            <Circle cx={60} cy={60} r={20} fill="none" stroke="rgba(34,197,94,0.18)" strokeWidth={12} />
            <Circle cx={60} cy={60} r={20} fill="none" stroke="#22c55e" strokeWidth={12} strokeDasharray="86 600" strokeLinecap="round" transform="rotate(-90 60 60)" />
          </Svg>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={phoneStyles.bigNumber}>3</Text>
            <Text style={phoneStyles.statLabel}>DUE TODAY</Text>
            <Text style={phoneStyles.statSub}>
              <Text style={phoneStyles.statSubBold}>5</Text> active · <Text style={phoneStyles.statSubBold}>12</Text> done
            </Text>
          </View>
        </View>

        <Text style={phoneStyles.sectionLabel}>DUE TODAY</Text>
        {[
          { task: 'Brand guidelines', meta: 'Acme · today', high: true },
          { task: 'Review wireframes', meta: 'CloudSync · 4pm', high: false },
          { task: 'Send invoice #1042', meta: 'Bloom · today', high: true },
        ].map((t) => (
          <View key={t.task} style={phoneStyles.taskRow}>
            <View style={[phoneStyles.dot, { backgroundColor: t.high ? colors.primary : '#f59e0b' }]} />
            <View style={{ flex: 1 }}>
              <Text style={phoneStyles.taskTitle}>{t.task}</Text>
              <Text style={phoneStyles.taskMeta}>{t.meta}</Text>
            </View>
            <View style={phoneStyles.taskCheck} />
          </View>
        ))}

        <View style={phoneStyles.addPill}>
          <Text style={phoneStyles.addPillPlus}>＋</Text>
          <Text style={phoneStyles.addPillText}>Add task</Text>
        </View>
      </View>
    </View>
  )
}

function DesktopMock() {
  return (
    <View style={desktopStyles.chassis}>
      <View style={desktopStyles.topBar}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <View style={[desktopStyles.trafficDot, { backgroundColor: '#ff5f57' }]} />
          <View style={[desktopStyles.trafficDot, { backgroundColor: '#febc2e' }]} />
          <View style={[desktopStyles.trafficDot, { backgroundColor: '#28c840' }]} />
        </View>
        <View style={desktopStyles.urlBar}>
          <Text style={desktopStyles.urlText}>pulsepro.work/dashboard</Text>
        </View>
      </View>
      <View style={desktopStyles.appRow}>
        {/* Sidebar */}
        <View style={desktopStyles.sidebar}>
          <View style={desktopStyles.sidebarActive}>
            <Text style={desktopStyles.sidebarActiveText}>Dashboard</Text>
          </View>
          {['Projects', 'Tasks', 'Clients', 'Invoices'].map((s) => (
            <Text key={s} style={desktopStyles.sidebarItem}>{s}</Text>
          ))}
        </View>
        {/* Main */}
        <View style={desktopStyles.main}>
          <Text style={desktopStyles.mainTitle}>Good morning, Jordan</Text>
          <Text style={desktopStyles.mainSub}>3 tasks due today</Text>
          <View style={desktopStyles.grid}>
            <View style={desktopStyles.activityTile}>
              <Svg width={56} height={56} viewBox="0 0 120 120">
                <Circle cx={60} cy={60} r={52} fill="none" stroke="rgba(229,77,46,0.18)" strokeWidth={12} />
                <Circle cx={60} cy={60} r={52} fill="none" stroke={colors.primary} strokeWidth={12} strokeDasharray="240 600" strokeLinecap="round" transform="rotate(-90 60 60)" />
                <Circle cx={60} cy={60} r={36} fill="none" stroke="rgba(245,158,11,0.18)" strokeWidth={12} />
                <Circle cx={60} cy={60} r={36} fill="none" stroke="#f59e0b" strokeWidth={12} strokeDasharray="176 600" strokeLinecap="round" transform="rotate(-90 60 60)" />
              </Svg>
              <View style={{ marginLeft: 8 }}>
                <Text style={desktopStyles.tileNumber}>3</Text>
                <Text style={desktopStyles.tileLabel}>DUE</Text>
              </View>
            </View>
            <View style={desktopStyles.tasksTile}>
              <Text style={desktopStyles.tasksLabel}>DUE TODAY</Text>
              {[
                { t: 'Brand guidelines', high: true },
                { t: 'Review wireframes', high: false },
                { t: 'Send invoice #1042', high: true },
              ].map((row) => (
                <View key={row.t} style={desktopStyles.taskRow}>
                  <View style={[desktopStyles.taskDot, { backgroundColor: row.high ? colors.primary : '#f59e0b' }]} />
                  <Text style={desktopStyles.taskText} numberOfLines={1}>{row.t}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export function AppPreview() {
  const [active, setActive] = useState<0 | 1>(0)
  const phoneOpacity = useRef(new Animated.Value(1)).current
  const desktopOpacity = useRef(new Animated.Value(0)).current
  const float = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start()

    const interval = setInterval(() => {
      setActive((prev) => {
        const next: 0 | 1 = prev === 0 ? 1 : 0
        Animated.parallel([
          Animated.timing(phoneOpacity, { toValue: next === 0 ? 1 : 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(desktopOpacity, { toValue: next === 1 ? 1 : 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]).start()
        return next
      })
    }, 4200)

    return () => clearInterval(interval)
  }, [phoneOpacity, desktopOpacity, float])

  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] })

  return (
    <View style={styles.stage} pointerEvents="none">
      <View style={styles.glow} />
      <Animated.View
        style={[styles.phoneWrap, { opacity: phoneOpacity, transform: [{ translateY: floatY }] }]}
      >
        <PhoneMock />
      </Animated.View>
      <Animated.View
        style={[styles.desktopWrap, { opacity: desktopOpacity, transform: [{ translateY: floatY }] }]}
      >
        <DesktopMock />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  stage: {
    height: PHONE_HEIGHT + 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.primary,
    opacity: 0.3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 80,
  },
  phoneWrap: {
    position: 'absolute',
    width: PHONE_WIDTH,
    height: PHONE_HEIGHT,
  },
  desktopWrap: {
    position: 'absolute',
    width: DESKTOP_WIDTH,
    height: DESKTOP_HEIGHT,
    top: (PHONE_HEIGHT - DESKTOP_HEIGHT) / 2,
  },
})

const phoneStyles = StyleSheet.create({
  chassis: {
    width: PHONE_WIDTH,
    height: PHONE_HEIGHT,
    borderRadius: 40,
    backgroundColor: '#0d0d0d',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
  },
  notch: {
    position: 'absolute',
    top: 14,
    left: PHONE_WIDTH / 2 - 40,
    width: 80,
    height: 22,
    borderRadius: 14,
    backgroundColor: '#000',
    zIndex: 10,
  },
  screen: {
    flex: 1,
    borderRadius: 34,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingTop: 40,
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eyebrow: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.2,
    color: '#9ca3af',
  },
  greeting: {
    fontFamily: fontFamily.displayExtraBold,
    fontSize: 15,
    color: '#111',
    letterSpacing: -0.3,
    marginTop: 1,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffe8df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 9,
    color: colors.primary,
  },
  activityCard: {
    backgroundColor: '#fff8f5',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(229,77,46,0.10)',
  },
  bigNumber: {
    fontFamily: fontFamily.displayExtraBold,
    fontSize: 22,
    color: '#111',
    lineHeight: 22,
    letterSpacing: -0.6,
  },
  statLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 7.5,
    color: '#6b7280',
    letterSpacing: 1,
    marginTop: 2,
  },
  statSub: {
    fontFamily: fontFamily.body,
    fontSize: 9,
    color: '#6b7280',
    marginTop: 4,
  },
  statSubBold: {
    fontFamily: fontFamily.bodyBold,
    color: '#111',
  },
  sectionLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 7.5,
    letterSpacing: 1.2,
    color: '#9ca3af',
    marginBottom: 6,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.035)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  taskTitle: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 9.5,
    color: '#111',
  },
  taskMeta: {
    fontFamily: fontFamily.body,
    fontSize: 7.5,
    color: '#9ca3af',
    marginTop: 1,
  },
  taskCheck: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addPill: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  addPillPlus: {
    color: '#fff',
    fontFamily: fontFamily.bodyBold,
    fontSize: 11,
    marginRight: 6,
  },
  addPillText: {
    color: '#fff',
    fontFamily: fontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: -0.1,
  },
})

const desktopStyles = StyleSheet.create({
  chassis: {
    width: DESKTOP_WIDTH,
    height: DESKTOP_HEIGHT,
    borderRadius: 14,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  trafficDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  urlBar: {
    flex: 1,
    marginLeft: 14,
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingVertical: 3,
    alignItems: 'center',
  },
  urlText: {
    fontFamily: fontFamily.mono ?? fontFamily.body,
    fontSize: 8,
    color: '#6b7280',
  },
  appRow: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 74,
    borderRightWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    padding: 8,
    gap: 4,
  },
  sidebarActive: {
    backgroundColor: '#fff4ef',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  sidebarActiveText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 9,
    color: colors.primary,
  },
  sidebarItem: {
    fontFamily: fontFamily.body,
    fontSize: 9,
    color: '#6b7280',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  main: {
    flex: 1,
    padding: 10,
  },
  mainTitle: {
    fontFamily: fontFamily.displayExtraBold,
    fontSize: 12,
    color: '#111',
    letterSpacing: -0.3,
  },
  mainSub: {
    fontFamily: fontFamily.body,
    fontSize: 9,
    color: '#9ca3af',
    marginTop: 2,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  activityTile: {
    flex: 1,
    backgroundColor: '#fff8f5',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229,77,46,0.08)',
  },
  tileNumber: {
    fontFamily: fontFamily.displayExtraBold,
    fontSize: 18,
    color: '#111',
    lineHeight: 18,
  },
  tileLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 7,
    color: '#6b7280',
    letterSpacing: 1,
    marginTop: 2,
  },
  tasksTile: {
    flex: 1.6,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 8,
  },
  tasksLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 7,
    color: '#6b7280',
    letterSpacing: 1,
    marginBottom: 4,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginBottom: 3,
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 5,
  },
  taskText: {
    fontFamily: fontFamily.body,
    fontSize: 8,
    color: '#111',
    flex: 1,
  },
})
