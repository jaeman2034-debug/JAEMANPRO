import { useState, useEffect, useCallback } from 'react'

interface SpeechRecognitionHook {
  transcript: string
  isListening: boolean
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  error: string | null
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Web Speech API 지원 확인
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  console.log('SpeechRecognition 지원 여부:', !!SpeechRecognition)
  console.log('window.SpeechRecognition:', !!window.SpeechRecognition)
  console.log('window.webkitSpeechRecognition:', !!window.webkitSpeechRecognition)

  const recognition = SpeechRecognition ? new SpeechRecognition() : null

  console.log('recognition 객체 생성:', !!recognition)
  
  // 음성 인식 객체가 없으면 에러 설정
  if (!recognition) {
    console.error('음성 인식이 지원되지 않는 브라우저입니다.')
    setError('이 브라우저는 음성 인식을 지원하지 않습니다.')
  }

  useEffect(() => {
    if (!recognition) {
      setError('이 브라우저는 음성 인식을 지원하지 않습니다.')
      return
    }

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'ko-KR'
    recognition.maxAlternatives = 1
    
    console.log('음성 인식 설정 완료:', {
      continuous: recognition.continuous,
      interimResults: recognition.interimResults,
      lang: recognition.lang
    })

    recognition.onstart = () => {
      console.log('음성 인식 시작됨')
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event) => {
      console.log('음성 인식 결과 이벤트:', event)
      console.log('결과 개수:', event.results.length)
      console.log('결과 인덱스:', event.resultIndex)
      
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript
        const isFinal = result.isFinal
        
        console.log(`결과 ${i}:`, { transcript, isFinal })
        
        if (isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      const newTranscript = finalTranscript + interimTranscript
      console.log('최종 transcript:', newTranscript)
      console.log('finalTranscript:', finalTranscript)
      console.log('interimTranscript:', interimTranscript)
      setTranscript(newTranscript)
    }

    recognition.onerror = (event) => {
      console.error('음성 인식 에러:', event.error)
      setError(`음성 인식 에러: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      console.log('음성 인식 종료됨')
      setIsListening(false)
    }

    return () => {
      if (recognition) {
        recognition.abort()
      }
    }
  }, [recognition])

  const startListening = useCallback(async () => {
    console.log('startListening 호출됨')
    console.log('recognition:', !!recognition)
    console.log('isListening:', isListening)
    console.log('SpeechRecognition 지원:', !!window.SpeechRecognition)
    console.log('webkitSpeechRecognition 지원:', !!window.webkitSpeechRecognition)
    
    if (!recognition) {
      setError('음성 인식이 지원되지 않는 브라우저입니다. Chrome이나 Edge를 사용해주세요.')
      return
    }
    
    if (isListening) {
      console.log('이미 음성 인식 중입니다.')
      return
    }
    
    try {
      // 기존 음성 인식 중지 (다른 인스턴스와의 충돌 방지)
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      
      console.log('음성 인식 시작 시도...')
      recognition.start()
    } catch (error: any) {
      console.error('음성 인식 시작 에러:', error)
      setError(`음성 인식을 시작할 수 없습니다: ${error.message}`)
    }
  }, [recognition, isListening])

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop()
    }
  }, [recognition, isListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error
  }
} 