import React from 'react'
import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '@clerk/expo'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { TabNavigator } from './TabNavigator'
import { LoginScreen } from '../screens/auth/LoginScreen'
import { SignUpScreen } from '../screens/auth/SignUpScreen'
import { colors } from '../theme/colors'
import type { RootStackParamList, AuthStackParamList } from '../types/navigation'

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

export function RootNavigator() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
})
