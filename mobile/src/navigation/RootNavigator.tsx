import React, { useEffect, useRef } from 'react'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '@clerk/expo'
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native'
import { TabNavigator } from './TabNavigator'
import { LoginScreen } from '../screens/auth/LoginScreen'
import { SignUpScreen } from '../screens/auth/SignUpScreen'
import { colors } from '../theme/colors'
import type { RootStackParamList, AuthStackParamList } from '../types/navigation'

const { width } = Dimensions.get('window')

const RootStack = createNativeStackNavigator<RootStackParamList>()
const AuthStackNav = createNativeStackNavigator<AuthStackParamList>()

const appTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.primary,
  },
}

function AuthNavigator() {
  return (
    <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
      <AuthStackNav.Screen name="Login" component={LoginScreen} />
      <AuthStackNav.Screen name="SignUp" component={SignUpScreen} />
    </AuthStackNav.Navigator>
  )
}

function SplashScreen() {
  const pulseAnim = useRef(new Animated.Value(0.4)).current
  const glowAnim = useRef(new Animated.Value(0)).current
  const fadeIn = useRef(new Animated.Value(0)).current
  const slideUp = useRef(new Animated.Value(20)).current

  useEffect(() => {
    // Pulse the line
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ])
    ).start()

    // Glow ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1200, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ])
    ).start()

    // Fade in text
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, delay: 200, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 600, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start()
  }, [])

  const glowScale = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] })
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] })

  return (
    <View style={splash.container}>
      {/* Background gradient dots */}
      <View style={splash.bgDot1} />
      <View style={splash.bgDot2} />

      {/* Logo with glow */}
      <View style={splash.logoArea}>
        <Animated.View style={[splash.glowRing, { transform: [{ scale: glowScale }], opacity: glowOpacity }]} />
        <View style={splash.logoBox}>
          <Animated.Text style={[splash.logoLine, { opacity: pulseAnim }]}>
            {'⁄\\⁄'}
          </Animated.Text>
        </View>
      </View>

      {/* Text */}
      <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
        <Text style={splash.title}>Pulse Pro</Text>
        <Text style={splash.subtitle}>Loading your workspace...</Text>
      </Animated.View>

      {/* Bottom bar animation */}
      <View style={splash.bottomBar}>
        <Animated.View style={[splash.bottomBarFill, { opacity: pulseAnim }]} />
      </View>
    </View>
  )
}

export function RootNavigator() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return <SplashScreen />
  }

  return (
    <NavigationContainer theme={appTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isSignedIn ? (
          <RootStack.Screen name="Main" component={TabNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  )
}

const splash = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgDot1: {
    position: 'absolute',
    top: '20%',
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#3b82f6',
    opacity: 0.06,
  },
  bgDot2: {
    position: 'absolute',
    bottom: '15%',
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#3b82f6',
    opacity: 0.04,
  },
  logoArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  glowRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoLine: {
    fontSize: 28,
    fontWeight: '300',
    color: '#fff',
    letterSpacing: -2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 60,
    width: 120,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#1e293b',
    overflow: 'hidden',
  },
  bottomBarFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
})
