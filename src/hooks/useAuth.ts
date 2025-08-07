// Firebase 의존성 제거 - 더미 인증 함수로 대체
// import { auth } from '../services/firebase'

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

  const signIn = async (email: string, password: string) => {
    console.log('더미: 로그인 시도', email)
    return { success: false, error: 'Firebase가 비활성화되었습니다.' }
  }

  const signUp = async (email: string, password: string) => {
    console.log('더미: 회원가입 시도', email)
    return { success: false, error: 'Firebase가 비활성화되었습니다.' }
  }

  const signOut = async () => {
    console.log('더미: 로그아웃')
    setUser(null)
    return { success: true }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }
} 