import React from 'react'
import { useSpeechNLU } from '../hooks/useSpeechNLU'
import { useNavigate } from 'react-router-dom'

const UltraSimpleVoiceSignup: React.FC = () => {
  const navigate = useNavigate()
  const { 
    startVoiceSignup, 
    transcript, 
    form, 
    loading, 
    error, 
    isListening, 
    stopListening 
  } = useSpeechNLU()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          🚀 초간단 음성 회원가입
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          한 번의 음성으로 모든 정보를 입력하세요
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          {/* 음성 인식 상태 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center mb-3">
              <div className={`w-4 h-4 rounded-full mr-3 ${
                isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm font-medium text-blue-700">
                {isListening ? '🎤 음성 인식 중...' : '🎤 음성 인식 대기'}
              </span>
            </div>
            
            {transcript && (
              <div className="text-sm text-gray-700 mb-3 p-2 bg-white rounded border">
                <span className="font-medium">인식된 음성:</span> {transcript}
              </div>
            )}
            
            {loading && (
              <div className="text-sm text-orange-600 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                분석 중...
              </div>
            )}
            
            {error && (
              <div className="text-sm text-red-600 p-2 bg-red-50 rounded border border-red-200">
                ❌ {error}
              </div>
            )}
          </div>

          {/* 분석 결과 */}
          {form && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-3">✅ 분석 완료!</h4>
              <div className="text-sm text-green-700 space-y-2">
                <div><span className="font-medium">이름:</span> {form.name}</div>
                <div><span className="font-medium">이메일:</span> {form.email}</div>
                <div><span className="font-medium">비밀번호:</span> {'*'.repeat(form.password.length)}</div>
                <div><span className="font-medium">전화번호:</span> {form.phone}</div>
              </div>
            </div>
          )}

          {/* 음성 제어 버튼 */}
          <div className="mb-6">
            {!isListening ? (
              <button
                onClick={startVoiceSignup}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-lg"
              >
                🎤 음성으로 회원가입 시작
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 font-medium text-lg"
              >
                ⏹️ 음성 인식 중지
              </button>
            )}
          </div>

          {/* 사용법 안내 */}
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">💡 사용법</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• "이름은 이재만이고, 이메일은 jaeman2034@gmail.com, 비밀번호는 12345678, 전화번호는 01012345678입니다"</p>
              <p>• 모든 정보를 한 번에 말씀하시면 자동으로 분석되고 회원가입됩니다</p>
            </div>
          </div>

          {/* 취소 버튼 */}
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
          >
            취소
          </button>

          {/* 성공 메시지 */}
          {form && !loading && !error && (
            <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-300">
              <p className="text-green-800 text-sm text-center">
                🎉 회원가입이 완료되었습니다!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UltraSimpleVoiceSignup 