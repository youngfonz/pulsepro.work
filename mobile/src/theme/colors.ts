// Fonz Design System — matte charcoal + vermillion coral
// Never use pure black (#000). Always matte charcoal (#1a1a1a).

export const colors = {
  // Brand accent (vermillion coral)
  primary: '#E54D2E',
  primaryDark: '#F0613E',
  primaryPressed: '#D4431F',

  // Light surfaces
  background: '#f5f5f7',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',

  // Dark surfaces (matte charcoal — never #000)
  backgroundDark: '#1a1a1a',
  surfaceDark: '#2d2d2f',
  surfaceDarkElevated: '#353538',

  // Borders / dividers
  border: '#e5e5ea',
  borderDark: '#2e2e30',
  hairline: 'rgba(0,0,0,0.06)',
  hairlineDark: 'rgba(255,255,255,0.08)',

  // Text
  textPrimary: '#1c1c1e',
  textSecondary: '#636366',
  textTertiary: '#8e8e93',
  textOnDark: '#fafafa',
  textOnDarkSecondary: '#a3a3a3',
  textOnPrimary: '#ffffff',

  // Semantic
  destructive: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Ambient / gradients (for atmospheric backgrounds — splash, hero)
  coralGlow: 'rgba(229,77,46,0.18)',
  coralAmbient: 'rgba(240,97,62,0.12)',
  gradientSunriseFrom: '#E54D2E',
  gradientSunriseTo: '#F5A623',
  gradientDuskFrom: '#1a1a1a',
  gradientDuskTo: '#3a1a12',

  transparent: 'transparent',

  // Legacy aliases (kept for backward compatibility)
  surfaceAlt: '#f0f0f3',
} as const

export type ColorToken = keyof typeof colors
