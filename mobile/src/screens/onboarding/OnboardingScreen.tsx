import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native'
import { useUser } from '@clerk/expo'
import { onboardingColors } from './onboardingTheme'
import { questions, tourSteps, TOTAL_STEPS } from './onboardingData'
import { QuestionnaireStep } from './QuestionnaireStep'
import { TourStep } from './TourStep'
import { saveOnboardingAnswers } from '../../utils/onboardingStorage'

interface OnboardingScreenProps {
  onComplete: () => void
}

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
      duration: 300,
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
    if (user?.id) {
      await saveOnboardingAnswers(user.id, answers)
    }
    onComplete()
  }

  const handleSkip = () => {
    finishOnboarding()
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[styles.progressFill, { width: progressWidth }]}
        />
      </View>

      {/* Header with skip/back */}
      <View style={styles.header}>
        {currentStep > 0 ? (
          <TouchableOpacity onPress={goBack} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}

        <Text style={styles.stepCounter}>
          {currentStep + 1} of {TOTAL_STEPS}
        </Text>

        {isQuestionnaire ? (
          <TouchableOpacity onPress={handleSkip} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isQuestionnaire ? (
          <QuestionnaireStep
            question={questions[currentStep]}
            onAnswer={handleQuestionAnswer}
          />
        ) : (
          <TourStep step={tourSteps[tourIndex]} />
        )}
      </View>

      {/* Bottom navigation — only for tour steps */}
      {!isQuestionnaire && (
        <View style={styles.footer}>
          {/* Dot indicators */}
          <View style={styles.dots}>
            {tourSteps.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === tourIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={goNext}>
            <Text style={styles.continueText}>
              {tourIndex === tourSteps.length - 1 ? 'Get started' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: onboardingColors.background,
  },
  progressTrack: {
    height: 3,
    backgroundColor: onboardingColors.progressTrack,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerButton: {
    minWidth: 50,
  },
  headerButtonText: {
    fontSize: 15,
    color: onboardingColors.textSecondary,
    fontWeight: '500',
  },
  stepCounter: {
    fontSize: 13,
    color: onboardingColors.textSecondary,
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 20,
    gap: 20,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: onboardingColors.dotInactive,
  },
  dotActive: {
    backgroundColor: onboardingColors.dotActive,
  },
  continueButton: {
    backgroundColor: onboardingColors.coral,
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
})
