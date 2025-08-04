import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            야고 스포츠
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            체육인을 위한 종합 플랫폼
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login" 
              className="btn-primary text-lg px-8 py-3"
            >
              시작하기
            </Link>
            <Link 
              to="/market" 
              className="btn-secondary text-lg px-8 py-3"
            >
              마켓 둘러보기
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            야고 스포츠의 특징
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold mb-3">중고 스포츠 마켓</h3>
              <p className="text-gray-600">
                AI 자동 태깅과 GPS 기반 위치 필터링으로 
                원하는 스포츠 용품을 쉽게 찾아보세요
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-semibold mb-3">체육 일자리</h3>
              <p className="text-gray-600">
                체육인 인증 기반 추천과 위치 기반 매칭으로 
                최적의 일자리를 찾아보세요
              </p>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-3">스포츠 커뮤니티</h3>
              <p className="text-gray-600">
                지역 기반 모임과 음성 안내로 
                같은 관심사를 가진 사람들과 소통하세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">
            AI 기술로 더 스마트하게
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-3">AI 챗봇</h3>
              <p className="text-gray-600">
                GPT 기반 챗봇으로 운동 추천, 상담, 도움을 받아보세요
              </p>
            </div>
            <div className="card">
              <div className="text-3xl mb-4">🎤</div>
              <h3 className="text-xl font-semibold mb-3">음성 기능</h3>
              <p className="text-gray-600">
                Web Speech API로 음성 인식과 TTS 안내를 경험해보세요
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home 