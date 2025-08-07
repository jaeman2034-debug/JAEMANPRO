import { useState, useCallback } from 'react'
import { useSpeechRecognition } from './useSpeechRecognition'
import { useSpeechSynthesis } from './useSpeechSynthesis'
// Firebase 의존성 제거
// import { registerUser } from '../firebase/auth'

// 더미 회원가입 함수
const registerUser = async (email: string, _password: string) => {
  console.log('더미: 회원가입 시도', email)
  return { success: false, error: 'Firebase가 비활성화되었습니다.' }
}

export const useSpeechNLU = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { transcript, isListening, startListening, stopListening } = useSpeechRecognition()
  const { speak } = useSpeechSynthesis()

  const startVoiceSignup = useCallback(() => {
    setError(null)
    setIsProcessing(false)
    startListening()
  }, [startListening])

  const handleSignup = useCallback(async (email: string, password: string) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const result = await registerUser(email, password)
      if (result.success) {
        speak('회원가입이 완료되었습니다.')
        return { success: true }
      } else {
        setError(result.error || '회원가입에 실패했습니다.')
        speak('회원가입에 실패했습니다.')
        return { success: false, error: result.error }
      }
    } catch (error: any) {
      setError(error.message || '회원가입 중 오류가 발생했습니다.')
      speak('회원가입 중 오류가 발생했습니다.')
      return { success: false, error: error.message }
    } finally {
      setIsProcessing(false)
    }
  }, [speak])

  return {
    transcript,
    isListening,
    isProcessing,
    error,
    startVoiceSignup,
    stopListening,
    handleSignup
  }
} 