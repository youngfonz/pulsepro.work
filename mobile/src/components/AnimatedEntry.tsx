import React, { useEffect, useRef } from 'react'
import { Animated, type ViewStyle } from 'react-native'

interface AnimatedEntryProps {
  children: React.ReactNode
  delay?: number
  style?: ViewStyle
}

export function AnimatedEntry({ children, delay = 0, style }: AnimatedEntryProps) {
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(18)).current

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(opacity, { toValue: 1, useNativeDriver: true, friction: 8, tension: 40 }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8, tension: 40 }),
      ]).start()
    }, delay)
    return () => clearTimeout(timer)
  }, [delay, opacity, translateY])

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  )
}
