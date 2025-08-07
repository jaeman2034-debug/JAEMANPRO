import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function StartScreen() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎤 음성 회원가입
          </h1>
          <p className="text-gray-600 mb-8">
            STT + NLU + 자동 회원가입 시스템
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate('/simple-stt-test')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🚀 STT + NLU 테스트
            </button>
            
            <button
              onClick={() => navigate('/test')}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              ✅ 기본 테스트
            </button>
            
            <button
              onClick={() => navigate('/voice-signup-nlu')}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              🤖 고급 음성 회원가입
            </button>
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">기능 목록:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ 음성 인식 (STT)</li>
              <li>✅ 자연어 이해 (NLU)</li>
              <li>✅ 자동 회원가입</li>
              <li>✅ 음성 합성 (TTS)</li>
              <li>✅ 오류 추적 시스템</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 