import React, { useState } from 'react'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'

const TTSTest = () => {
  const [text, setText] = useState('안녕하세요, TTS 테스트입니다.')
  const { speak, stop } = useSpeechSynthesis()

  const handleSpeak = () => {
    console.log('TTS 테스트 시작:', text)
    speak(text)
  }

  const handleStop = () => {
    console.log('TTS 중지')
    stop()
  }

  const testMessages = [
    '안녕하세요, TTS 테스트입니다.',
    '음성 합성이 정상적으로 작동합니다.',
    '야고 스포츠 플랫폼에 오신 것을 환영합니다.',
    '음성으로 로그인하실 수 있습니다.'
  ]

  return (
    <div style={{
      padding: '20px',
      border: '2px solid #0066cc',
      borderRadius: '10px',
      margin: '20px',
      backgroundColor: '#f0f8ff'
    }}>
      <h3>🔊 TTS (Text-to-Speech) 테스트</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: '100%',
            height: '80px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            fontSize: '14px'
          }}
          placeholder="읽어줄 텍스트를 입력하세요..."
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={handleSpeak}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          🔊 읽기
        </button>
        
        <button
          onClick={handleStop}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#cc6600',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ⏹️ 중지
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h4>빠른 테스트 메시지:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {testMessages.map((message, index) => (
            <button
              key={index}
              onClick={() => {
                setText(message)
                speak(message)
              }}
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                backgroundColor: '#e6f3ff',
                color: '#0066cc',
                border: '1px solid #0066cc',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {message.substring(0, 15)}...
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '14px', color: '#666' }}>
        <p>💡 사용법:</p>
        <ul>
          <li>1. 텍스트 입력 또는 빠른 테스트 버튼 클릭</li>
          <li>2. "🔊 읽기" 버튼 클릭</li>
          <li>3. 음성으로 텍스트가 읽혀지는지 확인</li>
          <li>4. "⏹️ 중지" 버튼으로 중단 가능</li>
        </ul>
      </div>
    </div>
  )
}

export default TTSTest 