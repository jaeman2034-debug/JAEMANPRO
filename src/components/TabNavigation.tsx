import { Link, useLocation } from 'react-router-dom'

const TabNavigation = () => {
  const location = useLocation()

  const tabs = [
    { path: '/', label: '홈', icon: '🏠' },
    { path: '/market', label: '마켓', icon: '🛒' },
    { path: '/chat', label: '채팅', icon: '💬' },
    { path: '/mypage', label: '마이', icon: '👤' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center py-3 px-4 flex-1 transition-colors ${
              location.pathname === tab.path
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default TabNavigation 