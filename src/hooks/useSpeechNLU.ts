import React, { useState, useCallback } from 'react'
import { useSpeechRecognition } from './useSpeechRecognition'
import { useSpeechSynthesis } from './useSpeechSynthesis'
import { analyzeSignupIntent } from '../nlu/analyzeSpeechText'
import { registerUser } from '../firebase/auth'

interface FormType {
  name: string
  email: string
  password: string
  phone: string
}

interface SpeechNLUResult {
  startVoiceSignup: () => void
  transcript: string
  form: FormType | null
  loading: boolean
  error: string | null
  isListening: boolean
  stopListening: () => void
}

export const useSpeechNLU = (): SpeechNLUResult => {
  const [transcript, setTranscript] = useState("")
  const [form, setForm] = useState<FormType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { speak } = useSpeechSynthesis()
  const { 
    transcript: speechTranscript, 
    isListening, 
    startListening, 
    stopListening: stopSpeechListening 
  } = useSpeechRecognition()

  // 음성 인식 결과 처리
  const onResult = useCallback(async (text: string) => {
    console.log('🎤 음성 인식 결과:', text)
    setTranscript(text)
    setLoading(true)
    setError(null)
    
    try {
      const { intent, entities } = await analyzeSignupIntent(text)
      console.log('🎯 NLU 분석 결과:', { intent, entities })
      
      if (intent === "회원가입" && entities.email && entities.password) {
        setForm(entities)
        speak("정보가 분석되었습니다. 회원가입을 진행합니다.")
        
        // Firebase 회원가입 처리
        const result = await registerUser(entities.email, entities.password)
        if (result.success) {
          speak("회원가입이 완료되었습니다.")
        } else {
          setError(result.error || '회원가입에 실패했습니다.')
          speak("회원가입에 실패했습니다.")
        }
      } else {
        setError("정보가 부족합니다. 다시 말씀해주세요.")
        speak("정보가 부족합니다. 다시 말씀해주세요.")
      }
    } catch (error) {
      console.error('NLU 처리 실패:', error)
      setError("음성 분석에 실패했습니다. 다시 시도해주세요.")
      speak("음성 분석에 실패했습니다. 다시 시도해주세요.")
    } finally {
      setLoading(false)
    }
  }, [speak])

  // 음성 인식 결과 자동 처리
  React.useEffect(() => {
    if (speechTranscript && speechTranscript !== transcript) {
      setTranscript(speechTranscript)
      // 음성 인식이 끝나면 자동으로 분석 시작
      if (!isListening) {
        onResult(speechTranscript)
      }
    }
  }, [speechTranscript, transcript, isListening, onResult])

  // 음성 인식 시작
  const startVoiceSignup = useCallback(() => {
    setError(null)
    setForm(null)
    speak("회원가입 정보를 말씀해주세요. 이름, 이메일, 비밀번호, 전화번호를 포함해서 말씀해주세요.")
    startListening()
  }, [speak, startListening])

  // 음성 인식 중지
  const stopListening = useCallback(() => {
    stopSpeechListening()
  }, [stopSpeechListening])

  return { 
    startVoiceSignup, 
    transcript, 
    form, 
    loading, 
    error, 
    isListening, 
    stopListening 
  }
} 