import React, { useState, useEffect } from 'react'

const DirectVoiceTest = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Web Speech API 지원 확인
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setError('이 브라우저는 음성 인식을 지원하지 않습니다.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'ko-KR'

    recognition.onstart = () => {
      console.log('🎤 음성 인식 시작됨')
      setIsListening(true)
      setError('')
    }

    recognition.onresult = (event) => {
      console.log('🎤 음성 인식 결과:', event)
      const result = event.results[0][0].transcript
      console.log('🎤 인식된 텍스트:', result)
      setTranscript(result)
    }

    recognition.onerror = (event) => {
      console.error('🎤 음성 인식 에러:', event.error)
      setError(`에러: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      console.log('🎤 음성 인식 종료됨')
      setIsListening(false)
    }

    // 전역 변수로 저장
    ;(window as any).directRecognition = recognition
  }, [])

  const startListening = async () => {
    try {
      console.log('🎤 마이크 권한 요청 중...')
      
      // 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true
      })
      
      console.log('🎤 마이크 권한 허용됨:', stream)
      
      // 스트림 정리
      stream.getTracks().forEach(track => track.stop())
      
      // 음성 인식 시작
      const recognition = (window as any).directRecognition
      if (recognition) {
        console.log('🎤 음성 인식 시작 시도...')
        recognition.start()
      }
    } catch (error: any) {
      console.error('🎤 마이크 에러:', error)
      setError(`마이크 에러: ${error.message}`)
    }
  }

  const stopListening = () => {
    const recognition = (window as any).directRecognition
    if (recognition && isListening) {
      recognition.stop()
    }
  }

  return (
    <div style={{
      padding: '20px',
      border: '3px solid #ff6b6b',
      borderRadius: '10px',
      margin: '20px',
      backgroundColor: '#fff5f5'
    }}>
      <h3 style={{ color: '#dc2626', marginBottom: '15px' }}>🎤 직접 마이크 테스트</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={isListening ? stopListening : startListening}
          style={{
            padding: '15px 25px',
            fontSize: '18px',
            backgroundColor: isListening ? '#dc2626' : '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isListening ? '🔴 중지' : '🎤 시작'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fef2f2',
          border: '2px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          marginBottom: '15px',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {isListening && (
        <div style={{
          padding: '12px',
          backgroundColor: '#dbeafe',
          border: '2px solid #93c5fd',
          borderRadius: '8px',
          color: '#1e40af',
          marginBottom: '15px',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          🎤 음성 인식 중... 말씀해주세요!
        </div>
      )}

      {transcript && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f0fdf4',
          border: '2px solid #bbf7d0',
          borderRadius: '8px',
          color: '#166534',
          marginBottom: '15px'
        }}>
          <strong>인식된 텍스트:</strong> {transcript}
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#666' }}>
        <p><strong>브라우저 정보:</strong></p>
        <ul>
          <li>SpeechRecognition: {window.SpeechRecognition ? '✅ 지원' : '❌ 미지원'}</li>
          <li>webkitSpeechRecognition: {window.webkitSpeechRecognition ? '✅ 지원' : '❌ 미지원'}</li>
          <li>mediaDevices: {navigator.mediaDevices ? '✅ 지원' : '❌ 미지원'}</li>
        </ul>
      </div>
    </div>
  )
}

export default DirectVoiceTest 