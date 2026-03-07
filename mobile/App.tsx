import React from 'react'
import { StatusBar } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ClerkProvider, ClerkLoaded } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Constants from 'expo-constants'
import { RootNavigator } from './src/navigation/RootNavigator'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const publishableKey = Constants.expoConfig?.extra?.clerkPublishableKey as string

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ClerkLoaded>
          <QueryClientProvider client={queryClient}>
            <RootNavigator />
          </QueryClientProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </SafeAreaProvider>
  )
}
