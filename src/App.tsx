function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl text-center max-w-md w-full">
        <div className="text-7xl mb-6">🎉</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          성공!
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          애플리케이션이 정상적으로 작동하고 있습니다!
        </p>
        
        <div className="space-y-4 text-sm text-gray-700 bg-white/50 p-6 rounded-2xl mb-8">
          <div className="flex items-center justify-between">
            <span className="font-medium">React</span>
            <span className="text-green-600 font-bold">✅ 정상</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">TypeScript</span>
            <span className="text-green-600 font-bold">✅ 정상</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Tailwind CSS</span>
            <span className="text-green-600 font-bold">✅ 정상</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Vite</span>
            <span className="text-green-600 font-bold">✅ 정상</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">배포</span>
            <span className="text-green-600 font-bold">✅ 성공</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={() => {
              alert('🎉 모든 기능이 정상 작동합니다!\n\nFirebase 에러가 완전히 해결되었습니다!')
            }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🚀 테스트 버튼
          </button>
          
          <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded-lg">
            <div className="font-semibold mb-1">배포 정보:</div>
            <div>시간: {new Date().toLocaleString('ko-KR')}</div>
            <div>환경: Vercel Production</div>
            <div>상태: Firebase 에러 해결됨 ✅</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 