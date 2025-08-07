import React, { useState, useEffect, useRef } from 'react'
import { extractEntities, classifyIntentAdvanced, extractEntitiesAdvanced } from '../services/nluService'
import { trackSTTError, trackNLUError, trackSuccess, errorTracking } from '../services/errorTracking'

// 헬퍼 함수들
const getIntentDisplayName = (intent: string): string => {
  const intentNames: Record<string, string> = {
    'input_name': '이름 입력',
    'input_email': '이메일 입력',
    'input_password': '비밀번호 입력',
    'input_phone': '전화번호 입력',
    'start_signup': '회원가입 시작',
    'multi_input': '복합 정보 입력',
    'confirm': '확인',
    'retry': '다시 시도',
    'cancel': '취소',
    'unknown': '알 수 없는 의도'
  }
  return intentNames[intent] || intent
}

const getEntityIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'name': '👤',
    'email': '📧',
    'password': '🔒',
    'phone': '📱',
    'number': '🔢'
  }
  return icons[type] || '🏷️'
}

const getEntityDisplayName = (type: string): string => {
  const names: Record<string, string> = {
    'name': '이름',
    'email': '이메일',
    'password': '비밀번호',
    'phone': '전화번호',
    'number': '숫자'
  }
  return names[type] || type
}

const getActionSuggestion = (intent: string, entities: any[]): string => {
  switch (intent) {
    case 'input_name':
      return entities.length > 0 
        ? `이름 "${entities[0].value}"이(가) 인식되었습니다. 다음에 이메일을 말씀해주세요.`
        : '이름이 인식되지 않았습니다. 다시 말씀해주세요.'
    case 'input_email':
      return entities.length > 0 
        ? `이메일 "${entities[0].value}"이(가) 인식되었습니다. 다음에 비밀번호를 말씀해주세요.`
        : '이메일이 인식되지 않았습니다. 다시 말씀해주세요.'
    case 'input_password':
      return entities.length > 0 
        ? `비밀번호가 인식되었습니다. 다음에 전화번호를 말씀해주세요.`
        : '비밀번호가 인식되지 않았습니다. 다시 말씀해주세요.'
    case 'input_phone':
      return entities.length > 0 
        ? `전화번호 "${entities[0].value}"이(가) 인식되었습니다. 회원가입을 완료하시겠습니까?`
        : '전화번호가 인식되지 않았습니다. 다시 말씀해주세요.'
    case 'multi_input':
      return getMultiInputSuggestion(entities)
    case 'start_signup':
      return '회원가입을 시작합니다. 자유롭게 정보를 말씀해주세요.'
    case 'confirm':
      return '확인되었습니다. 회원가입이 완료됩니다.'
    case 'retry':
      return '다시 시도합니다. 이전 단계를 다시 말씀해주세요.'
    case 'cancel':
      return '회원가입이 취소되었습니다.'
    default:
      return '음성을 다시 말씀해주세요.'
  }
}

// 복합 입력에 대한 제안
const getMultiInputSuggestion = (entities: any[]): string => {
  const entityTypes = entities.map(e => e.type)
  const missingTypes = ['name', 'email', 'password', 'phone'].filter(type => !entityTypes.includes(type))
  
  if (missingTypes.length === 0) {
    return '모든 정보가 입력되었습니다. 회원가입을 완료하시겠습니까?'
  }
  
  const suggestions = {
    'name': '이름',
    'email': '이메일',
    'password': '비밀번호',
    'phone': '전화번호'
  }
  
  const missingItems = missingTypes.map(type => suggestions[type as keyof typeof suggestions]).join(', ')
  return `추가로 ${missingItems}을(를) 말씀해주세요.`
}

const SimpleSTTTest: React.FC = () => {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('대기 중')
  const [nluResult, setNluResult] = useState<any>(null)
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  })
  const [currentStep, setCurrentStep] = useState<'input' | 'form' | 'complete'>('input')
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [showErrorStats, setShowErrorStats] = useState(false)
  const recognitionRef = useRef<any>(null)
  const [fullTranscript, setFullTranscript] = useState('')  // 전체 누적 텍스트
  const [lastProcessedText, setLastProcessedText] = useState('')  // 마지막 처리된 텍스트
  const [isAborted, setIsAborted] = useState(false)  // aborted 오류 상태 추적
  const [abortedCount, setAbortedCount] = useState(0)  // aborted 오류 발생 횟수
  // const [lastAbortedTime, setLastAbortedTime] = useState(0)  // 마지막 aborted 오류 발생 시간

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    console.log('🚀 SimpleSTTTest 컴포넌트 마운트')
    
    // 브라우저 지원 체크
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.error('❌ SpeechRecognition API가 지원되지 않습니다')
      setError('이 브라우저는 음성 인식을 지원하지 않습니다.')
      setStatus('지원 안됨')
      return
    }

    console.log('✅ SpeechRecognition API 발견:', SpeechRecognition.name)
    setStatus('초기화 중...')

    try {
      // SpeechRecognition 객체 생성
      const recognition = new SpeechRecognition()
      console.log('✅ SpeechRecognition 객체 생성 성공')

      // 기본 설정
      recognition.continuous = true  // 연속 인식 모드로 변경
      recognition.interimResults = true  // 중간 결과도 받기
      recognition.lang = 'ko-KR'
      recognition.maxAlternatives = 1

      // 이벤트 핸들러 설정
      recognition.onstart = () => {
        console.log('🎤 음성 인식 시작됨')
        setIsListening(true)
        setError(null)
        setStatus('음성 인식 중...')
      }

      recognition.onresult = (event: any) => {
        console.log('🎤 음성 인식 결과:', event)
        
        let finalTranscript = ''
        let interimTranscript = ''
        
        // 모든 결과를 순회하면서 최종 결과와 중간 결과 분리
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        // 중간 결과가 있으면 실시간으로 표시
        if (interimTranscript) {
          console.log('🎤 중간 인식 결과:', interimTranscript)
          const currentDisplay = fullTranscript + ' ' + finalTranscript + ' ' + interimTranscript
          setTranscript(currentDisplay)
          setStatus('음성 인식 중...')
        }
        
        // 최종 결과가 있으면 누적하고 NLU 처리
        if (finalTranscript) {
          console.log('🎤 최종 인식 결과:', finalTranscript)
          const newFullTranscript = fullTranscript + ' ' + finalTranscript
          setFullTranscript(newFullTranscript)
          setTranscript(newFullTranscript)
          setStatus('인식 완료')
          
          // 일정 시간 후에 전체 텍스트로 NLU 처리 (누적 처리)
          setTimeout(() => {
            if (newFullTranscript !== lastProcessedText) {
              console.log('🧠 누적 텍스트로 NLU 처리:', newFullTranscript)
              processNLU(newFullTranscript)
              setLastProcessedText(newFullTranscript)
            }
          }, 1000) // 1초 대기
        }
      }

      recognition.onerror = (event: any) => {
        console.error('🎤 음성 인식 오류:', event.error)
        setIsListening(false)
        setStatus('오류 발생')
        
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
        
        // 오류 추적
        trackSTTError(event.error, errorMessage, abortedCount)
        
                 // aborted 오류는 자동 재시작하지 않음 (무한 루프 방지)
         if (event.error === 'aborted') {
           // const now = Date.now()
           const newAbortedCount = abortedCount + 1
           
           console.log(`⚠️ aborted 오류 발생 (${newAbortedCount}번째)`)
           setStatus('수동 재시작 필요')
           setIsAborted(true)
           setAbortedCount(newAbortedCount)
           
           // 연속 모드 비활성화
           recognition.continuous = false
           console.log('🔄 연속 모드 비활성화됨')
           
           // 3번 이상 연속으로 aborted 오류가 발생하면 브라우저 재시작 권장
           if (newAbortedCount >= 3) {
             console.log('🚫 연속 aborted 오류로 인한 브라우저 재시작 권장')
             setStatus('브라우저 재시작 권장')
             setError('음성 인식 서비스에 문제가 있습니다. 브라우저를 새로고침하거나 재시작해주세요.')
           }
         }
      }

             recognition.onend = () => {
         console.log('🎤 음성 인식 종료됨')
         setIsListening(false)
         setStatus('대기 중')
         
         // aborted 상태이면 자동 재시작하지 않음
         if (isAborted) {
           console.log('⏸️ 자동 재시작 건너뜀 (aborted 상태)')
           return
         }
         
         // 자동 재시작 (연속 모드에서만)
         if (recognition.continuous) {
           console.log('🔄 자동 재시작 시도...')
           setTimeout(() => {
             try {
               // 재시작 전에 aborted 상태 다시 확인
               if (!isAborted) {
                 recognition.start()
                 console.log('✅ 자동 재시작 성공')
               } else {
                 console.log('⏸️ 자동 재시작 취소 (aborted 상태)')
               }
             } catch (err: any) {
               console.error('❌ 자동 재시작 실패:', err)
             }
           }, 1000) // 대기 시간을 1초로 증가
         }
       }

      recognitionRef.current = recognition
      setStatus('준비 완료')
      console.log('✅ SimpleSTTTest 초기화 완료')

    } catch (err: any) {
      console.error('❌ SpeechRecognition 초기화 실패:', err)
      setError(`음성 인식 초기화 실패: ${err.message}`)
      setStatus('초기화 실패')
    }
  }, [])

  // NLU 처리 함수 추가 (자유 발화 지원)
  const processNLU = (text: string) => {
    try {
      console.log('🧠 고급 NLU 처리 시작:', text)
      
      // 고급 의도 분류 (자유 발화 지원)
      const intentResult = classifyIntentAdvanced(text)
      console.log('🎯 의도 분류 결과:', intentResult)
      
      // 고급 엔티티 추출 (자유 발화 지원)
      const entities = intentResult.intent === 'multi_input' 
        ? extractEntitiesAdvanced(text)
        : extractEntities(text)
      console.log('🏷️ 엔티티 추출 결과:', entities)
      
      setNluResult({
        intent: intentResult,
        entities: entities,
        rawText: text
      })
      
      // 자동 회원가입 데이터 채우기
      handleAutoFillSignupData(intentResult, entities)
      
    } catch (err: any) {
      console.error('❌ NLU 처리 실패:', err)
      setError(`NLU 처리 실패: ${err.message}`)
      trackNLUError('processing_failed', err.message)
    }
  }

  // 자동 회원가입 데이터 채우기
  const handleAutoFillSignupData = (intent: any, entities: any[]) => {
    console.log('🔄 자동 데이터 채우기 시작:', intent, entities)
    
    setSignupData(prev => {
      const newSignupData = { ...prev }
      let hasChanges = false
      entities.forEach(entity => {
        switch (entity.type) {
          case 'name':
            if (entity.value && entity.value !== newSignupData.name) {
              newSignupData.name = entity.value
              hasChanges = true
              console.log('✅ 이름 자동 입력:', entity.value)
      trackSuccess()
            }
            break
          case 'email':
            if (entity.value && entity.value !== newSignupData.email) {
              newSignupData.email = entity.value
              hasChanges = true
              console.log('✅ 이메일 자동 입력:', entity.value)
      trackSuccess()
            }
            break
          case 'password':
            if (entity.value && entity.value !== newSignupData.password) {
              newSignupData.password = entity.value
              hasChanges = true
              console.log('✅ 비밀번호 자동 입력:', entity.value)
      trackSuccess()
            }
            break
          case 'phone':
            if (entity.value && entity.value !== newSignupData.phone) {
              newSignupData.phone = entity.value
              hasChanges = true
              console.log('✅ 전화번호 자동 입력:', entity.value)
      trackSuccess()
            }
            break
        }
      })
      if (hasChanges) {
        console.log('📝 회원가입 데이터 업데이트:', newSignupData)
        return newSignupData
      }
      return prev
    })

    // 의도에 따른 추가 처리
    if (intent.intent === 'start_signup' || intent.intent === 'multi_input' || entities.length > 0) {
      setCurrentStep('form')
      console.log('🎯 회원가입 폼으로 이동')
    } else if (intent.intent === 'confirm') {
      handleSubmitSignup()
    }
  }

  // 회원가입 제출 처리
  const handleSubmitSignup = () => {
    console.log('🚀 회원가입 제출 시작')
    
    // 유효성 검사
    const errors: {[key: string]: string} = {}
    
    if (!signupData.name || signupData.name.length < 2) {
      errors.name = '이름은 2자 이상이어야 합니다'
    }
    
    if (!signupData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
      errors.email = '올바른 이메일 형식을 입력해주세요'
    }
    
    if (!signupData.password || signupData.password.length < 6) {
      errors.password = '비밀번호는 6자 이상이어야 합니다'
    }
    
    if (!signupData.phone || !/^010\d{8}$/.test(signupData.phone.replace(/\D/g, ''))) {
      errors.phone = '올바른 전화번호 형식을 입력해주세요'
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      console.log('❌ 유효성 검사 실패:', errors)
      return
    }
    
    // 회원가입 완료 처리
    setCurrentStep('complete')
    setFormErrors({})
    console.log('✅ 회원가입 완료:', signupData)
  }

  // 수동 입력 처리
  const handleManualInput = (field: string, value: string) => {
    setSignupData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const startListening = () => {
    if (!recognitionRef.current) {
      setError('음성 인식이 초기화되지 않았습니다.')
      return
    }

    try {
      console.log('🎤 음성 인식 시작 시도...')
      setError(null)
      setIsAborted(false) // aborted 상태 리셋
      setAbortedCount(0) // aborted 카운트 리셋
      
      // aborted 오류가 지속적으로 발생하는 경우 새로운 인스턴스 생성
      if (abortedCount >= 2) {
        console.log('🔄 aborted 오류 지속으로 인한 새로운 인스턴스 생성')
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        const newRecognition = new SpeechRecognition()
        
        // 기본 설정 복사
        newRecognition.continuous = true
        newRecognition.interimResults = true
        newRecognition.lang = 'ko-KR'
        newRecognition.maxAlternatives = 1
        
        // 이벤트 핸들러 복사
        newRecognition.onstart = recognitionRef.current.onstart
        newRecognition.onresult = recognitionRef.current.onresult
        newRecognition.onerror = recognitionRef.current.onerror
        newRecognition.onend = recognitionRef.current.onend
        
        recognitionRef.current = newRecognition
        console.log('✅ 새로운 SpeechRecognition 인스턴스 생성 완료')
      }
      
      // 연속 모드 다시 활성화
      if (recognitionRef.current.continuous === false) {
        recognitionRef.current.continuous = true
        console.log('🔄 연속 모드 다시 활성화됨')
      }
      
      setStatus('시작 중...')
      recognitionRef.current.start()
    } catch (err: any) {
      console.error('❌ 음성 인식 시작 실패:', err)
      setError(`음성 인식 시작 실패: ${err.message}`)
      setStatus('시작 실패')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        console.log('🎤 음성 인식 중지')
        setStatus('중지됨')
      } catch (err: any) {
        console.error('❌ 음성 인식 중지 실패:', err)
      }
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    setFullTranscript('')
    setLastProcessedText('')
    setError(null)
    setIsAborted(false) // aborted 상태 리셋
    setAbortedCount(0) // aborted 카운트 리셋
    
    // 연속 모드 다시 활성화
    if (recognitionRef.current && recognitionRef.current.continuous === false) {
      recognitionRef.current.continuous = true
      console.log('🔄 연속 모드 다시 활성화됨')
    }
    
    setStatus('준비 완료')
    setNluResult(null)
  }

  const testMicrophone = async () => {
    try {
      console.log('🎤 마이크 테스트 시작...')
      setStatus('마이크 테스트 중...')
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('✅ 마이크 접근 성공')
      
      // 스트림 정리
      stream.getTracks().forEach(track => track.stop())
      
      setError(null)
      setStatus('마이크 정상')
      
      setTimeout(() => {
        setStatus('준비 완료')
      }, 2000)
      
    } catch (err: any) {
      console.error('❌ 마이크 테스트 실패:', err)
      setError(`마이크 접근 실패: ${err.message}`)
      setStatus('마이크 오류')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          🎤 STT + NLU + 자동 회원가입
        </h1>

        {/* 상태 표시 */}
        <div className="mb-4 p-3 bg-gray-50 rounded border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">상태:</span>
            <span className={`text-sm ${
              status.includes('준비') ? 'text-green-600' : 
              status.includes('오류') || status.includes('실패') ? 'text-red-600' : 
              'text-blue-600'
            }`}>
              {status}
            </span>
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            ❌ {error}
          </div>
        )}

                 {/* aborted 상태 안내 메시지 */}
         {isAborted && (
           <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
             ⚠️ 음성 인식이 중단되었습니다. (발생 횟수: {abortedCount}회)
             <br />
             "음성 인식 시작" 버튼을 눌러 다시 시작해주세요.
             {abortedCount >= 3 && (
               <div className="mt-2 text-red-600 font-medium">
                 🔄 브라우저를 새로고침(F5)하거나 재시작해주세요.
               </div>
             )}
           </div>
         )}

        {/* 인식 결과 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            인식 결과:
          </label>
          <div className="p-3 bg-gray-50 border rounded min-h-[60px] text-gray-700">
            {transcript || '음성을 말씀해주세요...'}
          </div>
        </div>

                 {/* 현재 입력된 데이터 표시 */}
         {(signupData.name || signupData.email || signupData.password || signupData.phone) && (
           <div className="mb-6">
             <label className="block text-sm font-medium text-gray-700 mb-2">
               📝 현재 입력된 정보:
             </label>
             <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
               <div className="grid gap-2 text-sm">
                 {signupData.name && (
                   <div className="flex items-center">
                     <span className="font-medium text-blue-800 w-16">이름:</span>
                     <span className="text-blue-700">{signupData.name}</span>
                   </div>
                 )}
                 {signupData.email && (
                   <div className="flex items-center">
                     <span className="font-medium text-blue-800 w-16">이메일:</span>
                     <span className="text-blue-700">{signupData.email}</span>
                   </div>
                 )}
                 {signupData.password && (
                   <div className="flex items-center">
                     <span className="font-medium text-blue-800 w-16">비밀번호:</span>
                     <span className="text-blue-700">••••••</span>
                   </div>
                 )}
                 {signupData.phone && (
                   <div className="flex items-center">
                     <span className="font-medium text-blue-800 w-16">전화번호:</span>
                     <span className="text-blue-700">{signupData.phone}</span>
                   </div>
                 )}
               </div>
             </div>
           </div>
         )}

         {/* NLU 결과 표시 개선 */}
         {nluResult && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🧠 NLU 분석 결과:
            </label>
            
            {/* 의도 분석 결과 */}
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-blue-800">🎯 인식된 의도</h4>
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                  신뢰도 {Math.round(nluResult.intent.confidence * 100)}%
                </span>
              </div>
              <div className="text-sm text-blue-700 font-medium">
                {getIntentDisplayName(nluResult.intent.intent)}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                원본: "{nluResult.rawText}"
              </div>
            </div>

            {/* 추출된 엔티티 표시 */}
            {nluResult.entities.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">🏷️ 추출된 정보</h4>
                <div className="grid gap-2">
                  {nluResult.entities.map((entity: any, index: number) => (
                    <div key={index} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-bold text-green-600">
                          {getEntityIcon(entity.type)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 font-medium">
                          {getEntityDisplayName(entity.type)}
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                          {entity.value}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {Math.round(entity.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 액션 제안 */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">💡 다음 단계 제안</h4>
              <div className="text-xs text-yellow-700">
                {getActionSuggestion(nluResult.intent.intent, nluResult.entities)}
              </div>
            </div>
          </div>
        )}

        {/* 제어 버튼 */}
        <div className="space-y-3">
          {!isListening ? (
            <button
              onClick={startListening}
              disabled={status !== '준비 완료' && !isAborted}
              className={`w-full py-3 px-4 rounded-lg font-medium ${
                status === '준비 완료' || isAborted
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {isAborted ? '🔄 음성 인식 재시작' : '🎤 음성 인식 시작'}
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              ⏹️ 음성 인식 중지
            </button>
          )}

          <button
            onClick={testMicrophone}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            🎤 마이크 테스트
          </button>

          <button
            onClick={clearTranscript}
            className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            초기화
          </button>

          <button
            onClick={() => setShowErrorStats(!showErrorStats)}
            className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            📊 오류 통계
          </button>
        </div>

        {/* 사용법 */}
        <div className="mt-4 p-3 bg-yellow-50 rounded border">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 사용법</h4>
          <div className="text-xs text-yellow-700 space-y-1">
            <p>1. "마이크 테스트" 버튼으로 마이크 권한 확인</p>
            <p>2. "음성 인식 시작" 버튼을 클릭</p>
            <p>3. 명확하게 말씀해주세요</p>
            <p>4. 인식이 완료되면 자동으로 중지됩니다</p>
            <p>5. NLU 분석 결과가 자동으로 표시됩니다</p>
            <p>6. 회원가입 정보가 자동으로 채워집니다</p>
            <br />
            <p className="font-semibold">🎯 자유 발화 테스트 예시:</p>
            <p>• "회원가입 시작" → 폼으로 이동</p>
            <p>• "제 이름은 이재만이고 이메일은 test@gmail.com입니다" → 복합 입력</p>
            <p>• "이름은 김철수, 전화번호는 010-1234-5678, 비밀번호는 123456입니다" → 한 번에 모든 정보</p>
            <p>• "이메일은 kim@test.com이고 이름은 김철수입니다" → 순서 무관</p>
            <p>• "확인" → 회원가입 완료</p>
            <br />
            <p className="font-semibold">🔧 고급 기능:</p>
            <p>• 음성 변환 지원: "골뱅이", "닷", "점" 등</p>
            <p>• 패턴 인식: "이름은 ~입니다", "전화번호는 ~입니다"</p>
            <p>• 누적 정보 관리: 여러 번에 나누어 입력 가능</p>
          </div>
        </div>

        {/* 오류 통계 */}
        {showErrorStats && (
          <div className="mt-4 p-3 bg-purple-50 rounded border">
            <h4 className="text-sm font-medium text-purple-800 mb-2">📊 오류 통계</h4>
            <div className="text-xs text-purple-700 space-y-1">
              {(() => {
                const stats = errorTracking.getErrorStats()
                return (
                  <>
                    <p>• 총 오류 수: {stats.totalErrors}</p>
                    <p>• 성공률: {stats.successRate.toFixed(1)}%</p>
                    <p>• 브라우저별 오류:</p>
                    {Object.entries(stats.browserStats).map(([browser, count]) => (
                      <p key={browser} className="ml-2">  - {browser}: {count}회</p>
                    ))}
                    <p>• 오류 타입별:</p>
                    {Object.entries(stats.errorTypes).map(([type, count]) => (
                      <p key={type} className="ml-2">  - {type}: {count}회</p>
                    ))}
                    <button
                      onClick={() => {
                        const data = errorTracking.exportData()
                        const blob = new Blob([data], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'error-stats.json'
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="mt-2 px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                    >
                      📥 데이터 내보내기
                    </button>
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {/* 디버그 정보 */}
        <div className="mt-4 p-3 bg-gray-50 rounded border">
          <h4 className="text-sm font-medium text-gray-800 mb-2">🔧 디버그 정보</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• 브라우저: {navigator.userAgent.split(' ')[0]}</p>
            <p>• 프로토콜: {window.location.protocol}</p>
            <p>• 호스트: {window.location.hostname}</p>
            <p>• SpeechRecognition: {(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition ? '✅' : '❌'}</p>
          </div>
        </div>

                 {/* 회원가입 폼 */}
         {(currentStep === 'form' || signupData.name || signupData.email || signupData.password || signupData.phone) && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-4">📝 회원가입 정보</h3>
            
            <div className="space-y-4">
              {/* 이름 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  👤 이름
                </label>
                <input
                  type="text"
                  value={signupData.name}
                  onChange={(e) => handleManualInput('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="이름을 입력하세요"
                />
                {formErrors.name && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* 이메일 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📧 이메일
                </label>
                <input
                  type="email"
                  value={signupData.email}
                  onChange={(e) => handleManualInput('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formErrors.email ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="이메일을 입력하세요"
                />
                {formErrors.email && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* 비밀번호 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🔒 비밀번호
                </label>
                <input
                  type="password"
                  value={signupData.password}
                  onChange={(e) => handleManualInput('password', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formErrors.password ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="비밀번호를 입력하세요 (6자 이상)"
                />
                {formErrors.password && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.password}</p>
                )}
              </div>

              {/* 전화번호 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📱 전화번호
                </label>
                <input
                  type="tel"
                  value={signupData.phone}
                  onChange={(e) => handleManualInput('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    formErrors.phone ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="010-1234-5678"
                />
                {formErrors.phone && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>
                )}
              </div>

              {/* 제출 버튼 */}
              <div className="flex space-x-2">
                <button
                  onClick={handleSubmitSignup}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium"
                >
                  ✅ 회원가입 완료
                </button>
                <button
                  onClick={() => setCurrentStep('input')}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  🔄 다시 입력
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 회원가입 완료 */}
        {currentStep === 'complete' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">회원가입 완료!</h3>
              <p className="text-sm text-blue-600 mb-4">
                음성 인식과 NLU를 통한 자동 회원가입이 성공적으로 완료되었습니다.
              </p>
              <div className="text-xs text-blue-500 space-y-1">
                <p>이름: {signupData.name}</p>
                <p>이메일: {signupData.email}</p>
                <p>전화번호: {signupData.phone}</p>
              </div>
        <button
                onClick={() => {
                  setCurrentStep('input')
                  setSignupData({ name: '', email: '', password: '', phone: '' })
                  setFormErrors({})
                }}
                className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                🔄 새로 시작
        </button>
            </div>
          </div>
        )}

        {/* 홈으로 돌아가기 */}
        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="text-blue-500 hover:text-blue-700 underline text-sm"
          >
            홈으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  )
}

export default SimpleSTTTest 