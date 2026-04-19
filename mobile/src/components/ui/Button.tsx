import React from 'react'
import { Pressable, Text, StyleSheet, ActivityIndicator, View, ViewStyle, TextStyle } from 'react-native'
import { colors, spacing, radii, shadows, fontFamily } from '../../theme'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'dark' | 'onDark'
type Size = 'sm' | 'md' | 'lg'
type Shape = 'rounded' | 'pill'

type Props = {
  title: string
  onPress: () => void
  variant?: Variant
  size?: Size
  shape?: Shape
  loading?: boolean
  disabled?: boolean
  leadingIcon?: React.ReactNode
  trailingIcon?: React.ReactNode
  glow?: boolean
  fullWidth?: boolean
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  loading,
  disabled,
  leadingIcon,
  trailingIcon,
  glow,
  fullWidth = true,
}: Props) {
  const v = variantStyles[variant]
  const s = sizeStyles[size]
  const radius = shape === 'pill' ? radii.pill : radii.md

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: v.bg, borderRadius: radius, paddingVertical: s.py, paddingHorizontal: s.px },
        v.border && { borderWidth: 1, borderColor: v.border },
        glow && variant === 'primary' && shadows.coralGlow,
        glow && variant !== 'primary' && shadows.md,
        !fullWidth && styles.inline,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.row}>
          {leadingIcon && <View style={styles.iconLeading}>{leadingIcon}</View>}
          <Text style={[styles.text, { color: v.fg, fontSize: s.fs, fontFamily: fontFamily.bodySemiBold }]}>
            {title}
          </Text>
          {trailingIcon && <View style={styles.iconTrailing}>{trailingIcon}</View>}
        </View>
      )}
    </Pressable>
  )
}

type VariantStyle = { bg: string; fg: string; border?: string }

const variantStyles: Record<Variant, VariantStyle> = {
  primary: { bg: colors.primary, fg: colors.textOnPrimary },
  secondary: { bg: colors.surface, fg: colors.textPrimary, border: colors.border },
  ghost: { bg: 'transparent', fg: colors.textPrimary },
  destructive: { bg: colors.destructive, fg: '#fff' },
  dark: { bg: colors.backgroundDark, fg: colors.textOnDark },
  onDark: { bg: colors.surface, fg: colors.textPrimary },
}

const sizeStyles: Record<Size, { py: number; px: number; fs: number }> = {
  sm: { py: spacing.sm + 2, px: spacing.lg, fs: 13 },
  md: { py: spacing.md + 2, px: spacing.xl, fs: 15 },
  lg: { py: spacing.lg, px: spacing.xxl, fs: 17 },
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  inline: { alignSelf: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  text: { letterSpacing: -0.1 },
  iconLeading: { marginRight: spacing.sm },
  iconTrailing: { marginLeft: spacing.sm },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
})
