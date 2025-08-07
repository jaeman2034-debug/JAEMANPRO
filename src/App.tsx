import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          성공!
        </h1>
        <p className="text-gray-600 mb-6">
          애플리케이션이 정상적으로 작동하고 있습니다!
        </p>
        
        <div className="space-y-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <span>React</span>
            <span className="text-green-600 font-semibold">✅ 정상</span>
          </div>
          <div className="flex items-center justify-between">
            <span>TypeScript</span>
            <span className="text-green-600 font-semibold">✅ 정상</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Tailwind CSS</span>
            <span className="text-green-600 font-semibold">✅ 정상</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Vite</span>
            <span className="text-green-600 font-semibold">✅ 정상</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={() => alert('버튼이 정상 작동합니다!')}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            테스트 버튼
          </button>
          <div className="text-xs text-gray-500">
            배포 시간: {new Date().toLocaleString('ko-KR')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 