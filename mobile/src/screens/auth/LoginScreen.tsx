import React, { useState, useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { useSignIn } from '@clerk/expo/legacy'
import { useOAuth } from '@clerk/expo'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as WebBrowser from 'expo-web-browser'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { colors } from '../../theme/colors'
import { spacing } from '../../theme/spacing'
import type { AuthStackParamList } from '../../types/navigation'

WebBrowser.maybeCompleteAuthSession()

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

  const handleGoogleSignIn = useCallback(async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const { createdSessionId, setActive: setActiveSession } = await startOAuthFlow()
      if (createdSessionId && setActiveSession) {
        await setActiveSession({ session: createdSessionId })
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Google sign in failed'
      if (!message.includes('cancel')) {
        setError(message)
      }
      console.error('Google sign in error:', JSON.stringify(err, null, 2))
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
      console.error('Sign in error:', JSON.stringify(err, null, 2))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.inner} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.title}>Pulse Pro</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={googleLoading}>
          {googleLoading ? (
            <ActivityIndicator size="small" color={colors.textPrimary} />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}>Don&apos;t have an account? Sign Up</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xxl },
  title: { fontSize: 32, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xxxl },
  googleButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderRadius: 10, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg,
    minHeight: 52,
  },
  googleIcon: {
    fontSize: 20, fontWeight: '700', color: '#4285F4', marginRight: spacing.sm,
  },
  googleText: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textSecondary, fontSize: 13, paddingHorizontal: spacing.md },
  input: {
    backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: spacing.lg,
    color: colors.textPrimary, fontSize: 15, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary, borderRadius: 10, padding: spacing.lg,
    alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.xl,
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  error: { color: colors.destructive, textAlign: 'center', marginBottom: spacing.lg, fontSize: 13 },
  link: { color: colors.primary, textAlign: 'center', fontSize: 15 },
})
