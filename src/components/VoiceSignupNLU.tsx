import { useState, useEffect, useRef } from 'react'
// Firebase 의존성 제거
// import { registerUser } from '../firebase/auth'

// 더미 회원가입 함수
const registerUser = async (email: string, _password: string) => {
  console.log('더미: 회원가입 시도', email)
  return { success: false, error: 'Firebase가 비활성화되었습니다.' }
}

interface UserInfo {
  name: string
  email: string
  password: string
  phone: string
}

export default function VoiceSignupNLU() {
  const [currentStep, setCurrentStep] = useState<'name' | 'email' | 'password' | 'phone' | 'complete'>('name')
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    password: '',
    phone: ''
  })
  const [message, setMessage] = useState('이름을 말씀해주세요.')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ko-KR'
      utterance.rate = 1.5
      speechSynthesis.speak(utterance)
    }
  }

  const startRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.')
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'ko-KR'

    recognition.onstart = () => {
      setIsListening(true)
      console.log('음성 인식 시작')
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      console.log('인식된 음성:', transcript)
      handleSpeechResult(transcript)
    }

    recognition.onerror = (event: any) => {
      console.error('음성 인식 오류:', event.error)
      setIsListening(false)
      speak('음성 인식에 실패했습니다. 다시 시도해주세요.')
    }

    recognition.onend = () => {
      setIsListening(false)
      console.log('음성 인식 종료')
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const handleSpeechResult = (text: string) => {
    switch (currentStep) {
      case 'name':
        const name = text.replace(/[^가-힣a-zA-Z\s]/g, '').trim()
        if (name.length >= 2) {
          setUserInfo(prev => ({ ...prev, name }))
          setCurrentStep('email')
          const nextMessage = '이메일 주소를 말씀해주세요.'
          setMessage(nextMessage)
          speak(nextMessage)
        } else {
          speak('이름을 다시 말씀해주세요.')
        }
        break
      case 'email':
        const email = text.toLowerCase().replace(/\s/g, '')
        if (email.includes('@') && email.includes('.')) {
          setUserInfo(prev => ({ ...prev, email }))
          setCurrentStep('password')
          const nextMessage = '비밀번호를 말씀해주세요.'
          setMessage(nextMessage)
          speak(nextMessage)
        } else {
          speak('올바른 이메일 주소를 말씀해주세요.')
        }
        break
      case 'password':
        const password = text.replace(/\s/g, '')
        if (password.length >= 6) {
          setUserInfo(prev => ({ ...prev, password }))
          setCurrentStep('phone')
          const nextMessage = '전화번호를 말씀해주세요.'
          setMessage(nextMessage)
          speak(nextMessage)
        } else {
          speak('비밀번호는 6자 이상이어야 합니다. 다시 말씀해주세요.')
        }
        break
      case 'phone':
        const phone = text.replace(/[^0-9]/g, '')
        if (phone.length >= 10) {
          setUserInfo(prev => ({ ...prev, phone }))
          handleSignup()
        } else {
          speak('올바른 전화번호를 말씀해주세요.')
        }
        break
    }
  }

  const handleSignup = async () => {
    try {
      speak('회원가입을 진행하고 있습니다.')
      setMessage('회원가입을 진행하고 있습니다...')
      
      const result = await registerUser(userInfo.email, userInfo.password)
      
      if (result.success) {
        setCurrentStep('complete')
        const completeMessage = `회원가입이 완료되었습니다! 환영합니다, ${userInfo.name}님.`
        setMessage(completeMessage)
        speak(completeMessage)
      } else {
        speak('회원가입에 실패했습니다.')
        setMessage('회원가입에 실패했습니다.')
      }
    } catch (error) {
      console.error('회원가입 에러:', error)
      speak('회원가입에 실패했습니다.')
      setMessage('회원가입에 실패했습니다.')
    }
  }

  useEffect(() => {
    speak(message)
  }, [])

  if (currentStep === 'complete') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-green-800 mb-4">회원가입 완료!</h1>
          <p className="text-lg text-green-600 mb-6">
            환영합니다, {userInfo.name}님!
          </p>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
            <h2 className="text-xl font-semibold mb-4">가입 정보</h2>
            <div className="space-y-2 text-left">
              <p><strong>이름:</strong> {userInfo.name}</p>
              <p><strong>이메일:</strong> {userInfo.email}</p>
              <p><strong>전화번호:</strong> {userInfo.phone}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">🎤 NLU 음성 회원가입</h1>
        <p className="text-blue-600">음성으로 간편하게 회원가입하세요</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
          }`}>
            <div className="text-white text-2xl">🎤</div>
          </div>
          <p className="text-lg font-medium text-gray-800 mb-2">
            {currentStep === 'name' && '이름'}
            {currentStep === 'email' && '이메일'}
            {currentStep === 'password' && '비밀번호'}
            {currentStep === 'phone' && '전화번호'}
          </p>
          <p className="text-gray-600">{message}</p>
        </div>

        <button
          onClick={startRecognition}
          disabled={isListening}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
            isListening
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isListening ? '음성 인식 중...' : '마이크 버튼을 눌러 말씀하세요'}
        </button>

        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>진행 상황</span>
            <span>{['name', 'email', 'password', 'phone'].indexOf(currentStep) + 1} / 4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((['name', 'email', 'password', 'phone'].indexOf(currentStep) + 1) / 4) * 100}%`
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
} 