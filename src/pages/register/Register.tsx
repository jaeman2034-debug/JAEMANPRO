import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()
  const { transcript, isListening, startListening, stopListening, resetTranscript } = useSpeechRecognition()
  const { speak } = useSpeechSynthesis()

  const handleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode)
    if (!isVoiceMode) {
      speak('음성 모드가 활성화되었습니다. 이메일을 말씀해 주세요.')
      startListening()
    } else {
      stopListening()
      speak('음성 모드가 비활성화되었습니다.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await register(email, password)
      speak('회원가입이 완료되었습니다.')
      navigate('/login')
    } catch (error: any) {
      setError(error.message)
      speak('회원가입에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailInput = (value: string) => {
    setEmail(value)
    if (isVoiceMode) {
      speak('이메일이 입력되었습니다. 비밀번호를 말씀해 주세요.')
      resetTranscript()
    }
  }

  const handlePasswordInput = (value: string) => {
    setPassword(value)
    if (isVoiceMode) {
      speak('비밀번호가 입력되었습니다. 비밀번호 확인을 말씀해 주세요.')
      resetTranscript()
    }
  }

  const handleConfirmPasswordInput = (value: string) => {
    setConfirmPassword(value)
    if (isVoiceMode) {
      speak('비밀번호 확인이 입력되었습니다. 회원가입을 진행합니다.')
      resetTranscript()
    }
  }

  // 음성 인식 결과 처리
  React.useEffect(() => {
    if (transcript && isVoiceMode) {
      const text = transcript.toLowerCase().trim()
      
      // 이메일 입력
      if (!email) {
        // 이메일 패턴 매칭
        const emailMatch = text.match(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
        if (emailMatch) {
          handleEmailInput(emailMatch[0])
        } else {
          // 간단한 이메일 변환
          let emailText = text
            .replace(/\s+/g, '')
            .replace(/골뱅이/g, '@')
            .replace(/닷/g, '.')
            .replace(/점/g, '.')
          
          if (!emailText.includes('@')) {
            emailText += '@gmail.com'
          }
          handleEmailInput(emailText)
        }
      }
      // 비밀번호 입력
      else if (!password) {
        const cleanPassword = text.replace(/\s+/g, '')
        handlePasswordInput(cleanPassword)
      }
      // 비밀번호 확인 입력
      else if (!confirmPassword) {
        const cleanConfirmPassword = text.replace(/\s+/g, '')
        handleConfirmPasswordInput(cleanConfirmPassword)
      }
    }
  }, [transcript, isVoiceMode])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          회원가입
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 음성 모드 토글 */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleVoiceMode}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isVoiceMode
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isVoiceMode ? '🎤 음성 모드 ON' : '🎤 음성 모드 OFF'}
              </button>
            </div>

            {/* 음성 상태 표시 */}
            {isVoiceMode && (
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  isListening 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}></span>
                  {isListening ? '음성 인식 중...' : '음성 인식 대기'}
                </div>
                {transcript && (
                  <p className="mt-2 text-sm text-gray-600">
                    인식된 음성: {transcript}
                  </p>
                )}
              </div>
            )}

            {/* 이메일 입력 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일 주소
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="example@gmail.com"
                />
              </div>
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="최소 6자 이상"
                />
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="비밀번호를 다시 입력하세요"
                />
              </div>
            </div>

            {/* 오류 메시지 */}
            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {/* 회원가입 버튼 */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? '처리 중...' : '회원가입'}
              </button>
            </div>
          </form>

          {/* 로그인 링크 */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">이미 계정이 있으신가요?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                로그인하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register 