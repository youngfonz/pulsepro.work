import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useUser } from '@clerk/expo'
import { onboardingColors } from './onboardingTheme'
import { questions, tourSteps, TOTAL_STEPS } from './onboardingData'
import { QuestionnaireStep } from './QuestionnaireStep'
import { TourStep } from './TourStep'
import { saveOnboardingAnswers } from '../../utils/onboardingStorage'
import { fontFamily, radii, shadows, spacing } from '../../theme'

interface OnboardingScreenProps {
  onComplete: () => void
}

const { width } = Dimensions.get('window')

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { user } = useUser()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const progressAnim = useRef(new Animated.Value(0)).current

  const isQuestionnaire = currentStep < questions.length
  const tourIndex = currentStep - questions.length

  const animateProgress = (step: number) => {
    Animated.timing(progressAnim, {
      toValue: (step + 1) / TOTAL_STEPS,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }

  const goNext = () => {
    if (currentStep >= TOTAL_STEPS - 1) {
      finishOnboarding()
    } else {
      const next = currentStep + 1
      setCurrentStep(next)
      animateProgress(next)
    }
  }

  const goBack = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1
      setCurrentStep(prev)
      animateProgress(prev)
    }
  }

  const handleQuestionAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
    goNext()
  }

  const finishOnboarding = async () => {
    if (user?.id) await saveOnboardingAnswers(user.id, answers)
    onComplete()
  }

  const handleSkip = () => finishOnboarding()

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  return (
    <View style={styles.root}>
      {/* Atmospheric gradient */}
      <LinearGradient
        colors={[onboardingColors.gradientFrom, onboardingColors.gradientMid, onboardingColors.gradientTo]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Coral glow blob top-right */}
      <View pointerEvents="none" style={styles.glow} />

      <SafeAreaView style={styles.container}>
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          {currentStep > 0 ? (
            <Pressable onPress={goBack} style={styles.headerButton} hitSlop={10}>
              <Text style={styles.headerButtonText}>Back</Text>
            </Pressable>
          ) : (
            <View style={styles.headerButton} />
          )}

          <Text style={styles.stepCounter}>
            {currentStep + 1} <Text style={{ color: onboardingColors.textTertiary }}>of {TOTAL_STEPS}</Text>
          </Text>

          {isQuestionnaire ? (
            <Pressable onPress={handleSkip} style={styles.headerButton} hitSlop={10}>
              <Text style={styles.headerButtonText}>Skip</Text>
            </Pressable>
          ) : (
            <View style={styles.headerButton} />
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {isQuestionnaire ? (
            <QuestionnaireStep question={questions[currentStep]} onAnswer={handleQuestionAnswer} />
          ) : (
            <TourStep step={tourSteps[tourIndex]} />
          )}
        </View>

        {/* Bottom CTA — tour only */}
        {!isQuestionnaire && (
          <View style={styles.footer}>
            <View style={styles.dots}>
              {tourSteps.map((_, i) => (
                <View key={i} style={[styles.dot, i === tourIndex && styles.dotActive]} />
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [styles.continueButton, shadows.coralGlow, pressed && styles.pressed]}
              onPress={goNext}
            >
              <Text style={styles.continueText}>
                {tourIndex === tourSteps.length - 1 ? 'Get started' : 'Continue'}
              </Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },

  glow: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: onboardingColors.coral,
    opacity: 0.22,
  },

  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginHorizontal: spacing.xl,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: onboardingColors.coral,
    borderRadius: 2,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    paddingTop: spacing.lg,
  },
  headerButton: { minWidth: 50 },
  headerButtonText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 14,
    color: onboardingColors.textSecondary,
  },
  stepCounter: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 13,
    color: onboardingColors.textPrimary,
    letterSpacing: 0.3,
  },

  content: { flex: 1 },

  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
    alignItems: 'center',
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: onboardingColors.dotInactive,
  },
  dotActive: {
    width: 24,
    backgroundColor: onboardingColors.dotActive,
  },
  continueButton: {
    backgroundColor: onboardingColors.coral,
    borderRadius: radii.pill,
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  continueText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
})
