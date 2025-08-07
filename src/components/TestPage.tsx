import React from 'react'

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          🎉 테스트 페이지
        </h1>
        <p className="text-gray-700 mb-4">
          기본 렌더링이 정상적으로 작동하고 있습니다!
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            ✅ React 렌더링: 정상
          </p>
          <p className="text-sm text-gray-600">
            ✅ Tailwind CSS: 정상
          </p>
          <p className="text-sm text-gray-600">
            ✅ TypeScript: 정상
          </p>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  )
}

export default TestPage 