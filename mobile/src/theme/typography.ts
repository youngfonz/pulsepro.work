import { TextStyle } from 'react-native'

// Fonz Design System fonts
// Display: Bricolage Grotesque — headings, stat numbers, logo
// Body: Plus Jakarta Sans — everything else
// Mono: Geist Mono — code, tabular data

export const fontFamily = {
  display: 'BricolageGrotesque_700Bold',
  displayMedium: 'BricolageGrotesque_500Medium',
  displaySemiBold: 'BricolageGrotesque_600SemiBold',
  displayExtraBold: 'BricolageGrotesque_800ExtraBold',
  body: 'PlusJakartaSans_400Regular',
  bodyMedium: 'PlusJakartaSans_500Medium',
  bodySemiBold: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
  mono: 'GeistMono_400Regular',
} as const

export const typography: Record<string, TextStyle> = {
  // Display scale (Bricolage)
  displayXL: { fontFamily: fontFamily.displayExtraBold, fontSize: 44, lineHeight: 50, letterSpacing: -1.2 },
  displayLG: { fontFamily: fontFamily.display, fontSize: 36, lineHeight: 42, letterSpacing: -1 },
  displayMD: { fontFamily: fontFamily.display, fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  displaySM: { fontFamily: fontFamily.displaySemiBold, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },

  // Heading scale (Bricolage, smaller)
  h1: { fontFamily: fontFamily.display, fontSize: 24, lineHeight: 30, letterSpacing: -0.4 },
  h2: { fontFamily: fontFamily.displaySemiBold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  h3: { fontFamily: fontFamily.displaySemiBold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },

  // Body scale (Jakarta)
  bodyLG: { fontFamily: fontFamily.body, fontSize: 17, lineHeight: 24 },
  bodyMD: { fontFamily: fontFamily.body, fontSize: 15, lineHeight: 22 },
  bodySM: { fontFamily: fontFamily.body, fontSize: 13, lineHeight: 18 },
  bodyXS: { fontFamily: fontFamily.body, fontSize: 11, lineHeight: 14 },

  // Semibold body (labels, buttons)
  labelLG: { fontFamily: fontFamily.bodySemiBold, fontSize: 17, lineHeight: 22 },
  labelMD: { fontFamily: fontFamily.bodySemiBold, fontSize: 15, lineHeight: 20 },
  labelSM: { fontFamily: fontFamily.bodySemiBold, fontSize: 13, lineHeight: 16 },
  labelXS: { fontFamily: fontFamily.bodyMedium, fontSize: 11, lineHeight: 14, letterSpacing: 0.4 },

  // Legacy size tokens (for gradual migration)
  xs: { fontSize: 11, lineHeight: 14 },
  sm: { fontSize: 13, lineHeight: 18 },
  base: { fontSize: 15, lineHeight: 22 },
  lg: { fontSize: 17, lineHeight: 24 },
  xl: { fontSize: 20, lineHeight: 28 },
  xxl: { fontSize: 24, lineHeight: 32 },
  xxxl: { fontSize: 32, lineHeight: 40 },
}
