import { useState, useCallback, useRef, useEffect } from 'react'
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition'
import * as Haptics from 'expo-haptics'

interface UseVoiceRecognitionResult {
  transcript: string
  interimTranscript: string
  isListening: boolean
  error: string | null
  startListening: () => Promise<void>
  stopListening: () => void
  resetTranscript: () => void
}

export function useVoiceRecognition(): UseVoiceRecognitionResult {
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isListeningRef = useRef(false)

  useSpeechRecognitionEvent('start', () => {
    isListeningRef.current = true
    setIsListening(true)
    setError(null)
  })

  useSpeechRecognitionEvent('end', () => {
    isListeningRef.current = false
    setIsListening(false)
  })

  useSpeechRecognitionEvent('result', (event) => {
    const results = event.results
    if (results && results.length > 0) {
      const latest = results[results.length - 1]
      if (latest) {
        const text = latest.transcript
        if (event.isFinal) {
          setTranscript(text)
          setInterimTranscript('')
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        } else {
          setInterimTranscript(text)
        }
      }
    }
  })

  useSpeechRecognitionEvent('error', (event) => {
    isListeningRef.current = false
    setIsListening(false)
    const code = event.error
    if (code === 'not-allowed' || code === 'service-not-allowed') {
      setError('Microphone access denied. Enable it in Settings.')
    } else if (code === 'no-speech') {
      setError('No speech detected. Try again.')
    } else if (code === 'network') {
      setError('Network error. Check your connection.')
    } else {
      setError(`Speech error: ${code}`)
    }
  })

  const startListening = useCallback(async () => {
    setError(null)
    setTranscript('')
    setInterimTranscript('')

    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync()
    if (!granted) {
      setError('Microphone permission is required for voice input.')
      return
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: false,
    })
  }, [])

  const stopListening = useCallback(() => {
    if (isListeningRef.current) {
      ExpoSpeechRecognitionModule.stop()
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setError(null)
  }, [])

  return {
    transcript,
    interimTranscript,
    isListening,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}
