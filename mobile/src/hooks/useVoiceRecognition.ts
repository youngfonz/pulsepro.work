import { useState, useCallback, useRef } from 'react'
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

let speechModule: {
  Module: typeof import('expo-speech-recognition').ExpoSpeechRecognitionModule | null
  useEvent: typeof import('expo-speech-recognition').useSpeechRecognitionEvent | null
  available: boolean
} = { Module: null, useEvent: null, available: false }

try {
  // Requires a custom dev build — Expo Go will throw
  const speech = require('expo-speech-recognition') as typeof import('expo-speech-recognition')
  speechModule = {
    Module: speech.ExpoSpeechRecognitionModule,
    useEvent: speech.useSpeechRecognitionEvent,
    available: true,
  }
} catch {
  // Running in Expo Go or native module not linked — voice disabled
}

const noopEvent: typeof import('expo-speech-recognition').useSpeechRecognitionEvent = () => {}

export function useVoiceRecognition(): UseVoiceRecognitionResult {
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isListeningRef = useRef(false)

  const useSpeechEvent = speechModule.useEvent ?? noopEvent

  useSpeechEvent('start', () => {
    isListeningRef.current = true
    setIsListening(true)
    setError(null)
  })

  useSpeechEvent('end', () => {
    isListeningRef.current = false
    setIsListening(false)
  })

  useSpeechEvent('result', (event) => {
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

  useSpeechEvent('error', (event) => {
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

    if (!speechModule.available || !speechModule.Module) {
      setError('Voice input needs a native build. Run `npx expo run:ios`.')
      return
    }

    const { granted } = await speechModule.Module.requestPermissionsAsync()
    if (!granted) {
      setError('Microphone permission is required for voice input.')
      return
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    speechModule.Module.start({
      lang: 'en-US',
      interimResults: true,
      continuous: false,
    })
  }, [])

  const stopListening = useCallback(() => {
    if (isListeningRef.current && speechModule.Module) {
      speechModule.Module.stop()
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
