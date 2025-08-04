import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  
  // 음성 인식 및 TTS 훅
  const { transcript, isListening, startListening, stopListening, resetTranscript, error: speechError } = useSpeechRecognition()
  const { speak } = useSpeechSynthesis()

  // 디버깅용 로그
  console.log('Register 컴포넌트 로드됨')
  console.log('음성 인식 상태:', { isListening, transcript, speechError })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setLoading(false)
      return
    }

    const result = await register(email, password)
    if (result.success) {
      navigate('/home')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  // 음성 인식 결과 실시간 표시
  useEffect(() => {
    if (transcript && isListening) {
      // 실시간으로 인식된 내용을 이메일 입력창에 표시
      setEmail(transcript)
      console.log('실시간 텍스트 표시:', transcript)
    }
  }, [transcript, isListening])

  // 음성 명령 처리
  useEffect(() => {
    if (transcript && !isListening) {
      console.log('음성 명령 처리 시작:', transcript)
      
      // 이메일과 비밀번호를 한 번에 추출
      const emailMatch = transcript.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
      const passwordMatch = transcript.match(/\d{6,}/)
      
      if (emailMatch && passwordMatch) {
        // 이메일과 비밀번호가 모두 있는 경우
        setEmail(emailMatch[0])
        setPassword(passwordMatch[0])
        setConfirmPassword(passwordMatch[0])
        speak(`이메일 ${emailMatch[0]}과 비밀번호가 입력되었습니다.`)
        resetTranscript()
        return
      }
      
      // 이메일만 있는 경우
      if (emailMatch) {
        setEmail(emailMatch[0])
        speak(`이메일 ${emailMatch[0]}이 입력되었습니다.`)
        resetTranscript()
        return
      }

      // 비밀번호만 있는 경우
      if (passwordMatch) {
        if (!password) {
          setPassword(passwordMatch[0])
          speak('비밀번호가 입력되었습니다.')
        } else {
          setConfirmPassword(passwordMatch[0])
          speak('비밀번호 확인이 입력되었습니다.')
        }
        resetTranscript()
        return
      }
      
      // 회원가입 명령 처리
      if (transcript.includes('가입') || transcript.includes('회원가입') || transcript.includes('등록')) {
        if (email && password && confirmPassword) {
          speak('회원가입을 진행합니다.')
          handleSubmit(new Event('submit') as any)
        } else {
          speak('이메일과 비밀번호를 모두 입력해주세요.')
        }
        resetTranscript()
        return
      }
      
      // 인식되지 않은 음성
      console.log('인식된 음성:', transcript)
      speak('이메일과 비밀번호를 말씀해주세요.')
      resetTranscript()
    }
  }, [transcript, speak, resetTranscript, password, isListening, email, confirmPassword, handleSubmit])

  const handleVoiceRegister = () => {
    console.log('handleVoiceRegister 호출됨')
    
    if (isListening || (window as any).isListeningDirect) {
      console.log('음성 인식 중지')
      if ((window as any).registerRecognition) {
        (window as any).registerRecognition.stop()
      }
      stopListening()
      ;(window as any).isListeningDirect = false
    } else {
      console.log('음성 인식 시작')
      
      // 비프음 재생 (음성 인식 시작 알림)
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime) // 800Hz 비프음
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime) // 볼륨 설정
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3) // 페이드 아웃
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
      
      // 직접 음성 인식 객체 생성 및 시작
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        alert('이 브라우저는 음성 인식을 지원하지 않습니다!')
        return
      }
      
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'ko-KR'
      recognition.maxAlternatives = 3
      
      console.log('음성 인식 설정:', {
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        lang: recognition.lang,
        maxAlternatives: recognition.maxAlternatives
      })
      
      recognition.onstart = () => {
        console.log('🎤 직접 음성 인식 시작됨')
        console.log('음성 인식 객체:', recognition)
        console.log('음성 인식 설정 확인:', {
          continuous: recognition.continuous,
          interimResults: recognition.interimResults,
          lang: recognition.lang
        })
        // isListening 상태를 직접 관리
        ;(window as any).isListeningDirect = true
        ;(window as any).registerRecognition = recognition
        
        // 30초 후 자동 중지 (충분한 시간 확보)
        setTimeout(() => {
          if ((window as any).isListeningDirect) {
            console.log('30초 타임아웃으로 음성 인식 자동 중지')
            recognition.stop()
            ;(window as any).isListeningDirect = false
            console.log('음성 인식이 자동으로 중지되었습니다.')
          }
        }, 30000)
      }
      
      recognition.onresult = (event: any) => {
        console.log('🎤 음성 인식 결과 이벤트 발생!')
        console.log('이벤트 객체:', event)
        console.log('결과 개수:', event.results.length)
        console.log('결과 인덱스:', event.resultIndex)
        
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          
          // 가장 신뢰도가 높은 결과 선택
          let bestTranscript = result[0].transcript
          let bestConfidence = result[0].confidence
          
          for (let j = 1; j < result.length; j++) {
            if (result[j].confidence > bestConfidence) {
              bestTranscript = result[j].transcript
              bestConfidence = result[j].confidence
            }
          }
          
          const isFinal = result.isFinal
          
          console.log(`결과 ${i}:`, { 
            transcript: bestTranscript, 
            confidence: bestConfidence,
            isFinal 
          })
          
          if (isFinal) {
            finalTranscript += bestTranscript
          } else {
            interimTranscript += bestTranscript
          }
        }
        
        const fullTranscript = finalTranscript + interimTranscript
        console.log('🎤 전체 인식된 텍스트:', fullTranscript)
        console.log('🎤 최종 텍스트:', finalTranscript)
        console.log('🎤 임시 텍스트:', interimTranscript)
        
        // 실시간으로 이메일 입력창에 텍스트 설정
        if (fullTranscript.trim()) {
          setEmail(fullTranscript)
          ;(window as any).currentTranscript = fullTranscript
        }
        
        // 최종 결과가 있으면 처리 (신뢰도가 높은 경우만)
        if (finalTranscript.trim()) {
          console.log('🎤 최종 결과 처리:', finalTranscript)
          processVoiceCommandDirect(finalTranscript)
        }
      }
      
      recognition.onerror = (event: any) => {
        console.error('🎤 직접 음성 인식 에러 발생!')
        console.error('에러 이벤트:', event)
        console.error('에러 코드:', event.error)
        console.error('에러 메시지:', event.message)
        ;(window as any).isListeningDirect = false
        
        // 에러에 따른 적절한 메시지 (TTS 없이)
        let errorMessage = '음성 인식 에러가 발생했습니다.'
        if (event.error === 'not-allowed') {
          errorMessage = '마이크 권한이 거부되었습니다.'
        } else if (event.error === 'no-speech') {
          errorMessage = '음성이 감지되지 않았습니다. 다시 말씀해주세요.'
          // no-speech 에러는 무시하고 계속 인식
          return
        } else if (event.error === 'network') {
          errorMessage = '네트워크 오류가 발생했습니다.'
        } else if (event.error === 'audio-capture') {
          errorMessage = '마이크를 찾을 수 없습니다.'
        } else if (event.error === 'service-not-allowed') {
          errorMessage = '음성 인식 서비스가 허용되지 않았습니다.'
        }
        
        // TTS 대신 콘솔에만 출력 (충돌 방지)
        console.error('음성 인식 에러:', errorMessage)
      }
      
      recognition.onend = () => {
        console.log('🎤 직접 음성 인식 종료됨')
        console.log('음성 인식 상태:', (window as any).isListeningDirect)
        ;(window as any).isListeningDirect = false
        // onresult에서 이미 처리했으므로 여기서는 중복 처리하지 않음
      }
      
      try {
        console.log('🎤 직접 음성 인식 시작 시도...')
        
        // 기존 음성 인식 중지
        if ((window as any).registerRecognition) {
          try {
            (window as any).registerRecognition.stop()
            console.log('기존 음성 인식 중지됨')
          } catch (e) {
            console.log('기존 음성 인식 중지 실패:', e)
          }
        }
        
        // TTS 완전 중지 (충돌 방지)
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel()
          window.speechSynthesis.pause()
          console.log('TTS 완전 중지됨')
        }
        
        // 즉시 음성 인식 시작 (TTS 없이)
        try {
          // 기존 음성 인식 완전 정리
          if ((window as any).registerRecognition) {
            try {
              (window as any).registerRecognition.abort()
            } catch (e) {
              console.log('기존 음성 인식 중단 실패:', e)
            }
          }
          
          // TTS 완전 중지
          if (window.speechSynthesis) {
            window.speechSynthesis.cancel()
            console.log('TTS 완전 중지됨')
          }
          
          // 잠시 대기 후 시작
          setTimeout(() => {
            try {
              recognition.start()
              console.log('음성 인식 시작됨')
            } catch (startError: any) {
              console.error('음성 인식 시작 실패:', startError)
              ;(window as any).isListeningDirect = false
            }
          }, 1000)
          
        } catch (startError: any) {
          console.error('음성 인식 시작 실패:', startError)
          ;(window as any).isListeningDirect = false
        }
        
      } catch (error: any) {
        console.error('직접 음성 인식 시작 에러:', error)
        alert(`음성 인식 시작 에러: ${error.message}`)
        ;(window as any).isListeningDirect = false
      }
    }
  }

  // 직접 음성 명령 처리 함수
  const processVoiceCommandDirect = (transcript: string) => {
    console.log('직접 음성 명령 처리 시작:', transcript)
    
    // 이메일 입력창에 텍스트 설정
    setEmail(transcript)
    console.log('이메일 입력창에 설정됨:', transcript)
    
    // TTS 없이 조용히 처리 (충돌 방지)
    console.log('음성 인식 계속 유지 중...')
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    const result = await loginWithGoogle()
    if (result.success) {
      navigate('/home')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">야고 스포츠</h1>
            <p className="text-gray-600">회원가입하여 서비스를 이용하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="이메일을 입력하세요"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="비밀번호를 입력하세요"
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 확인
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="비밀번호를 다시 입력하세요"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {speechError && (
              <div className="text-red-600 text-sm text-center">
                {speechError}
              </div>
            )}

            {transcript && (
              <div className="text-blue-600 text-sm text-center">
                인식된 음성: {transcript}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>

                       {/* 음성 회원가입 버튼 */}
             <div style={{
               marginTop: '24px',
               padding: '20px',
               border: '3px solid #22c55e',
               backgroundColor: '#dcfce7',
               borderRadius: '12px',
               boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
             }}>
               <h3 style={{
                 fontSize: '20px',
                 fontWeight: 'bold',
                 color: '#166534',
                 marginBottom: '16px',
                 textAlign: 'center'
               }}>🎤 음성으로 회원가입</h3>
               
               {/* 음성 인식 에러 표시 */}
               {speechError && (
                 <div style={{
                   marginBottom: '16px',
                   padding: '12px',
                   backgroundColor: '#fef2f2',
                   border: '2px solid #fecaca',
                   borderRadius: '8px',
                   color: '#dc2626',
                   fontSize: '14px',
                   fontWeight: '500'
                 }}>
                   ⚠️ {speechError}
                 </div>
               )}
               
                     <input
                       type="button"
                       value={(isListening || (window as any).isListeningDirect) ? '🔴 음성 인식 중지' : '🎤 음성으로 회원가입'}
                       onClick={() => {
                         console.log('음성 버튼 클릭됨!')
                         handleVoiceRegister()
                       }}
                       style={{
                         width: '100%',
                         padding: '16px',
                         borderRadius: '8px',
                         fontSize: '18px',
                         fontWeight: 'bold',
                         border: 'none',
                         cursor: 'pointer',
                         backgroundColor: (isListening || (window as any).isListeningDirect) ? '#dc2626' : '#16a34a',
                         color: 'white',
                         transition: 'all 0.3s ease',
                         marginTop: '10px'
                       }}
                     />
               
                     {/* 음성 인식 상태 표시 */}
                     <div style={{
                       marginTop: '12px',
                       padding: '12px',
                       backgroundColor: (isListening || (window as any).isListeningDirect) ? '#dcfce7' : '#f3f4f6',
                       border: `2px solid ${(isListening || (window as any).isListeningDirect) ? '#22c55e' : '#d1d5db'}`,
                       borderRadius: '8px',
                       color: (isListening || (window as any).isListeningDirect) ? '#166534' : '#6b7280',
                       fontSize: '14px',
                       textAlign: 'center',
                       fontWeight: '500',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       gap: '8px'
                     }}>
                       <span style={{ fontSize: '18px' }}>
                         {(isListening || (window as any).isListeningDirect) ? '🔴' : '⚪'}
                       </span>
                       <span>
                         {(isListening || (window as any).isListeningDirect) ? '음성 인식 활성화 중...' : '음성 인식 대기 중'}
                       </span>
                     </div>
               
                     <div style={{
                       marginTop: '16px',
                       padding: '12px',
                       backgroundColor: 'white',
                       borderRadius: '8px',
                       border: '1px solid #bbf7d0'
                     }}>
                       <p style={{
                         fontSize: '14px',
                         color: '#166534',
                         textAlign: 'center',
                         fontWeight: '500',
                         margin: 0
                       }}>
                         💡 사용법: 마이크 버튼을 클릭하고 "test@example.com" 이메일과 "123456" 비밀번호를 말씀해주세요
                       </p>
                     </div>
             </div>

           <div className="mt-4">
             <button
               onClick={handleGoogleLogin}
               disabled={loading}
               className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center"
             >
               <span className="mr-2">🔍</span>
               Google로 가입
             </button>
           </div>

           <div className="mt-6 text-center">
             <p className="text-sm text-gray-600">
               이미 계정이 있으신가요?{' '}
               <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                 로그인
               </Link>
             </p>
           </div>
         </div>
       </div>
     </div>
   )
 }

 export default Register 