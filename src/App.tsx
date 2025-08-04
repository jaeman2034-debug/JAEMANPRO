import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import StartScreen from './pages/start/StartScreen'
import Home from './pages/home/Home'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import Market from './pages/market/Market'
import ProductDetail from './pages/market/ProductDetail'
import Chat from './pages/chat/Chat'
import MyPage from './pages/mypage/MyPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<StartScreen />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/market" element={<Market />} />
          <Route path="/market/product/:productId" element={<ProductDetail />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App 