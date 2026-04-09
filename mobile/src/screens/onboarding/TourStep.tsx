import React, { useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Animated, Easing } from 'react-native'
import { onboardingColors } from './onboardingTheme'
import { FABVisual, TabsVisual, ReadyVisual } from './TourVisuals'
import type { TourStep as TourStepType } from './onboardingData'

const visualComponents: Record<string, React.ComponentType> = {
  fab: FABVisual,
  tabs: TabsVisual,
  ready: ReadyVisual,
}

interface TourStepProps {
  step: TourStepType
}

export function TourStep({ step }: TourStepProps) {
  const fadeIn = useRef(new Animated.Value(0)).current
  const slideUp = useRef(new Animated.Value(24)).current

  useEffect(() => {
    fadeIn.setValue(0)
    slideUp.setValue(24)
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start()
  }, [step.id])

  const VisualComponent = visualComponents[step.visual]

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeIn, transform: [{ translateY: slideUp }] },
      ]}
    >
      <View style={styles.visualArea}>
        {VisualComponent && <VisualComponent />}
      </View>

      <View style={styles.textArea}>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  visualArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  textArea: {
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: onboardingColors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: onboardingColors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
})
