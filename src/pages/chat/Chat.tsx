const Chat = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">채팅</h1>
          <p className="text-gray-600 mt-2">실시간 채팅과 AI 챗봇</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">채팅 기능 준비 중</h2>
            <p className="text-gray-600 mb-6">
              Firebase 기반 실시간 채팅과 AI 챗봇 기능이 곧 준비됩니다.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                <span className="text-sm text-gray-600">실시간 채팅</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                <span className="text-sm text-gray-600">AI 챗봇</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                <span className="text-sm text-gray-600">음성 인식</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat 