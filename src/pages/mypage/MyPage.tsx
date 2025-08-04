const MyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">마이페이지</h1>
          <p className="text-gray-600 mt-2">내 정보와 활동 내역</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 프로필 섹션 */}
        <div className="card mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">사용자</h2>
              <p className="text-gray-600">user@example.com</p>
            </div>
          </div>
        </div>

        {/* 메뉴 섹션 */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-lg mb-4">내 활동</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">내 상품</span>
                <span className="text-primary-600 font-medium">0개</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">찜한 상품</span>
                <span className="text-primary-600 font-medium">0개</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-700">채팅방</span>
                <span className="text-primary-600 font-medium">0개</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-lg mb-4">설정</h3>
            <div className="space-y-3">
              <button className="w-full text-left py-2 text-gray-700 hover:text-primary-600">
                프로필 수정
              </button>
              <button className="w-full text-left py-2 text-gray-700 hover:text-primary-600">
                알림 설정
              </button>
              <button className="w-full text-left py-2 text-gray-700 hover:text-primary-600">
                개인정보 처리방침
              </button>
              <button className="w-full text-left py-2 text-red-600 hover:text-red-700">
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyPage 