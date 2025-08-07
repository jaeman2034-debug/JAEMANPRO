import { useState, useRef, useCallback, useEffect } from 'react'

interface SpeechRecognitionHook {
  transcript: string
  isListening: boolean
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  error: string | null
  setError: (error: string | null) => void
}

type SpeechRecognitionType = any

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionType | null>(null)
  const retryCountRef = useRef(0)
  const maxRetries = 3

  // 1. recognition 객체 생성 (한 번만)
  useEffect(() => {
    console.log('🔧 SpeechRecognition 초기화 시작...')
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error('❌ SpeechRecognition API가 지원되지 않습니다.')
      setError('이 브라우저는 음성 인식을 지원하지 않습니다.')
      return
    }

    console.log('✅ SpeechRecognition API 발견:', SpeechRecognition.name)

    try {
      const recognition = new SpeechRecognition()
      console.log('✅ SpeechRecognition 객체 생성 성공')
      
      // 기본 설정
      recognition.continuous = true
      recognition.interimResults = true
      recognition.maxAlternatives = 1
      recognition.lang = 'ko-KR,en-US'

      // 추가 설정으로 안정성 향상
      recognition.grammars = null
      recognition.serviceURI = ''

      recognitionRef.current = recognition
      setIsInitialized(true)
      console.log('🎤 SpeechRecognition 초기화 완료')
    } catch (err) {
      console.error('❌ SpeechRecognition 객체 생성 실패:', err)
      setError('음성 인식 초기화에 실패했습니다.')
      setIsInitialized(false)
    }
  }, [])

  // 2. 이벤트 리스너 등록 (초기화 완료 후)
  useEffect(() => {
    if (!isInitialized) return

    const recognition = recognitionRef.current
    if (!recognition) {
      console.error('❌ recognition 객체가 없습니다.')
      return
    }

    console.log('🔧 이벤트 리스너 등록 중...')

    const handleStart = () => {
      console.log('🎤 음성 인식 시작됨')
      setIsListening(true)
      setError(null)
      retryCountRef.current = 0
    }

    const handleResult = (event: any) => {
      console.log('🎤 음성 인식 결과:', event)
      
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        console.log('🔇 TTS 중이므로 음성 인식 결과 무시')
        return
      }

      let finalTranscript = ''
      let interimTranscript = ''
      
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      if (interimTranscript) {
        console.log('🎤 중간 결과:', interimTranscript)
        setTranscript(interimTranscript)
      }

      if (finalTranscript) {
        console.log('🎤 최종 결과:', finalTranscript)
        setTranscript(finalTranscript)
      }
    }

    const handleError = (event: any) => {
      console.log('🎤 음성 인식 오류:', event.error)
      
      const retryableErrors = ['network', 'no-speech', 'audio-capture', 'not-allowed']
      
      if (retryableErrors.includes(event.error) && retryCountRef.current < maxRetries) {
        retryCountRef.current++
        console.log(`🔄 ${event.error} 오류로 재시도 중... (${retryCountRef.current}/${maxRetries})`)
        
        setTimeout(() => {
          if (recognitionRef.current && isListening) {
            try {
              recognitionRef.current.start()
            } catch (e) {
              console.log('🔄 재시도 실패:', e)
              setIsListening(false)
              setError(`음성 인식 재시도 실패: ${event.error}`)
            }
          }
        }, 1000)
        return
      }
      
      setIsListening(false)
      
      const errorMessages: { [key: string]: string } = {
        'network': '네트워크 연결 오류입니다.',
        'no-speech': '음성이 감지되지 않았습니다.',
        'audio-capture': '마이크 접근 오류입니다.',
        'not-allowed': '마이크 권한이 거부되었습니다.',
        'aborted': '음성 인식이 중단되었습니다.',
        'service-not-allowed': '음성 인식 서비스가 허용되지 않았습니다.',
        'bad-grammar': '문법 오류가 발생했습니다.',
        'language-not-supported': '지원되지 않는 언어입니다.'
      }
      
      const errorMessage = errorMessages[event.error] || `음성 인식 오류: ${event.error}`
      setError(errorMessage)
    }

    const handleEnd = () => {
      console.log('🎤 음성 인식 종료됨')
      setIsListening(false)
      
      if (retryCountRef.current < maxRetries) {
        setTimeout(() => {
          if (recognitionRef.current && isListening) {
            try {
              recognitionRef.current.start()
            } catch (e) {
              console.log('🔄 자동 재시작 실패:', e)
            }
          }
        }, 100)
      }
    }

    recognition.addEventListener('start', handleStart)
    recognition.addEventListener('result', handleResult)
    recognition.addEventListener('error', handleError)
    recognition.addEventListener('end', handleEnd)

    console.log('✅ 이벤트 리스너 등록 완료')

    return () => {
      recognition.removeEventListener('start', handleStart)
      recognition.removeEventListener('result', handleResult)
      recognition.removeEventListener('error', handleError)
      recognition.removeEventListener('end', handleEnd)
    }
  }, [isInitialized, isListening])

  // 3. startListening
  const startListening = useCallback(() => {
    console.log('🎤 startListening 호출됨')
    console.log('🔧 초기화 상태:', isInitialized)
    console.log('🔧 recognition 객체:', recognitionRef.current)
    
    if (!isInitialized) {
      console.error('❌ 아직 초기화되지 않았습니다.')
      setError('음성 인식이 아직 초기화되지 않았습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    const recognition = recognitionRef.current
    if (!recognition) {
      console.error('❌ recognition 객체가 없습니다.')
      setError('음성 인식이 초기화되지 않았습니다.')
      return
    }

    setError(null)
    retryCountRef.current = 0

    try {
      console.log('🎤 음성 인식 시작 시도...')
      recognition.start()
    } catch (error: any) {
      console.error('❌ 음성 인식 시작 실패:', error)
      
      if (error.message?.includes('network') || error.name === 'NetworkError') {
        console.log('🔄 network 오류로 재시도...')
        setTimeout(() => {
          startListening()
        }, 2000)
        return
      }
      
      setError(`음성 인식 시작 실패: ${error.message}`)
      setIsListening(false)
    }
  }, [isInitialized])

  // 4. stopListening
  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current
    if (recognition) {
      try {
        recognition.stop()
        console.log('🎤 음성 인식 중지')
        retryCountRef.current = maxRetries
      } catch (error) {
        console.error('🎤 음성 인식 중지 실패:', error)
      }
    }
  }, [])

  // 5. resetTranscript
  const resetTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error,
    setError
  }
} 