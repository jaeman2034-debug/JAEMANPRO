import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/home/Home'
import Market from '../pages/market/Market'
import Chat from '../pages/chat/Chat'
import MyPage from '../pages/mypage/MyPage'
import TabNavigation from './TabNavigation'

const MainApp = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/market" element={<Market />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
      <TabNavigation />
    </div>
  )
}

export default MainApp 