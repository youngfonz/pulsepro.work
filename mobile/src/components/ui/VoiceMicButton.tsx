import React, { useEffect, useRef } from 'react'
import { TouchableOpacity, StyleSheet, Animated, Easing, ViewStyle, View, Text } from 'react-native'
import { Mic, MicOff } from 'lucide-react-native'
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition'
import { colors } from '../../theme/colors'

interface VoiceMicButtonProps {
  onTranscript: (text: string) => void
  size?: number
  style?: ViewStyle
}

export function VoiceMicButton({ onTranscript, size = 40, style }: VoiceMicButtonProps) {
  const { transcript, interimTranscript, isListening, error, startListening, stopListening, resetTranscript } = useVoiceRecognition()
  const pulseAnim = useRef(new Animated.Value(1)).current
  const prevTranscript = useRef('')

  // Pulse animation while listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.5, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start()
    } else {
      pulseAnim.stopAnimation()
      pulseAnim.setValue(1)
    }
  }, [isListening])

  // Deliver final transcript
  useEffect(() => {
    if (transcript && transcript !== prevTranscript.current) {
      prevTranscript.current = transcript
      onTranscript(transcript)
      resetTranscript()
    }
  }, [transcript, onTranscript, resetTranscript])

  const handlePress = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const iconSize = size * 0.45

  return (
    <View style={[styles.wrapper, style]}>
      <Animated.View style={{ opacity: isListening ? pulseAnim : 1 }}>
        <TouchableOpacity
          style={[
            styles.button,
            { width: size, height: size, borderRadius: size / 2 },
            isListening && styles.buttonActive,
          ]}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          {isListening ? (
            <MicOff size={iconSize} color="#fff" />
          ) : (
            <Mic size={iconSize} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      </Animated.View>
      {isListening && interimTranscript ? (
        <Text style={styles.interim} numberOfLines={1}>{interimTranscript}</Text>
      ) : null}
      {error ? (
        <Text style={styles.error} numberOfLines={1}>{error}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonActive: {
    backgroundColor: colors.destructive,
    borderColor: colors.destructive,
  },
  interim: {
    position: 'absolute',
    top: '100%',
    marginTop: 4,
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: 'italic',
    maxWidth: 200,
    textAlign: 'center',
  },
  error: {
    position: 'absolute',
    top: '100%',
    marginTop: 4,
    fontSize: 11,
    color: colors.destructive,
    maxWidth: 200,
    textAlign: 'center',
  },
})
