import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// 더미 사용자 타입
interface DummyUser {
  uid: string
  email: string | null
  displayName: string | null
}

interface AuthContextType {
  user: DummyUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string }>
  signUp: (email: string, password: string) => Promise<{ success: boolean; error: string }>
  signOut: () => Promise<{ success: boolean }>
  login: (email: string, password: string) => Promise<{ success: boolean; error: string }>
  register: (email: string, password: string) => Promise<{ success: boolean; error: string }>
  loginWithGoogle: () => Promise<{ success: boolean; error: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<DummyUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 더미 인증 상태 - 항상 로그아웃 상태
    setUser(null)
    setLoading(false)
  }, [])

  const signIn = async (email: string, _password: string) => {
    console.log('더미: 로그인 시도', email)
    return { success: false, error: 'Firebase가 비활성화되었습니다.' }
  }

  const signUp = async (email: string, _password: string) => {
    console.log('더미: 회원가입 시도', email)
    return { success: false, error: 'Firebase가 비활성화되었습니다.' }
  }

  const signOut = async () => {
    console.log('더미: 로그아웃')
    setUser(null)
    return { success: true }
  }

  // 기존 코드와의 호환성을 위한 별칭 함수들
  const login = signIn
  const register = signUp
  const loginWithGoogle = async () => {
    console.log('더미: Google 로그인 시도')
    return { success: false, error: 'Firebase가 비활성화되었습니다.' }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    login,
    register,
    loginWithGoogle
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 