import { useNavigate } from 'react-router-dom'

export default function StartScreen() {
  const navigate = useNavigate()

  const features = [
    {
      title: '🎤 기본 음성 회원가입',
      description: '단계별 음성 입력으로 회원가입',
      path: '/simple-voice-signup',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: '🤖 NLU 음성 회원가입',
      description: '자연어 이해를 통한 스마트 회원가입',
      path: '/voice-signup-nlu',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: '🚀 초간단 음성 회원가입',
      description: '한 번의 음성으로 모든 정보 입력',
      path: '/ultra-simple-voice-signup',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: '🎯 고급 음성 회원가입',
      description: '완전한 음성 기반 회원가입 시스템',
      path: '/voice-signup',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      title: '🎭 음성 스테이지',
      description: '음성 인식 단계별 테스트',
      path: '/voice-stage',
      color: 'bg-pink-500 hover:bg-pink-600'
    },
    {
      title: '🛒 마켓플레이스',
      description: '상품 관리 및 조회 시스템',
      path: '/market',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-3xl mr-3">🎤</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">JAEMANPRO</h1>
                <p className="text-sm text-gray-600">음성 기반 회원가입 시스템</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                로그인
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                회원가입
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 환영 메시지 */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 음성 기반 회원가입 시스템에 오신 것을 환영합니다!
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            다양한 음성 인식 기술을 활용한 혁신적인 회원가입 경험을 제공합니다.
            아래 기능들을 선택하여 테스트해보세요!
          </p>
        </div>

        {/* 기능 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {feature.description}
                </p>
                <button
                  onClick={() => navigate(feature.path)}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${feature.color}`}
                >
                  시작하기 →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 기술 스택 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🛠️ 사용된 기술 스택
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">⚛️</div>
              <h4 className="font-semibold text-gray-900">React</h4>
              <p className="text-sm text-gray-600">사용자 인터페이스</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📘</div>
              <h4 className="font-semibold text-gray-900">TypeScript</h4>
              <p className="text-sm text-gray-600">타입 안전성</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🎨</div>
              <h4 className="font-semibold text-gray-900">Tailwind CSS</h4>
              <p className="text-sm text-gray-600">스타일링</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">⚡</div>
              <h4 className="font-semibold text-gray-900">Vite</h4>
              <p className="text-sm text-gray-600">빌드 도구</p>
            </div>
          </div>
        </div>

        {/* 음성 인식 기능 설명 */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">🎤 음성 인식 기능</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Web Speech API</h4>
              <p className="text-blue-100">브라우저 내장 음성 인식 및 합성 기능</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">NLU (자연어 이해)</h4>
              <p className="text-blue-100">의도 분류 및 엔티티 추출</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">자동 폼 채우기</h4>
              <p className="text-blue-100">음성으로 추출된 정보 자동 입력</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 