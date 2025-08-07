import React, { useState, useEffect } from 'react'

const TestPage: React.FC = () => {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    console.log('🚀 TestPage 마운트')
    
    // SpeechRecognition API 확인
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setError('SpeechRecognition API가 지원되지 않습니다.')
      return
    }

    console.log('✅ SpeechRecognition API 발견')

    try {
      // 새로운 recognition 객체 생성
      const newRecognition = new SpeechRecognition()
      
      // 설정
      newRecognition.continuous = false
      newRecognition.interimResults = false
      newRecognition.lang = 'ko-KR'
      
      // 이벤트 핸들러
      newRecognition.onstart = () => {
        console.log('🎤 시작됨')
        setIsListening(true)
        setError(null)
      }
      
      newRecognition.onresult = (event: any) => {
        console.log('🎤 결과:', event)
        const result = event.results[0][0].transcript
        setTranscript(result)
        setIsListening(false)
      }
      
      newRecognition.onerror = (event: any) => {
        console.error('🎤 오류:', event.error)
        setError(`오류: ${event.error}`)
        setIsListening(false)
      }
      
      newRecognition.onend = () => {
        console.log('🎤 종료됨')
        setIsListening(false)
      }
      
      setRecognition(newRecognition)
      console.log('✅ Recognition 객체 설정 완료')
      
    } catch (err: any) {
      console.error('❌ Recognition 객체 생성 실패:', err)
      setError(`초기화 실패: ${err.message}`)
    }
  }, [])

  const startListening = () => {
    if (!recognition) {
      setError('Recognition 객체가 없습니다.')
      return
    }
    
    try {
      console.log('🎤 시작 시도...')
      recognition.start()
    } catch (err: any) {
      console.error('❌ 시작 실패:', err)
      setError(`시작 실패: ${err.message}`)
    }
  }

  const stopListening = () => {
    if (recognition) {
      try {
        recognition.stop()
      } catch (err: any) {
        console.error('❌ 중지 실패:', err)
      }
    }
  }

  const clearText = () => {
    setTranscript('')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">
          🎤 STT 테스트
        </h1>

        {/* 상태 */}
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <div className="flex items-center justify-between">
            <span>상태:</span>
            <span className={`font-medium ${
              isListening ? 'text-green-600' : 'text-gray-600'
            }`}>
              {isListening ? '음성 인식 중...' : '대기 중'}
            </span>
          </div>
        </div>

        {/* 오류 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
            {error}
          </div>
        )}

        {/* 결과 */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">인식 결과:</label>
          <div className="p-3 bg-gray-50 border rounded min-h-[60px]">
            {transcript || '음성을 말씀해주세요...'}
          </div>
        </div>

        {/* 버튼 */}
        <div className="space-y-3">
          {!isListening ? (
            <button
              onClick={startListening}
              disabled={!recognition}
              className={`w-full py-3 px-4 rounded-lg font-medium ${
                recognition
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              🎤 시작
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              ⏹️ 중지
            </button>
          )}

          <button
            onClick={clearText}
            className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            초기화
          </button>
        </div>

        {/* 정보 */}
        <div className="mt-6 p-3 bg-gray-50 rounded text-sm">
          <div>브라우저: {navigator.userAgent.split(' ')[0]}</div>
          <div>URL: {window.location.href}</div>
          <div>Recognition: {recognition ? '✅' : '❌'}</div>
        </div>

        {/* 홈 */}
        <div className="mt-4 text-center">
          <a href="/" className="text-blue-500 hover:text-blue-700 underline">
            홈으로
          </a>
        </div>
      </div>
    </div>
  )
}

export default TestPage 