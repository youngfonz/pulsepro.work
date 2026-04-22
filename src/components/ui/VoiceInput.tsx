'use client'

import { useEffect } from 'react'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import { cn } from '@/lib/utils'

interface VoiceInputProps {
  onTranscript: (transcript: string) => void
  placeholder?: string
  className?: string
}

export function VoiceInput({ onTranscript, placeholder, className }: VoiceInputProps) {
  const {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition()

  // When we get a final transcript, pass it to the parent
  useEffect(() => {
    if (transcript && !isListening) {
      onTranscript(transcript)
      resetTranscript()
    }
  }, [transcript, isListening, onTranscript, resetTranscript])

  if (!isSupported) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        <svg
          className="w-5 h-5 inline mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        Voice input not supported
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        disabled={!!error}
        className={cn(
          'inline-flex items-center justify-center  font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          'h-10 w-10',
          {
            'bg-destructive text-destructive-foreground hover:bg-destructive/80': isListening,
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': !isListening,
          }
        )}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        title={placeholder || 'Click to speak'}
      >
        {isListening ? (
          <svg
            className="w-5 h-5 animate-pulse"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        )}
      </button>

      {/* Status text */}
      {isListening && (
        <p className="text-xs text-muted-foreground animate-pulse">
          Listening... Speak now
        </p>
      )}

      {/* Interim transcript */}
      {transcript && isListening && (
        <p className="text-sm text-foreground bg-muted p-2 ">
          {transcript}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
