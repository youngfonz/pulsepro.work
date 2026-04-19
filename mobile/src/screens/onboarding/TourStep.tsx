import React, { useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native'
import { onboardingColors } from './onboardingTheme'
import { FABVisual, TabsVisual, ReadyVisual } from './TourVisuals'
import { fontFamily, shadows, spacing, radii } from '../../theme'
import type { TourStep as TourStepType } from './onboardingData'

const visualComponents: Record<string, React.ComponentType> = {
  fab: FABVisual,
  tabs: TabsVisual,
  ready: ReadyVisual,
}

const { height } = Dimensions.get('window')

interface TourStepProps {
  step: TourStepType
}

export function TourStep({ step }: TourStepProps) {
  const fade = useRef(new Animated.Value(0)).current
  const rise = useRef(new Animated.Value(24)).current
  const phoneScale = useRef(new Animated.Value(0.94)).current

  useEffect(() => {
    fade.setValue(0)
    rise.setValue(24)
    phoneScale.setValue(0.94)
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(phoneScale, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }),
    ]).start()
  }, [step.id])

  const VisualComponent = visualComponents[step.visual]

  return (
    <Animated.View style={[styles.container, { opacity: fade, transform: [{ translateY: rise }] }]}>
      {/* Phone-frame mock */}
      <View style={styles.visualArea}>
        <Animated.View style={[styles.phoneFrame, { transform: [{ scale: phoneScale }] }, shadows.lg]}>
          <View style={styles.phoneNotch} />
          <View style={styles.phoneScreen}>{VisualComponent && <VisualComponent />}</View>
          <View style={styles.phoneHomeBar} />
        </Animated.View>
      </View>

      {/* Copy */}
      <View style={styles.textArea}>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>
      </View>
    </Animated.View>
  )
}

const PHONE_WIDTH = 252
const PHONE_HEIGHT = 460

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },

  visualArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
  },
  phoneFrame: {
    width: PHONE_WIDTH,
    height: PHONE_HEIGHT,
    backgroundColor: '#1a1a1a',
    borderRadius: 42,
    padding: 7,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  phoneNotch: {
    position: 'absolute',
    top: 14,
    width: 86,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0a0a0a',
    zIndex: 2,
  },
  phoneScreen: {
    flex: 1,
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 36,
    overflow: 'hidden',
    paddingTop: 40,
    paddingHorizontal: 12,
  },
  phoneHomeBar: {
    position: 'absolute',
    bottom: 12,
    width: 110,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },

  textArea: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.md,
    paddingTop: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.displayExtraBold,
    fontSize: 30,
    color: onboardingColors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  description: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: onboardingColors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
})
