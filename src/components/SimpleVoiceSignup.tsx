import React, { useState, useCallback } from 'react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { registerUser } from '../firebase/auth'
import { analyzeSignupIntent } from '../nlu/analyzeSpeechText'
import { useNavigate } from 'react-router-dom'

interface UserData {
  name: string
  email: string
  password: string
  phone: string
}

const SimpleVoiceSignup: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    password: '',
    phone: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const navigate = useNavigate()
  const { speak } = useSpeechSynthesis()
  const { transcript, startListening, stopListening } = useSpeechRecognition()

  // 음성 인식 시작
  const handleStartListening = useCallback(() => {
    setIsListening(true)
    setError('')
    setAnalysisResult(null)
    speak('회원가입 정보를 말씀해주세요. 이름, 이메일, 비밀번호, 전화번호를 포함해서 말씀해주세요.')
    startListening()
  }, [speak, startListening])

  // 음성 인식 중지 및 분석
  const handleStopListening = useCallback(async () => {
    setIsListening(false)
    stopListening()
    
    if (transcript.trim()) {
      try {
        const result = await analyzeSignupIntent(transcript)
        setAnalysisResult(result)
        console.log('🎯 분석 결과:', result)
        
        // 분석된 데이터로 폼 업데이트
        if (result.entities) {
          setUserData(prev => ({
            ...prev,
            name: result.entities.name || prev.name,
            email: result.entities.email || prev.email,
            password: result.entities.password || prev.password,
            phone: result.entities.phone || prev.phone
          }))
        }
        
        speak('정보가 분석되었습니다. 확인 후 회원가입 버튼을 눌러주세요.')
      } catch (error) {
        console.error('분석 실패:', error)
        setError('음성 분석에 실패했습니다. 다시 시도해주세요.')
        speak('음성 분석에 실패했습니다. 다시 시도해주세요.')
      }
    }
  }, [transcript, stopListening, speak])

  // 회원가입 처리
  const handleSignup = useCallback(async () => {
    if (!userData.email || !userData.password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      speak('이메일과 비밀번호를 입력해주세요.')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      const result = await registerUser(userData.email, userData.password)
      if (result.success) {
        speak('회원가입이 완료되었습니다.')
        navigate('/login')
      } else {
        setError(result.error || '회원가입에 실패했습니다.')
        speak('회원가입에 실패했습니다.')
      }
    } catch (error: any) {
      setError(error.message)
      speak('회원가입에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [userData, navigate, speak])

  // 입력 필드 변경
  const handleInputChange = useCallback((field: keyof UserData, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          🎤 간단한 음성 회원가입
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          음성으로 모든 정보를 한 번에 입력하세요
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* 음성 인식 상태 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm text-blue-700">
                {isListening ? '음성 인식 중...' : '음성 인식 대기'}
              </span>
            </div>
            
            {transcript && (
              <p className="text-sm text-gray-600 mb-2">
                인식된 음성: {transcript}
              </p>
            )}
            
            {analysisResult && (
              <div className="text-sm text-green-600 mb-2">
                <p>🎯 분석 완료: {analysisResult.intent}</p>
                {analysisResult.entities && (
                  <div className="text-purple-600 mt-1">
                    <p>이름: {analysisResult.entities.name || '미인식'}</p>
                    <p>이메일: {analysisResult.entities.email || '미인식'}</p>
                    <p>비밀번호: {analysisResult.entities.password ? '***' : '미인식'}</p>
                    <p>전화번호: {analysisResult.entities.phone || '미인식'}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 음성 제어 버튼 */}
          <div className="mb-6 flex space-x-2">
            <button
              onClick={handleStartListening}
              disabled={isListening}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              🎤 음성 입력 시작
            </button>
            
            {isListening && (
              <button
                onClick={handleStopListening}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
              >
                ⏹️ 중지
              </button>
            )}
          </div>

          {/* 입력 필드들 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">이름</label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="이름을 입력하세요"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">이메일</label>
              <input
                type="email"
                value={userData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="이메일을 입력하세요"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">비밀번호</label>
              <input
                type="password"
                value={userData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">전화번호</label>
              <input
                type="tel"
                value={userData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="전화번호를 입력하세요"
              />
            </div>
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div className="mt-4 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* 회원가입 버튼 */}
          <div className="mt-6">
            <button
              onClick={handleSignup}
              disabled={isLoading || !userData.email || !userData.password}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? '처리 중...' : '회원가입'}
            </button>
          </div>

          {/* 취소 버튼 */}
          <div className="mt-4">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              취소
            </button>
          </div>

          {/* 사용법 안내 */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">💡 사용법</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• "이름은 이재만이고, 이메일은 jaeman2034@gmail.com, 비밀번호는 password123, 전화번호는 01012345678입니다"</p>
              <p>• 모든 정보를 한 번에 말씀하시면 자동으로 분석됩니다</p>
              <p>• 분석 후 필요시 수동으로 수정할 수 있습니다</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleVoiceSignup 