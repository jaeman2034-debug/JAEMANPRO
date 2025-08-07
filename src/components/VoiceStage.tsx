import React, { useState, useEffect, useCallback } from 'react'
import { useAdvancedSpeechRecognition } from '../hooks/useAdvancedSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { advancedNluService, GPTResponse } from '../services/advancedNluService'

interface UserData {
  name: string
  email: string
  password: string
  phone: string
}

interface Stage {
  id: number
  name: string
  prompt: string
  field: keyof UserData
  validation: (value: string) => boolean
  errorMessage: string
}

const STAGES: Stage[] = [
  {
    id: 0,
    name: '이름',
    prompt: '이름을 말씀해주세요',
    field: 'name',
    validation: (value: string) => value.length >= 2,
    errorMessage: '이름은 2자 이상이어야 합니다'
  },
  {
    id: 1,
    name: '이메일',
    prompt: '이메일을 말씀해주세요',
    field: 'email',
    validation: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    errorMessage: '올바른 이메일 형식을 입력해주세요'
  },
  {
    id: 2,
    name: '비밀번호',
    prompt: '비밀번호를 말씀해주세요 (최소 6자)',
    field: 'password',
    validation: (value: string) => value.length >= 6,
    errorMessage: '비밀번호는 6자 이상이어야 합니다'
  },
  {
    id: 3,
    name: '전화번호',
    prompt: '전화번호를 말씀해주세요',
    field: 'phone',
    validation: (value: string) => /^010\d{8}$/.test(value),
    errorMessage: '올바른 전화번호 형식을 입력해주세요'
  },
  {
    id: 4,
    name: '확인',
    prompt: '회원가입을 진행하시겠습니까?',
    field: 'name',
    validation: () => true,
    errorMessage: ''
  }
]

const VoiceStage: React.FC = () => {
  const [currentStage, setCurrentStage] = useState(0)
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    password: '',
    phone: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isKeyboardMode, setIsKeyboardMode] = useState(false)
  const [gptResponse, setGptResponse] = useState<GPTResponse | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const { register } = useAuth()
  const navigate = useNavigate()
  const { speak } = useSpeechSynthesis()
  const {
    transcript,
    isListening,
    intent,
    entities,
    confidence,
    startListening,
    // stopListening,
    resetTranscript,
    error: speechError,
    isProcessing
  } = useAdvancedSpeechRecognition()

  const currentStageData = STAGES[currentStage]

  // 음성 인식 결과 처리
  useEffect(() => {
    if (transcript && !isProcessing && confidence > 0.5) {
      handleVoiceInput(transcript)
    }
  }, [transcript, isProcessing, confidence])

  // 음성 명령어 처리
  useEffect(() => {
    if (intent) {
      handleIntent(intent)
    }
  }, [intent])

  // 엔티티 처리
  useEffect(() => {
    if (entities.length > 0) {
      handleEntities(entities)
    }
  }, [entities])

  // 음성 입력 처리 (고급 NLU 사용)
  const handleVoiceInput = useCallback(async (text: string) => {
    console.log('🎤 음성 입력 처리:', text)
    
    try {
      // 고급 NLU 처리
      const stageName = STAGES[currentStage].name.toLowerCase()
      const gptResult = await advancedNluService.processVoiceInput(text, stageName)
      setGptResponse(gptResult)
      setSuggestions(gptResult.suggestions)
      
      console.log('🤖 GPT 분석 결과:', gptResult)
      
      if (currentStage === 4) {
        // 확인 단계
        if (gptResult.intent === 'confirm') {
          handleSignup()
        } else if (gptResult.intent === 'cancel') {
          speak('회원가입이 취소되었습니다.')
          navigate('/')
        } else {
          speak('네 또는 아니오로 답변해주세요.')
        }
        return
      }
      
      // 엔티티에서 값 추출
      const entity = gptResult.entities.find(e => e.type === currentStageData.field)
      if (entity && entity.confidence > 0.7) {
        const value = entity.value
        setUserData(prev => ({ ...prev, [currentStageData.field]: value }))
        
        if (currentStageData.validation(value)) {
          nextStage()
        } else {
          handleValidationError()
        }
      } else {
        // 엔티티가 없으면 전체 텍스트 사용
        const value = text.trim()
        setUserData(prev => ({ ...prev, [currentStageData.field]: value }))
        
        if (currentStageData.validation(value)) {
          nextStage()
        } else {
          handleValidationError()
        }
      }
    } catch (error) {
      console.error('고급 NLU 처리 실패:', error)
      // 폴백: 기본 처리
      handleFallbackVoiceInput(text)
    }
  }, [currentStage, currentStageData, navigate, speak])
  
  // 폴백 음성 입력 처리
  const handleFallbackVoiceInput = useCallback((text: string) => {
    console.log('🔄 폴백 음성 입력 처리:', text)
    
    if (currentStage === 4) {
      if (text.toLowerCase().includes('네') || text.toLowerCase().includes('확인')) {
        handleSignup()
      } else if (text.toLowerCase().includes('아니오') || text.toLowerCase().includes('취소')) {
        speak('회원가입이 취소되었습니다.')
        navigate('/')
      }
      return
    }

    // 엔티티에서 값 추출
    const entity = entities.find(e => e.type === currentStageData.field)
    if (entity) {
      const value = entity.value
      setUserData(prev => ({ ...prev, [currentStageData.field]: value }))
      
      if (currentStageData.validation(value)) {
        nextStage()
      } else {
        handleValidationError()
      }
    } else {
      // 엔티티가 없으면 전체 텍스트 사용
      const value = text.trim()
      setUserData(prev => ({ ...prev, [currentStageData.field]: value }))
      
      if (currentStageData.validation(value)) {
        nextStage()
      } else {
        handleValidationError()
      }
    }
  }, [currentStage, entities, currentStageData, navigate, speak])

  // 의도 처리
  const handleIntent = useCallback((intent: string) => {
    console.log('🧠 의도 처리:', intent)
    
    switch (intent) {
      case 'retry':
        setRetryCount(prev => prev + 1)
        speak('다시 말씀해주세요.')
        resetTranscript()
        break
      case 'cancel':
        speak('회원가입이 취소되었습니다.')
        navigate('/')
        break
      case 'confirm':
        if (currentStage === 4) {
          handleSignup()
        }
        break
    }
  }, [currentStage, navigate, speak, resetTranscript])

  // 엔티티 처리
  const handleEntities = useCallback((entities: any[]) => {
    console.log('🏷️ 엔티티 처리:', entities)
    
    entities.forEach(entity => {
      if (entity.type === currentStageData.field) {
        setUserData(prev => ({ ...prev, [entity.type]: entity.value }))
      }
    })
  }, [currentStageData.field])

  // 다음 단계로 이동
  const nextStage = useCallback(() => {
    if (currentStage < STAGES.length - 1) {
      const nextStageIndex = currentStage + 1
      setCurrentStage(nextStageIndex)
      setRetryCount(0)
      setError('')
      
      const nextStageData = STAGES[nextStageIndex]
      speak(nextStageData.prompt)
      
      // 다음 단계에서 음성 인식 시작
      setTimeout(() => {
        startListening()
      }, 2000)
    }
  }, [currentStage, speak, startListening])

  // 검증 오류 처리 (스마트 재시도)
  const handleValidationError = useCallback(() => {
    setError(currentStageData.errorMessage)
    setRetryCount(prev => prev + 1)
    
    // 스마트 재시도 제안
    const suggestion = advancedNluService.generateRetrySuggestion(
      currentStageData.name.toLowerCase(),
      retryCount
    )
    
    speak(suggestion)
    setSuggestions([suggestion])
    
    if (retryCount >= 2) {
      speak('키보드 입력으로 전환하겠습니다.')
      setIsKeyboardMode(true)
    } else {
      resetTranscript()
      setTimeout(() => {
        startListening()
      }, 1000)
    }
  }, [currentStageData, retryCount, speak, resetTranscript, startListening])

  // 회원가입 처리
  const handleSignup = useCallback(async () => {
    setIsLoading(true)
    setError('')
    
    try {
      await register(userData.email, userData.password)
      speak('회원가입이 완료되었습니다.')
      navigate('/login')
    } catch (error: any) {
      setError(error.message)
      speak('회원가입에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [userData, register, navigate, speak])

  // 음성 모드 시작
  const startVoiceMode = useCallback(() => {
    setIsKeyboardMode(false)
    setRetryCount(0)
    setError('')
    speak(currentStageData.prompt)
    
    setTimeout(() => {
      startListening()
    }, 1000)
  }, [currentStageData.prompt, speak, startListening])

  // 키보드 입력 처리
  const handleKeyboardInput = useCallback((field: keyof UserData, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }))
  }, [])

  // 키보드로 다음 단계
  const handleKeyboardNext = useCallback(() => {
    const currentValue = userData[currentStageData.field]
    
    if (currentStageData.validation(currentValue)) {
      nextStage()
    } else {
      setError(currentStageData.errorMessage)
    }
  }, [userData, currentStageData, nextStage])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          음성 회원가입
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          단계 {currentStage + 1} / {STAGES.length}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* 현재 단계 표시 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {currentStageData.name}
              </h3>
              <span className="text-sm text-gray-500">
                {currentStage + 1} / {STAGES.length}
              </span>
            </div>
            
            {/* 진행 바 */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStage + 1) / STAGES.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* 음성 상태 표시 */}
          {!isKeyboardMode && (
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
              
                             {gptResponse && (
                 <div className="text-sm text-green-600 mb-2">
                   <p>🤖 GPT 의도: {gptResponse.intent} (신뢰도: {Math.round(gptResponse.confidence * 100)}%)</p>
                   {gptResponse.entities.length > 0 && (
                     <p className="text-purple-600">
                       추출된 정보: {gptResponse.entities.map(e => `${e.type}: ${e.value}`).join(', ')}
                     </p>
                   )}
                 </div>
               )}
               
               {intent && !gptResponse && (
                 <p className="text-sm text-green-600 mb-2">
                   의도: {intent} (신뢰도: {Math.round(confidence * 100)}%)
                 </p>
               )}
               
               {entities.length > 0 && !gptResponse && (
                 <div className="text-sm text-purple-600">
                   추출된 정보: {entities.map(e => `${e.type}: ${e.value}`).join(', ')}
                 </div>
               )}
              
                             {isProcessing && (
                 <p className="text-sm text-orange-600">
                   처리 중...
                 </p>
               )}
               
               {suggestions.length > 0 && (
                 <div className="text-sm text-blue-600 mt-2">
                   💡 제안: {suggestions[0]}
                 </div>
               )}
            </div>
          )}

          {/* 현재 단계 프롬프트 */}
          <div className="mb-6 text-center">
            <p className="text-lg font-medium text-gray-900 mb-2">
              {currentStageData.prompt}
            </p>
            
            {currentStage < 4 && (
              <div className="text-sm text-gray-600">
                현재 입력: {userData[currentStageData.field] || '없음'}
              </div>
            )}
          </div>

          {/* 키보드 입력 모드 */}
          {isKeyboardMode && currentStage < 4 && (
            <div className="mb-6">
              <input
                type={currentStageData.field === 'password' ? 'password' : 'text'}
                value={userData[currentStageData.field]}
                onChange={(e) => handleKeyboardInput(currentStageData.field, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={currentStageData.prompt}
              />
              <button
                onClick={handleKeyboardNext}
                className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                다음
              </button>
            </div>
          )}

          {/* 오류 메시지 */}
          {error && (
            <div className="mb-4 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* 음성 인식 오류 */}
          {speechError && (
            <div className="mb-4 text-red-600 text-sm text-center">
              {speechError}
            </div>
          )}

          {/* 제어 버튼들 */}
          <div className="flex flex-col space-y-2">
            {!isKeyboardMode && (
              <>
                <button
                  onClick={startVoiceMode}
                  disabled={isListening}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  🎤 음성으로 입력
                </button>
                
                <button
                  onClick={() => setIsKeyboardMode(true)}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                >
                  ⌨️ 키보드로 입력
                </button>
              </>
            )}
            
            {isKeyboardMode && (
              <button
                onClick={startVoiceMode}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                🎤 음성 모드로 전환
              </button>
            )}
            
            <button
              onClick={() => navigate('/')}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
            >
              취소
            </button>
          </div>

          {/* 사용자 데이터 요약 (확인 단계) */}
          {currentStage === 4 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">입력된 정보</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>이름: {userData.name}</div>
                <div>이메일: {userData.email}</div>
                <div>비밀번호: {'*'.repeat(userData.password.length)}</div>
                <div>전화번호: {userData.phone}</div>
              </div>
            </div>
          )}

          {/* 로딩 상태 */}
          {isLoading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">처리 중...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VoiceStage 