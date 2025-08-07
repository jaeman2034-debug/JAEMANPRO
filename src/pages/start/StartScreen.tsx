import { useNavigate } from 'react-router-dom'

function StartScreen() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4">
        <div className="text-6xl mb-4">🚀</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          JAEMANPRO
        </h1>
        <p className="text-gray-600 mb-6">
          음성 인식 기반 회원가입 시스템
        </p>
        
        <div className="space-y-3">
          <button 
            onClick={() => navigate('/simple-stt-test')}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            STT 테스트
          </button>
          <button 
            onClick={() => navigate('/test')}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            테스트 페이지
          </button>
        </div>
      </div>
    </div>
  )
}

export default StartScreen 