import React, { useEffect, useRef } from 'react'
import { View, Text, Modal, Pressable, StyleSheet, Animated, Easing } from 'react-native'
import { Mic } from 'lucide-react-native'
import { useVoiceRecognition } from '../hooks/useVoiceRecognition'
import { colors } from '../theme/colors'

interface VoiceInputOverlayProps {
  visible: boolean
  onClose: () => void
  onResult: (transcript: string) => void
  entityType?: 'task' | 'project' | 'client'
}

const ENTITY_LABELS = {
  task: 'Speak your task...',
  project: 'Speak your project...',
  client: 'Speak your client...',
}

export function VoiceInputOverlay({ visible, onClose, onResult, entityType = 'task' }: VoiceInputOverlayProps) {
  const { transcript, interimTranscript, isListening, error, startListening, stopListening, resetTranscript } = useVoiceRecognition()
  const pulseAnim = useRef(new Animated.Value(1)).current
  const ringAnim = useRef(new Animated.Value(0.6)).current
  const hasDelivered = useRef(false)

  // Auto-start listening when overlay opens
  useEffect(() => {
    if (visible) {
      hasDelivered.current = false
      resetTranscript()
      // Small delay to let modal animate in
      const timer = setTimeout(() => startListening(), 300)
      return () => clearTimeout(timer)
    } else {
      stopListening()
    }
  }, [visible])

  // Pulse animations while listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start()
      Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, { toValue: 1, duration: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(ringAnim, { toValue: 0.6, duration: 1000, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        ])
      ).start()
    } else {
      pulseAnim.stopAnimation()
      ringAnim.stopAnimation()
      pulseAnim.setValue(1)
      ringAnim.setValue(0.6)
    }
  }, [isListening])

  // Deliver final transcript
  useEffect(() => {
    if (transcript && !hasDelivered.current) {
      hasDelivered.current = true
      // Brief delay to show the result
      setTimeout(() => {
        onResult(transcript)
        onClose()
      }, 600)
    }
  }, [transcript, onResult, onClose])

  const ringScale = ringAnim.interpolate({
    inputRange: [0.6, 1],
    outputRange: [1, 1.4],
  })

  const displayText = transcript || interimTranscript

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.content}>
          {/* Pulsing mic */}
          <View style={styles.micArea}>
            <Animated.View style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringAnim }]} />
            <Animated.View style={[styles.micCircle, { transform: [{ scale: pulseAnim }] }]}>
              <Mic size={36} color="#fff" />
            </Animated.View>
          </View>

          {/* Label */}
          <Text style={styles.label}>
            {transcript ? 'Got it!' : isListening ? ENTITY_LABELS[entityType] : 'Starting...'}
          </Text>

          {/* Transcript */}
          {displayText ? (
            <Text style={[styles.transcript, transcript ? styles.transcriptFinal : null]}>
              {displayText}
            </Text>
          ) : null}

          {/* Error */}
          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          {/* Tap to cancel hint */}
          <Text style={styles.hint}>Tap anywhere to cancel</Text>
        </View>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  micArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  micCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  transcript: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
    maxWidth: 300,
  },
  transcriptFinal: {
    color: '#fff',
    fontStyle: 'normal',
    fontWeight: '500',
  },
  error: {
    fontSize: 14,
    color: colors.destructive,
    textAlign: 'center',
    marginTop: 12,
  },
  hint: {
    position: 'absolute',
    bottom: -120,
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
  },
})
