import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  type User,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from 'firebase/auth'
import { app } from '../firebase'

const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

// 회원가입
export const registerUser = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: any }> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return {
      success: true,
      user: userCredential.user
    }
  } catch (error: any) {
    console.error('회원가입 실패:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 로그인
export const loginUser = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: any }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return {
      success: true,
      user: userCredential.user
    }
  } catch (error: any) {
    console.error('로그인 실패:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Google 로그인
export const loginWithGoogle = async (): Promise<{ success: boolean; user?: User; error?: any }> => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return {
      success: true,
      user: result.user
    }
  } catch (error: any) {
    console.error('Google 로그인 실패:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 로그아웃
export const logoutUser = async (): Promise<{ success: boolean; error?: any }> => {
  try {
    await signOut(auth)
    return {
      success: true
    }
  } catch (error: any) {
    console.error('로그아웃 실패:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// 현재 사용자 가져오기
export const getCurrentUser = (): User | null => {
  return auth.currentUser
}

// 인증 상태 변경 리스너
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return firebaseOnAuthStateChanged(auth, callback)
}

export { auth } 