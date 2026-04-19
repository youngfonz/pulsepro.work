import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  Image,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSignIn } from '@clerk/expo/legacy'
import { useSSO } from '@clerk/expo'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as WebBrowser from 'expo-web-browser'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { AuthStackParamList } from '../../types/navigation'
import { colors, spacing, radii, shadows, fontFamily } from '../../theme'

const appIcon = require('../../../assets/icon.png')

WebBrowser.maybeCompleteAuthSession()

const { width, height } = Dimensions.get('window')

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>
}

export function LoginScreen({ navigation }: Props) {
  const { signIn, setActive, isLoaded } = useSignIn()
  const { startSSOFlow } = useSSO()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)

  // Entry animation
  const fade = useRef(new Animated.Value(0)).current
  const rise = useRef(new Animated.Value(28)).current
  // Ambient blob drift
  const blob1 = useRef(new Animated.Value(0)).current
  const blob2 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 900, delay: 150, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 900, delay: 150, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start()

    const loop = (anim: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ])
      )
    loop(blob1, 8000).start()
    loop(blob2, 11000).start()
  }, [])

  const blob1X = blob1.interpolate({ inputRange: [0, 1], outputRange: [-40, 30] })
  const blob1Y = blob1.interpolate({ inputRange: [0, 1], outputRange: [-20, 20] })
  const blob2X = blob2.interpolate({ inputRange: [0, 1], outputRange: [40, -30] })
  const blob2Y = blob2.interpolate({ inputRange: [0, 1], outputRange: [30, -10] })

  const handleGoogleSignIn = useCallback(async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const { createdSessionId, setActive: setActiveSession } = await startSSOFlow({ strategy: 'oauth_google' })
      if (createdSessionId && setActiveSession) {
        await setActiveSession({ session: createdSessionId })
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Google sign in failed'
      if (!message.includes('cancel')) setError(message)
      if (__DEV__) console.error('Google sign in error:', JSON.stringify(err, null, 2))
    } finally {
      setGoogleLoading(false)
    }
  }, [startSSOFlow])

  const handleSignIn = async () => {
    if (!isLoaded) return
    setError('')
    setLoading(true)
    try {
      const result = await signIn.create({ identifier: email, password })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Sign in failed'
      setError(message)
      if (__DEV__) console.error('Sign in error:', JSON.stringify(err, null, 2))
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Base gradient: matte charcoal → deeper charcoal with warm undertone */}
      <LinearGradient
        colors={['#1a1a1a', '#231714', '#2a1410']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Drifting human portraits — real people behind the hero */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.blobGlow,
          styles.blob1Glow,
          { transform: [{ translateX: blob1X }, { translateY: blob1Y }] },
        ]}
      >
        <Animated.Image
          source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
          style={styles.blobImage}
          resizeMode="cover"
        />
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.blobGlow,
          styles.blob2Glow,
          { transform: [{ translateX: blob2X }, { translateY: blob2Y }] },
        ]}
      >
        <Animated.Image
          source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
          style={styles.blobImage}
          resizeMode="cover"
        />
      </Animated.View>

      {/* Subtle bottom fade for contrast on CTAs */}
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(15,10,8,0.6)']}
        style={styles.bottomFade}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.safeArea}>
          {/* Top wordmark */}
          <Animated.View style={[styles.topBar, { opacity: fade }]}>
            <Image source={appIcon} style={styles.appIcon} />
            <Text style={styles.brand}>Pulse Pro</Text>
          </Animated.View>

          {/* Hero copy */}
          <Animated.View style={[styles.heroBlock, { opacity: fade, transform: [{ translateY: rise }] }]}>
            <Text style={styles.eyebrow}>For freelancers & small teams</Text>
            <Text style={styles.headline}>
              Think less.{'\n'}
              <Text style={styles.headlineAccent}>Run smoother.</Text>
            </Text>
            <Text style={styles.sub}>
              The calm command center for your projects, tasks, and clients. Add your first task in five seconds.
            </Text>
          </Animated.View>

          {/* Bottom CTAs */}
          <Animated.View style={[styles.bottom, { opacity: fade }]}>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {showEmailForm ? (
              <View style={styles.emailForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <Pressable
                  style={({ pressed }) => [styles.primaryCta, shadows.coralGlow, pressed && styles.pressed]}
                  onPress={handleSignIn}
                  disabled={loading}
                >
                  <Text style={styles.primaryCtaText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
                </Pressable>
                <Pressable onPress={() => setShowEmailForm(false)} style={styles.backBtn}>
                  <Text style={styles.backBtnText}>Back</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Pressable
                  style={({ pressed }) => [styles.primaryCta, shadows.coralGlow, pressed && styles.pressed]}
                  onPress={handleGoogleSignIn}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryCtaText}>Continue with Google</Text>
                  )}
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.secondaryCta, pressed && styles.pressed]}
                  onPress={() => setShowEmailForm(true)}
                >
                  <Text style={styles.secondaryCtaText}>Sign in with email</Text>
                </Pressable>

                <Pressable onPress={() => navigation.navigate('SignUp')} style={styles.signUpRow}>
                  <Text style={styles.signUpText}>
                    Don&apos;t have an account? <Text style={styles.signUpLink}>Sign up</Text>
                  </Text>
                </Pressable>
              </>
            )}
          </Animated.View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundDark },

  blobGlow: {
    position: 'absolute',
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 80,
  },
  blob1Glow: {
    top: -120,
    left: -80,
    width: 420,
    height: 420,
    borderRadius: 210,
    opacity: 0.55,
  },
  blob2Glow: {
    top: height * 0.35,
    right: -120,
    width: 340,
    height: 340,
    borderRadius: 170,
    opacity: 0.45,
  },
  blobImage: {
    width: '100%',
    height: '100%',
  },

  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.45,
  },

  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // Top
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.sm,
  },
  appIcon: { width: 48, height: 48, borderRadius: radii.md },
  brand: {
    fontFamily: fontFamily.displayExtraBold,
    fontSize: 22,
    color: colors.textOnDark,
    letterSpacing: -0.5,
  },

  // Hero
  heroBlock: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  eyebrow: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.primaryDark,
    marginBottom: spacing.md,
  },
  headline: {
    fontFamily: fontFamily.displayExtraBold,
    fontSize: 48,
    color: colors.textOnDark,
    lineHeight: 54,
    letterSpacing: -1.6,
  },
  headlineAccent: {
    color: colors.primaryDark,
    fontStyle: 'italic',
    fontFamily: fontFamily.displayExtraBold,
  },
  sub: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    color: 'rgba(255,255,255,0.62)',
    lineHeight: 24,
    marginTop: spacing.lg,
    maxWidth: 380,
  },

  // Bottom
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.xxl,
    gap: spacing.md,
  },
  primaryCta: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCtaText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
    color: '#fff',
    letterSpacing: -0.2,
  },
  secondaryCta: {
    borderRadius: radii.pill,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  secondaryCtaText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 15,
    color: 'rgba(255,255,255,0.82)',
    letterSpacing: -0.1,
  },
  signUpRow: { alignItems: 'center', paddingTop: spacing.sm },
  signUpText: { fontFamily: fontFamily.body, fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  signUpLink: { color: colors.primaryDark, fontFamily: fontFamily.bodyBold },

  // Email form
  emailForm: { gap: spacing.sm },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    color: '#fff',
    fontFamily: fontFamily.body,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: { alignItems: 'center', paddingVertical: spacing.md },
  backBtnText: { fontFamily: fontFamily.bodyMedium, fontSize: 14, color: 'rgba(255,255,255,0.5)' },

  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },

  error: {
    fontFamily: fontFamily.bodyMedium,
    color: '#fca5a5',
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontSize: 13,
  },
})
