import { useState, useRef, useCallback, useEffect } from 'react'
import { nluService, Entity } from '../services/nluService'

interface AdvancedSpeechRecognitionHook {
  transcript: string
  isListening: boolean
  intent: string | null
  entities: Entity[]
  confidence: number
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  error: string | null
  isProcessing: boolean
}

export const useAdvancedSpeechRecognition = (): AdvancedSpeechRecognitionHook => {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [intent, setIntent] = useState<string | null>(null)
  const [entities, setEntities] = useState<Entity[]>([])
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const recognitionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  // const audioChunksRef = useRef<Blob[]>([])

  // 1. recognition 객체 생성
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('이 브라우저는 음성 인식을 지원하지 않습니다.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.lang = 'ko-KR,en-US'

    recognitionRef.current = recognition
  }, [])

  // 2. 이벤트 리스너 등록
  useEffect(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    const handleStart = () => {
      console.log('🎤 고급 음성 인식 시작됨')
      setIsListening(true)
      setError(null)
      setIsProcessing(false)
    }

    const handleResult = async (event: any) => {
      console.log('🎤 고급 음성 인식 결과:', event)
      
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        console.log('🔇 TTS 중이므로 음성 인식 결과 무시')
        return
      }

      let finalTranscript = ''
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        }
      }

      if (finalTranscript) {
        console.log('🎤 최종 결과:', finalTranscript)
        setTranscript(finalTranscript)
        
        // NLU 처리
        setIsProcessing(true)
        try {
          const intentResult = await nluService.processVoiceInput(undefined, finalTranscript)
          setIntent(intentResult.intent)
          setEntities(intentResult.entities)
          setConfidence(intentResult.confidence)
          console.log('🧠 NLU 결과:', intentResult)
        } catch (error) {
          console.error('🧠 NLU 처리 실패:', error)
          setError('음성 이해 처리에 실패했습니다.')
        } finally {
          setIsProcessing(false)
        }
      }
    }

    const handleError = (event: any) => {
      console.log('🎤 고급 음성 인식 오류:', event.error)
      setIsListening(false)
      setIsProcessing(false)
      setError(`음성 인식 오류: ${event.error}`)
    }

    const handleEnd = () => {
      console.log('🎤 고급 음성 인식 종료됨')
      setIsListening(false)
    }

    recognition.addEventListener('start', handleStart)
    recognition.addEventListener('result', handleResult)
    recognition.addEventListener('error', handleError)
    recognition.addEventListener('end', handleEnd)

    return () => {
      recognition.removeEventListener('start', handleStart)
      recognition.removeEventListener('result', handleResult)
      recognition.removeEventListener('error', handleError)
      recognition.removeEventListener('end', handleEnd)
    }
  }, [])

  // 3. Whisper API를 사용한 고급 음성 인식 (현재 사용하지 않음)
  // const startListeningWithWhisper = useCallback(async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  //     const mediaRecorder = new MediaRecorder(stream, {
  //       mimeType: 'audio/webm;codecs=opus'
  //     })
  //     
  //     mediaRecorderRef.current = mediaRecorder
  //     audioChunksRef.current = []

  //     mediaRecorder.ondataavailable = (event) => {
  //       if (event.data.size > 0) {
  //         audioChunksRef.current.push(event.data)
  //       }
  //     }

  //     mediaRecorder.onstop = async () => {
  //       const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
  //       setIsProcessing(true)
  //       
  //       try {
  //         const intentResult = await nluService.processVoiceInput(audioBlob)
  //         setTranscript(intentResult.rawText)
  //         setIntent(intentResult.intent)
  //         setEntities(intentResult.entities)
  //         setConfidence(intentResult.confidence)
  //         console.log('🧠 Whisper + NLU 결과:', intentResult)
  //       } catch (error) {
  //         console.error('🧠 Whisper 처리 실패:', error)
  //         setError('고급 음성 인식에 실패했습니다.')
  //       } finally {
  //         setIsProcessing(false)
  //       }
  //     }

  //     mediaRecorder.start()
  //     setIsListening(true)
  //     setError(null)
  //     
  //     // 10초 후 자동 중지
  //     setTimeout(() => {
  //       if (mediaRecorder.state === 'recording') {
  //         mediaRecorder.stop()
  //         stream.getTracks().forEach(track => track.stop())
  //       }
  //     }, 10000)

  //   } catch (error) {
  //     console.error('🎤 Whisper 음성 인식 시작 실패:', error)
  //     setError('마이크 접근에 실패했습니다.')
  //     setIsListening(false)
  //   }
  // }, [])

  // 4. 기본 음성 인식 시작
  const startListening = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition) {
      setError('음성 인식이 초기화되지 않았습니다.')
      return
    }

    try {
      console.log('🎤 기본 음성 인식 시작')
      recognition.start()
    } catch (error: any) {
      console.error('🎤 음성 인식 시작 실패:', error)
      setError(`음성 인식 시작 실패: ${error.message}`)
      setIsListening(false)
    }
  }, [])

  // 5. 음성 인식 중지
  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current
    const mediaRecorder = mediaRecorderRef.current
    
    if (recognition) {
      try {
        recognition.stop()
        console.log('🎤 기본 음성 인식 중지')
      } catch (error) {
        console.error('🎤 음성 인식 중지 실패:', error)
      }
    }
    
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
      console.log('🎤 Whisper 음성 인식 중지')
    }
  }, [])

  // 6. 트랜스크립트 리셋
  const resetTranscript = useCallback(() => {
    setTranscript('')
    setIntent(null)
    setEntities([])
    setConfidence(0)
    setError(null)
  }, [])

  return {
    transcript,
    isListening,
    intent,
    entities,
    confidence,
    startListening,
    stopListening,
    resetTranscript,
    error,
    isProcessing
  }
} 