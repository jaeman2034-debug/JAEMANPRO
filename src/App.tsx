import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import StartScreen from './pages/start/StartScreen'
import Home from './pages/home/Home'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import Market from './pages/market/Market'
import ProductDetail from './pages/market/ProductDetail'
import Chat from './pages/chat/Chat'
import MyPage from './pages/mypage/MyPage'
import VoiceSignup from './pages/VoiceSignup'
import VoiceStage from './components/VoiceStage'
import VoiceSignupNLU from './components/VoiceSignupNLU'
import SimpleVoiceSignup from './components/SimpleVoiceSignup'
import UltraSimpleVoiceSignup from './components/UltraSimpleVoiceSignup'
import TestPage from './components/TestPage'
import STTTestPage from './components/STTTestPage'
import SimpleSTTTest from './components/SimpleSTTTest'
import WhiteScreenTest from './components/WhiteScreenTest'


// 에러 컴포넌트
const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">페이지 오류</h1>
        <p className="text-red-500 mb-4">페이지를 불러오는 중 오류가 발생했습니다.</p>
        <pre className="text-xs text-red-400 bg-red-100 p-4 rounded overflow-auto max-w-md">
          {error.message}
        </pre>
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

// 안전한 컴포넌트 래퍼
const SafeComponent = ({ Component }: { Component: React.ComponentType }) => {
  return <Component />
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        
        <Routes>
          <Route path="/" element={<SafeComponent Component={StartScreen} />} />
          <Route path="/home" element={<SafeComponent Component={Home} />} />
          <Route path="/login" element={<SafeComponent Component={Login} />} />
          <Route path="/register" element={<SafeComponent Component={Register} />} />
          <Route path="/market" element={<SafeComponent Component={Market} />} />
          <Route path="/market/product/:productId" element={<SafeComponent Component={ProductDetail} />} />
          <Route path="/chat" element={<SafeComponent Component={Chat} />} />
          <Route path="/mypage" element={<SafeComponent Component={MyPage} />} />
          <Route path="/voice-signup" element={<SafeComponent Component={VoiceSignup} />} />
          <Route path="/voice-stage" element={<SafeComponent Component={VoiceStage} />} />
        <Route path="/voice-signup-nlu" element={<SafeComponent Component={VoiceSignupNLU} />} />
        <Route path="/simple-voice-signup" element={<SafeComponent Component={SimpleVoiceSignup} />} />
        <Route path="/ultra-simple-voice-signup" element={<SafeComponent Component={UltraSimpleVoiceSignup} />} />
        <Route path="/test" element={<SafeComponent Component={TestPage} />} />
        <Route path="/stt-test" element={<SafeComponent Component={STTTestPage} />} />
        <Route path="/simple-stt-test" element={<SafeComponent Component={SimpleSTTTest} />} />
        <Route path="/white-test" element={<SafeComponent Component={WhiteScreenTest} />} />
  
          
          {/* 404 페이지 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-4">페이지를 찾을 수 없습니다.</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  홈으로 돌아가기
                </button>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App 