import { colors } from '../../theme/colors'

export const onboardingColors = {
  background: colors.background,
  surface: colors.surface,
  surfaceSelected: '#fff5f3',
  coral: colors.primary,
  coralDark: colors.primaryDark,
  coralTint: 'rgba(229, 77, 46, 0.08)',
  textPrimary: colors.textPrimary,
  textSecondary: colors.textSecondary,
  textTertiary: colors.textTertiary,
  dotInactive: '#d1d1d6',
  dotActive: colors.primary,
  progressTrack: '#e5e5ea',

  // Gradient foundation (atmospheric)
  gradientFrom: '#fff5f1',
  gradientMid: '#ffe5dc',
  gradientTo: '#fbd5c5',
} as const
