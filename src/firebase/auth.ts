// Firebase Auth를 더미 함수로 대체
// import { 
//   getAuth, 
//   createUserWithEmailAndPassword, 
//   signInWithEmailAndPassword, 
//   signOut, 
//   GoogleAuthProvider, 
//   signInWithPopup,
//   type User,
//   onAuthStateChanged as firebaseOnAuthStateChanged
// } from 'firebase/auth'
// import { app } from '../firebase'

// const auth = getAuth(app)
// const googleProvider = new GoogleAuthProvider()

// 더미 사용자 타입
interface DummyUser {
  uid: string
  email: string | null
  displayName: string | null
}

// 더미 함수들
export const registerUser = async (email: string, _password: string): Promise<{ success: boolean; user?: DummyUser; error?: any }> => {
  console.log('더미: 회원가입 시도', email)
  return {
    success: false,
    error: 'Firebase가 비활성화되었습니다.'
  }
}

export const loginUser = async (email: string, _password: string): Promise<{ success: boolean; user?: DummyUser; error?: any }> => {
  console.log('더미: 로그인 시도', email)
  return {
    success: false,
    error: 'Firebase가 비활성화되었습니다.'
  }
}

export const loginWithGoogle = async (): Promise<{ success: boolean; user?: DummyUser; error?: any }> => {
  console.log('더미: Google 로그인 시도')
  return {
    success: false,
    error: 'Firebase가 비활성화되었습니다.'
  }
}

export const logoutUser = async (): Promise<{ success: boolean; error?: any }> => {
  console.log('더미: 로그아웃')
  return {
    success: true
  }
}

export const getCurrentUser = (): DummyUser | null => {
  return null
}

export const onAuthStateChanged = (callback: (user: DummyUser | null) => void) => {
  console.log('더미: 인증 상태 변경 리스너')
  callback(null)
  return () => {}
}

export const auth = null 