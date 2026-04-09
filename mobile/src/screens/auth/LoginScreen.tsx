import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  Image,
} from 'react-native'
import { Video, ResizeMode } from 'expo-av'
import { useSignIn } from '@clerk/expo/legacy'
import { useOAuth } from '@clerk/expo'
import { SafeAreaView } from 'react-native-safe-area-context'
import Constants from 'expo-constants'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { AuthStackParamList } from '../../types/navigation'

const appIcon = require('../../../assets/icon.png')
const loginVideo = require('../../../assets/login-bg.mp4')

WebBrowser.maybeCompleteAuthSession()

const { width, height } = Dimensions.get('window')

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>
}

export function LoginScreen({ navigation }: Props) {
  const { signIn, setActive, isLoaded } = useSignIn()
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)

  const fadeIn = useRef(new Animated.Value(0)).current
  const slideUp = useRef(new Animated.Value(20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 1000, delay: 200, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 1000, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start()
  }, [])

  const handleGoogleSignIn = useCallback(async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const isExpoGo = Constants.appOwnership === 'expo'
      const redirectUrl = makeRedirectUri({
        ...(!isExpoGo && { scheme: 'pulsepro' }),
        path: 'oauth-native-callback',
      })
      const { createdSessionId, setActive: setActiveSession } = await startOAuthFlow({ redirectUrl })
      if (createdSessionId && setActiveSession) {
        await setActiveSession({ session: createdSessionId })
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Google sign in failed'
      if (!message.includes('cancel')) {
        setError(message)
      }
      if (__DEV__) console.error('Google sign in error:', JSON.stringify(err, null, 2))
    } finally {
      setGoogleLoading(false)
    }
  }, [startOAuthFlow])

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
      <Video
        source={loginVideo}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />
      <View style={styles.overlay} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.safeArea}>
          {/* Top icon + name */}
          <Animated.View style={[styles.topBar, { opacity: fadeIn }]}>
            <Image source={appIcon} style={styles.appIcon} />
            <Text style={styles.brand}>Pulse Pro</Text>
          </Animated.View>

          {/* Center headline — matches web hero copy */}
          <Animated.View style={[styles.centerContent, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
            <Text style={styles.headline}>
              Think less.{'\n'}
              <Text style={styles.headlineAccent}>Run smoother</Text>.
            </Text>
            <Text style={styles.subheadline}>
              Add your first task in 5 seconds. No setup, no project boards, no learning curve. Just your work, organized.
            </Text>
          </Animated.View>

          {/* Bottom actions */}
          <Animated.View style={[styles.bottomSection, { opacity: fadeIn }]}>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {showEmailForm ? (
              <View style={styles.emailForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <TouchableOpacity style={styles.primaryBtn} onPress={handleSignIn} disabled={loading} activeOpacity={0.7}>
                  <Text style={styles.primaryBtnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowEmailForm(false)} style={styles.backBtn} activeOpacity={0.7}>
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn} disabled={googleLoading} activeOpacity={0.7}>
                  {googleLoading ? (
                    <ActivityIndicator size="small" color="#1c1c1e" />
                  ) : (
                    <>
                      <Text style={styles.googleG}>G</Text>
                      <Text style={styles.googleBtnText}>Continue with Google</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.emailBtn} onPress={() => setShowEmailForm(true)} activeOpacity={0.7}>
                  <Text style={styles.emailBtnText}>Sign in with email</Text>
                </TouchableOpacity>


                <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.signUpRow} activeOpacity={0.7}>
                  <Text style={styles.signUpText}>
                    Don&apos;t have an account? <Text style={styles.signUpLink}>Sign Up</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 26, 0.55)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // Top
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 28,
    paddingTop: 12,
  },
  brand: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  appIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },

  // Center
  centerContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  headline: {
    fontSize: 44,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 52,
    letterSpacing: -1,
    marginBottom: 14,
  },
  headlineAccent: {
    color: '#E54D2E',
  },
  subheadline: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 26,
  },

  // Bottom
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 16 : 24,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 10,
  },
  googleG: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
    marginRight: 10,
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  emailBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 20,
  },
  emailBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  signUpRow: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  signUpText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
  },
  signUpLink: {
    color: '#E54D2E',
    fontWeight: '700',
  },

  // Email form
  emailForm: {
    gap: 10,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  primaryBtn: {
    backgroundColor: '#E54D2E',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },
  error: {
    color: '#f43f5e',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 13,
  },
})
