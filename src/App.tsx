import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import StartScreen from './pages/start/StartScreen'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import VoiceSignup from './pages/VoiceSignup'
import SimpleVoiceSignup from './components/SimpleVoiceSignup'
import VoiceSignupNLU from './components/VoiceSignupNLU'
import UltraSimpleVoiceSignup from './components/UltraSimpleVoiceSignup'
import VoiceStage from './components/VoiceStage'
import Market from './pages/market/Market'
import ProductDetail from './pages/market/ProductDetail'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<StartScreen />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/voice-signup" element={<VoiceSignup />} />
            <Route path="/simple-voice-signup" element={<SimpleVoiceSignup />} />
            <Route path="/voice-signup-nlu" element={<VoiceSignupNLU />} />
            <Route path="/ultra-simple-voice-signup" element={<UltraSimpleVoiceSignup />} />
            <Route path="/voice-stage" element={<VoiceStage />} />
            <Route path="/market" element={<Market />} />
            <Route path="/market/:id" element={<ProductDetail />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App 