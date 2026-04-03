import { useState, useCallback, useRef } from 'react'
import { parseVoiceInput, ParsedVoiceCommand } from '../lib/voiceParser'

interface UseVoiceReturn {
  isListening: boolean
  transcript: string
  parsedCommand: ParsedVoiceCommand | null
  startListening: () => void
  stopListening: () => void
  supported: boolean
  error: string | null
  reset: () => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = any

export function useVoice(onResult?: (cmd: ParsedVoiceCommand, text: string) => void): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [parsedCommand, setParsedCommand] = useState<ParsedVoiceCommand | null>(null)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<AnyRecognition>(null)

  const supported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const startListening = useCallback(() => {
    if (!supported) {
      setError('Reconhecimento de voz não suportado neste navegador.')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = 'pt-BR'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      setTranscript('')
      if (navigator.vibrate) navigator.vibrate(50)
    }

    recognition.onresult = (event: AnyRecognition) => {
      let finalTranscript = ''
      let interimTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) finalTranscript += result[0].transcript
        else interimTranscript += result[0].transcript
      }
      setTranscript(finalTranscript || interimTranscript)

      if (finalTranscript) {
        const cmd = parseVoiceInput(finalTranscript)
        setParsedCommand(cmd)
        onResult?.(cmd, finalTranscript)
        if (navigator.vibrate) navigator.vibrate([50, 30, 50])
      }
    }

    recognition.onerror = (event: AnyRecognition) => {
      setError(`Erro: ${event.error === 'no-speech' ? 'Nenhuma fala detectada' : event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [supported, onResult])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const reset = useCallback(() => {
    setTranscript('')
    setParsedCommand(null)
    setError(null)
  }, [])

  return { isListening, transcript, parsedCommand, startListening, stopListening, supported, error, reset }
}
