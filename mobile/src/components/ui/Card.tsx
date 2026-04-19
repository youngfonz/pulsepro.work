import React from 'react'
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native'
import { BlurView } from 'expo-blur'
import { colors, spacing, radii, shadows } from '../../theme'

type Variant = 'surface' | 'elevated' | 'dark' | 'glass' | 'glassDark' | 'outlined'

type Props = {
  children: React.ReactNode
  style?: ViewStyle | ViewStyle[]
  variant?: Variant
  padding?: keyof typeof spacing | 'none'
  radius?: keyof typeof radii
  onPress?: () => void
}

export function Card({
  children,
  style,
  variant = 'surface',
  padding = 'lg',
  radius = 'lg',
  onPress,
}: Props) {
  const pad = padding === 'none' ? 0 : spacing[padding]
  const r = radii[radius]
  const borderRadius = r

  const baseStyle: ViewStyle = { padding: pad, borderRadius }

  const body = (innerStyle?: ViewStyle) => <View style={[innerStyle, baseStyle]}>{children}</View>

  let content: React.ReactNode

  switch (variant) {
    case 'elevated':
      content = (
        <View style={[styles.elevated, baseStyle, shadows.md, style]}>{children}</View>
      )
      break
    case 'dark':
      content = <View style={[styles.dark, baseStyle, style]}>{children}</View>
      break
    case 'outlined':
      content = <View style={[styles.outlined, baseStyle, style]}>{children}</View>
      break
    case 'glass':
      content = (
        <View style={[{ borderRadius, overflow: 'hidden' }, style]}>
          <BlurView intensity={40} tint="light" style={[styles.glassInner, baseStyle]}>
            {children}
          </BlurView>
        </View>
      )
      break
    case 'glassDark':
      content = (
        <View style={[{ borderRadius, overflow: 'hidden' }, style]}>
          <BlurView intensity={50} tint="dark" style={[styles.glassDarkInner, baseStyle]}>
            {children}
          </BlurView>
        </View>
      )
      break
    case 'surface':
    default:
      content = <View style={[styles.surface, baseStyle, style]}>{children}</View>
  }

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }}>
        {content}
      </Pressable>
    )
  }

  return <>{content}</>
}

const styles = StyleSheet.create({
  surface: { backgroundColor: colors.surface },
  elevated: { backgroundColor: colors.surface },
  dark: { backgroundColor: colors.surfaceDark },
  outlined: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  glassInner: { backgroundColor: 'rgba(255,255,255,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)' },
  glassDarkInner: { backgroundColor: 'rgba(45,45,47,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
})
