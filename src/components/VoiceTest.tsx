import React, { useState, useEffect } from 'react'

const VoiceTest = () => {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
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
      console.log('음성 인식 시작!')
      setIsListening(true)
      setError('')
    }

    recognition.onresult = (event) => {
      console.log('음성 인식 결과:', event)
      const result = event.results[0][0].transcript
      console.log('인식된 텍스트:', result)
      setTranscript(result)
    }

    recognition.onerror = (event) => {
      console.error('음성 인식 에러:', event.error)
      setError(`에러: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      console.log('음성 인식 종료')
      setIsListening(false)
    }

    // 전역 변수로 저장
    ;(window as any).testRecognition = recognition
  }, [])

  const startListening = async () => {
    try {
      // 마이크 권한 요청
      await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('마이크 권한 허용됨')
      
      // 음성 인식 시작
      const recognition = (window as any).testRecognition
      if (recognition) {
        recognition.start()
      }
    } catch (error) {
      console.error('마이크 권한 에러:', error)
      setError('마이크 권한이 필요합니다.')
    }
  }

  const stopListening = () => {
    const recognition = (window as any).testRecognition
    if (recognition) {
      recognition.stop()
    }
  }

  return (
    <div style={{
      padding: '20px',
      border: '2px solid #333',
      borderRadius: '10px',
      margin: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <h3>🎤 음성 인식 테스트</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={isListening ? stopListening : startListening}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: isListening ? '#ff4444' : '#44aa44',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {isListening ? '🔴 중지' : '🎤 시작'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          에러: {error}
        </div>
      )}

      {isListening && (
        <div style={{ color: 'blue', marginBottom: '10px' }}>
          🎤 음성 인식 중... 말씀해주세요!
        </div>
      )}

      {transcript && (
        <div style={{
          padding: '10px',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '5px',
          marginTop: '10px'
        }}>
          <strong>인식된 텍스트:</strong> {transcript}
        </div>
      )}

      <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        <p>💡 사용법:</p>
        <ul>
          <li>1. "시작" 버튼 클릭</li>
          <li>2. 마이크 권한 허용</li>
          <li>3. "안녕하세요" 또는 "테스트" 말하기</li>
          <li>4. 인식된 텍스트 확인</li>
        </ul>
      </div>
    </div>
  )
}

export default VoiceTest 