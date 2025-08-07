import { useState, useEffect } from 'react'

// 더미 사용자 타입
interface DummyUser {
  uid: string
  email: string | null
  displayName: string | null
}

// 더미 인증 훅
export const useAuth = () => {
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

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    login,
    register,
    loginWithGoogle
  }
} 