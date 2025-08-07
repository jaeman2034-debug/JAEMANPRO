import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-blue-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">
            🎉 성공!
          </h1>
          <p className="text-gray-700 mb-4">
            애플리케이션이 정상적으로 작동하고 있습니다!
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <p>✅ React: 정상</p>
            <p>✅ React Router: 정상</p>
            <p>✅ Tailwind CSS: 정상</p>
            <p>✅ TypeScript: 정상</p>
          </div>
          <div className="mt-6 space-y-2">
            <a 
              href="/test" 
              className="block w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              테스트 페이지
            </a>
            <a 
              href="/simple-stt-test" 
              className="block w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              STT 테스트
            </a>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App 