import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native'
import {
  User,
  Building2,
  Users,
  Sparkles,
  CheckSquare,
  FolderKanban,
  Receipt,
  Calendar,
  Search,
  Share2,
  UserPlus,
  MoreHorizontal,
} from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { onboardingColors } from './onboardingTheme'
import { fontFamily, shadows } from '../../theme'
import type { Question } from './onboardingData'

const iconMap: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  User,
  Building2,
  Users,
  Sparkles,
  CheckSquare,
  FolderKanban,
  Receipt,
  Calendar,
  Search,
  Share2,
  UserPlus,
  MoreHorizontal,
}

interface QuestionnaireStepProps {
  question: Question
  onAnswer: (questionId: string, answer: string | string[]) => void
}

export function QuestionnaireStep({ question, onAnswer }: QuestionnaireStepProps) {
  const [selected, setSelected] = useState<string[]>([])
  const fadeIn = useRef(new Animated.Value(0)).current
  const slideUp = useRef(new Animated.Value(24)).current

  useEffect(() => {
    fadeIn.setValue(0)
    slideUp.setValue(24)
    setSelected([])
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
  }, [question.id])

  const handleSelect = async (optionId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    if (question.allowMultiple) {
      setSelected((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      )
    } else {
      setSelected([optionId])
      // Auto-advance after brief delay for single-select
      setTimeout(() => {
        onAnswer(question.id, optionId)
      }, 400)
    }
  }

  const handleContinue = () => {
    if (selected.length > 0) {
      onAnswer(question.id, selected)
    }
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeIn, transform: [{ translateY: slideUp }] },
      ]}
    >
      <Text style={styles.title}>{question.title}</Text>
      <Text style={styles.subtitle}>{question.subtitle}</Text>

      <View style={styles.grid}>
        {question.options.map((option) => {
          const isSelected = selected.includes(option.id)
          const IconComponent = iconMap[option.icon]

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
              ]}
              onPress={() => handleSelect(option.id)}
              activeOpacity={0.7}
            >
              {IconComponent && (
                <IconComponent
                  size={24}
                  color={isSelected ? onboardingColors.coral : onboardingColors.textSecondary}
                />
              )}
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {question.allowMultiple && selected.length > 0 && (
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontFamily: fontFamily.displayExtraBold,
    fontSize: 30,
    color: onboardingColors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: 15,
    color: onboardingColors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 36,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  option: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    ...shadows.sm,
  },
  optionSelected: {
    borderColor: onboardingColors.coral,
    backgroundColor: '#fff',
    ...shadows.md,
  },
  optionLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 13,
    color: onboardingColors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  optionLabelSelected: {
    color: onboardingColors.coral,
  },
  continueButton: {
    marginTop: 28,
    backgroundColor: onboardingColors.coral,
    borderRadius: 999,
    paddingVertical: 18,
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 56,
    ...shadows.coralGlow,
  },
  continueText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: '#ffffff',
    letterSpacing: -0.2,
  },
})
