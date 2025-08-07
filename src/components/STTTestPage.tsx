import React, { useState, useCallback, useEffect } from 'react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'

const STTTestPage: React.FC = () => {
  const [transcriptHistory, setTranscriptHistory] = useState<string[]>([])
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [errorCount, setErrorCount] = useState(0)
  const [successCount, setSuccessCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(5)
  const [browserSupport, setBrowserSupport] = useState<{
    speechRecognition: boolean
    speechSynthesis: boolean
    https: boolean
    microphone: boolean
  }>({
    speechRecognition: false,
    speechSynthesis: false,
    https: false,
    microphone: false
  })

  const { 
    transcript, 
    isListening, 
    startListening, 
    stopListening, 
    resetTranscript,
    error: speechError,
    setError: setSpeechError
  } = useSpeechRecognition()

  const { speak } = useSpeechSynthesis()

  // 브라우저 호환성 체크
  useEffect(() => {
    const checkBrowserSupport = async () => {
      console.log('🔍 브라우저 호환성 체크 시작...')
      console.log('📍 현재 URL:', window.location.href)
      console.log('🌐 프로토콜:', window.location.protocol)
      console.log('🏠 호스트:', window.location.hostname)
      
      const support = {
        speechRecognition: !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
        speechSynthesis: !!window.speechSynthesis,
        https: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
        microphone: false
      }

      console.log('🎤 SpeechRecognition 지원:', support.speechRecognition)
      console.log('🔊 SpeechSynthesis 지원:', support.speechSynthesis)
      console.log('🔒 HTTPS 환경:', support.https)

      // 마이크 권한 체크
      try {
        console.log('🎤 마이크 권한 요청 중...')
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        support.microphone = true
        console.log('✅ 마이크 권한 획득 성공')
        stream.getTracks().forEach(track => track.stop()) // 스트림 정리
      } catch (error) {
        console.log('❌ 마이크 권한 없음:', error)
        support.microphone = false
      }

      setBrowserSupport(support)
      console.log('📊 최종 브라우저 지원 상태:', support)
    }

    checkBrowserSupport()
  }, [])

  // 음성 인식 시작
  const handleStartListening = useCallback(async () => {
    // 브라우저 지원 체크
    if (!browserSupport.speechRecognition) {
      setSpeechError('이 브라우저는 음성 인식을 지원하지 않습니다.')
      return
    }

    if (!browserSupport.https) {
      setSpeechError('음성 인식은 HTTPS 환경에서만 작동합니다.')
      return
    }

    if (!browserSupport.microphone) {
      setSpeechError('마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.')
      return
    }

    setCurrentTranscript('')
    setSpeechError(null)
    speak('음성 인식을 시작합니다. 말씀해주세요.')
    
    // 약간의 지연 후 음성 인식 시작 (TTS와 충돌 방지)
    setTimeout(() => {
      startListening()
    }, 500)
  }, [speak, startListening, setSpeechError, browserSupport])

  // 음성 인식 중지
  const handleStopListening = useCallback(() => {
    stopListening()
    if (transcript.trim()) {
      setTranscriptHistory(prev => [...prev, transcript])
      setSuccessCount(prev => prev + 1)
      speak('음성 인식이 완료되었습니다.')
    }
  }, [stopListening, transcript, speak])

  // 자동 중지 타이머 (5초 후 자동 중지)
  useEffect(() => {
    if (isListening) {
      setTimeLeft(5)
      const countdown = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdown)
            console.log('⏰ 5초 후 자동 중지')
            handleStopListening()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(countdown)
    } else {
      setTimeLeft(5)
    }
  }, [isListening, handleStopListening])

  // 음성 인식 결과 모니터링
  useEffect(() => {
    if (transcript && transcript !== currentTranscript) {
      setCurrentTranscript(transcript)
    }
  }, [transcript, currentTranscript])

  // 음성 인식 오류 처리
  useEffect(() => {
    if (speechError) {
      setErrorCount(prev => prev + 1)
      console.error('음성 인식 오류:', speechError)
    }
  }, [speechError])

  // 히스토리 초기화
  const clearHistory = useCallback(() => {
    setTranscriptHistory([])
    setErrorCount(0)
    setSuccessCount(0)
  }, [])

  // 현재 트랜스크립트 초기화
  const clearCurrent = useCallback(() => {
    setCurrentTranscript('')
    resetTranscript()
  }, [resetTranscript])

  // 마이크 권한 요청
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      setBrowserSupport(prev => ({ ...prev, microphone: true }))
      setSpeechError(null)
    } catch (error) {
      console.error('마이크 권한 요청 실패:', error)
      setSpeechError('마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          🎤 STT 음성 인식 테스트
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          음성 인식 기능을 테스트해보세요
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          
          {/* 브라우저 지원 상태 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">🔧 브라우저 지원 상태</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className={`flex items-center ${browserSupport.speechRecognition ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{browserSupport.speechRecognition ? '✅' : '❌'}</span>
                음성 인식 API
              </div>
              <div className={`flex items-center ${browserSupport.speechSynthesis ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{browserSupport.speechSynthesis ? '✅' : '❌'}</span>
                음성 합성 API
              </div>
              <div className={`flex items-center ${browserSupport.https ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{browserSupport.https ? '✅' : '❌'}</span>
                HTTPS 환경
              </div>
              <div className={`flex items-center ${browserSupport.microphone ? 'text-green-600' : 'text-red-600'}`}>
                <span className="mr-2">{browserSupport.microphone ? '✅' : '❌'}</span>
                마이크 권한
              </div>
            </div>
            
            {!browserSupport.microphone && (
              <button
                onClick={requestMicrophonePermission}
                className="mt-3 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                마이크 권한 요청
              </button>
            )}
          </div>

          {/* 상태 표시 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${
                  isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm font-medium text-blue-700">
                  {isListening ? `🎤 음성 인식 중... (${timeLeft}초)` : '🎤 음성 인식 대기'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                성공: {successCount} | 오류: {errorCount}
              </div>
            </div>
            
            {speechError && (
              <div className="text-sm text-red-600 p-2 bg-red-50 rounded border border-red-200">
                ❌ 오류: {speechError}
              </div>
            )}
          </div>

          {/* 현재 인식 결과 */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">현재 인식 결과</h4>
            <div className="text-sm text-green-700 p-3 bg-white rounded border min-h-[60px]">
              {currentTranscript || '음성을 말씀해주세요...'}
            </div>
            <button
              onClick={clearCurrent}
              className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
            >
              초기화
            </button>
          </div>

          {/* 제어 버튼 */}
          <div className="mb-6 flex space-x-2">
            {!isListening ? (
              <button
                onClick={handleStartListening}
                disabled={!browserSupport.speechRecognition || !browserSupport.https || !browserSupport.microphone || speechError?.includes('초기화')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                  browserSupport.speechRecognition && browserSupport.https && browserSupport.microphone && !speechError?.includes('초기화')
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                {speechError?.includes('초기화') ? '🔄 초기화 중...' : '🎤 음성 인식 시작'}
              </button>
            ) : (
              <button
                onClick={handleStopListening}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 font-medium"
              >
                ⏹️ 음성 인식 중지
              </button>
            )}
          </div>

          {/* 인식 히스토리 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">인식 히스토리</h4>
              <button
                onClick={clearHistory}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                전체 초기화
              </button>
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2">
              {transcriptHistory.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  아직 인식된 음성이 없습니다.
                </div>
              ) : (
                transcriptHistory.map((text, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-gray-50 rounded border text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">{text}</span>
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 사용법 안내 */}
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">💡 사용법</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• "음성 인식 시작" 버튼을 클릭하고 말씀해주세요</p>
              <p>• 인식된 텍스트가 실시간으로 표시됩니다</p>
              <p>• "음성 인식 중지" 버튼을 클릭하여 인식을 종료합니다</p>
              <p>• 인식 히스토리에서 이전 결과들을 확인할 수 있습니다</p>
              <p>• HTTPS 환경에서만 정상 작동합니다</p>
            </div>
          </div>

          {/* 홈으로 돌아가기 */}
          <div className="mt-6">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default STTTestPage 