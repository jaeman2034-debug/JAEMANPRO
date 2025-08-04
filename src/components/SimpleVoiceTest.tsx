import React, { useState, useEffect } from 'react'

const SimpleVoiceTest = () => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    // Web Speech API 지원 확인
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setError('이 브라우저는 음성 인식을 지원하지 않습니다.')
      return
    }

    const rec = new SpeechRecognition()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'ko-KR'

    rec.onstart = () => {
      console.log('🎤 음성 인식 시작됨')
      setIsListening(true)
      setError('')
    }

    rec.onresult = (event: any) => {
      console.log('🎤 음성 인식 결과:', event)
      const result = event.results[0][0].transcript
      console.log('🎤 인식된 텍스트:', result)
      setTranscript(result)
    }

    rec.onerror = (event: any) => {
      console.error('🎤 음성 인식 에러:', event.error)
      setError(`에러: ${event.error}`)
      setIsListening(false)
    }

    rec.onend = () => {
      console.log('🎤 음성 인식 종료됨')
      setIsListening(false)
    }

    setRecognition(rec)
  }, [])

  const startListening = async () => {
    try {
      console.log('🎤 마이크 권한 요청 중...')
      
      // 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      console.log('🎤 마이크 권한 허용됨:', stream)
      
      // 스트림 정리
      stream.getTracks().forEach(track => track.stop())
      
      // 음성 인식 시작
      if (recognition) {
        console.log('🎤 음성 인식 시작 시도...')
        recognition.start()
      }
    } catch (error: any) {
      console.error('🎤 마이크 에러:', error)
      if (error.name === 'NotAllowedError') {
        setError('마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.')
      } else if (error.name === 'NotFoundError') {
        setError('마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.')
      } else {
        setError(`마이크 에러: ${error.message}`)
      }
    }
  }

  const stopListening = () => {
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
      <h3 style={{ color: '#dc2626', marginBottom: '15px' }}>🔧 마이크 진단 테스트</h3>
      
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

export default SimpleVoiceTest 