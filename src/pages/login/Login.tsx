import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'
import { processVoiceCommand, getLoginVoiceCommands } from '../../utils/voiceCommands'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  
  // 음성 인식 및 TTS 훅
  const { transcript, isListening, startListening, stopListening, resetTranscript, error: speechError } = useSpeechRecognition()
  const { speak } = useSpeechSynthesis()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(email, password)
    if (result.success) {
      navigate('/home')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  // 음성 명령 처리
  useEffect(() => {
    if (transcript) {
      // 이메일 추출
      const emailMatch = transcript.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
      if (emailMatch) {
        setEmail(emailMatch[0])
        speak('이메일이 입력되었습니다.')
        resetTranscript()
        return
      }

      // 비밀번호 추출 (숫자 6자리 이상)
      const passwordMatch = transcript.match(/\d{6,}/)
      if (passwordMatch) {
        setPassword(passwordMatch[0])
        speak('비밀번호가 입력되었습니다.')
        resetTranscript()
        return
      }

      // 명령어 처리
      const commands = getLoginVoiceCommands(
        (email) => setEmail(email),
        (password) => setPassword(password),
        () => handleSubmit(new Event('submit') as any)
      )
      
      const result = processVoiceCommand(transcript, commands)
      
      if (result.matched && result.action) {
        speak(result.message || '명령을 실행합니다.')
        result.action()
        resetTranscript()
      }
    }
  }, [transcript, speak, resetTranscript])

  const handleVoiceLogin = () => {
    if (isListening) {
      stopListening()
      speak('음성 인식을 중지했습니다.')
    } else {
      startListening()
      speak('음성 인식을 시작했습니다. 이메일과 비밀번호를 말씀해주세요.')
    }
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
            <p className="text-gray-600">로그인하여 서비스를 이용하세요</p>
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
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center mb-4">
                {error}
              </div>
            )}

            {speechError && (
              <div className="text-red-600 text-sm text-center mb-4">
                {speechError}
              </div>
            )}

            {transcript && (
              <div className="text-blue-600 text-sm text-center mb-4">
                인식된 음성: {transcript}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

           {/* 음성 로그인 버튼 */}
           <div style={{
             marginTop: '24px',
             padding: '20px',
             border: '3px solid #3b82f6',
             backgroundColor: '#dbeafe',
             borderRadius: '12px',
             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
           }}>
             <h3 style={{
               fontSize: '20px',
               fontWeight: 'bold',
               color: '#1e40af',
               marginBottom: '16px',
               textAlign: 'center'
             }}>🎤 음성으로 로그인</h3>
             <button
               onClick={handleVoiceLogin}
               disabled={loading}
               style={{
                 width: '100%',
                 padding: '16px',
                 borderRadius: '8px',
                 fontSize: '18px',
                 fontWeight: 'bold',
                 border: 'none',
                 cursor: 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 gap: '12px',
                 backgroundColor: isListening ? '#dc2626' : '#2563eb',
                 color: 'white',
                 transition: 'all 0.3s ease'
               }}
             >
               <span style={{ fontSize: '24px' }}>{isListening ? '🔴' : '🎤'}</span>
               <span>{isListening ? '음성 인식 중지' : '음성으로 로그인'}</span>
             </button>
             <div style={{
               marginTop: '16px',
               padding: '12px',
               backgroundColor: 'white',
               borderRadius: '8px',
               border: '1px solid #bfdbfe'
             }}>
               <p style={{
                 fontSize: '14px',
                 color: '#1e40af',
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
               Google로 로그인
             </button>
           </div>

           <div className="mt-6 text-center">
             <p className="text-sm text-gray-600">
               계정이 없으신가요?{' '}
               <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                 회원가입
               </Link>
             </p>
           </div>
         </div>
       </div>
     </div>
   )
 }

 export default Login 