import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from './firebase'
import { auth } from './firebase'

export interface Product {
  id?: string
  title: string
  description: string
  price: number
  category: string
  condition: string
  location: string
  imageUrl: string
  userId: string
  userName: string
  createdAt: Date
  tags?: string[]
}

// 이미지 압축 함수
const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // 이미지 크기 계산
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      const newWidth = img.width * ratio
      const newHeight = img.height * ratio
      
      // 캔버스 크기 설정
      canvas.width = newWidth
      canvas.height = newHeight
      
      // 이미지 그리기
      ctx?.drawImage(img, 0, 0, newWidth, newHeight)
      
      // 압축된 Base64 반환
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
      resolve(compressedBase64)
    }
    
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// Base64로 이미지 변환하는 함수 (압축 포함)
const convertImageToBase64 = async (file: File): Promise<string> => {
  try {
    // 먼저 압축 시도
    const compressedImage = await compressImage(file)
    console.log('압축된 이미지 크기:', compressedImage.length, 'bytes')
    
    // 1MB 제한 확인 (약 1,000,000 bytes)
    if (compressedImage.length > 900000) {
      console.log('이미지가 여전히 큽니다. 더 강하게 압축합니다...')
      const moreCompressedImage = await compressImage(file, 600, 0.5)
      console.log('더 압축된 이미지 크기:', moreCompressedImage.length, 'bytes')
      return moreCompressedImage
    }
    
    return compressedImage
  } catch (error) {
    console.log('압축 실패, 원본 이미지 사용:', error)
    // 압축 실패시 원본 사용
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
}

export const uploadProduct = async (
  productData: Omit<Product, 'id' | 'imageUrl' | 'createdAt'>,
  imageFile: File
): Promise<string> => {
  try {
    console.log('=== 상품 업로드 시작 ===')
    console.log('상품 데이터:', productData)
    console.log('이미지 파일:', imageFile.name, imageFile.size, imageFile.type)
    
    // 사용자 인증 상태 확인
    const currentUser = auth.currentUser
    console.log('현재 사용자:', currentUser)
    console.log('사용자 ID:', currentUser?.uid)
    console.log('사용자 이메일:', currentUser?.email)
    console.log('사용자 인증 상태:', currentUser ? '로그인됨' : '로그인 안됨')
    
    if (!currentUser) {
      throw new Error('사용자가 로그인되지 않았습니다.')
    }
    
    // Base64 인코딩으로 Firestore에 직접 저장 (압축 포함)
    console.log('이미지 압축 및 Base64 인코딩 시작...')
    const base64Image = await convertImageToBase64(imageFile)
    console.log('최종 Base64 변환 완료, 길이:', base64Image.length, 'bytes')
    
    // 크기 제한 재확인
    if (base64Image.length > 1000000) {
      throw new Error(`이미지가 너무 큽니다. 크기: ${base64Image.length} bytes (제한: 1MB)`)
    }
    
    const productToSave = {
      ...productData,
      imageUrl: base64Image, // 압축된 Base64 이미지 데이터
      createdAt: new Date(),
      price: Number(productData.price),
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email || '익명'
    }
    
    console.log('저장할 상품 데이터 크기:', JSON.stringify(productToSave).length, 'bytes')
    console.log('Firestore에 압축된 Base64 이미지와 함께 저장...')
    
    const productDoc = await addDoc(collection(db, 'products'), productToSave)
    console.log('상품 정보 저장 완료:', productDoc.id)
    console.log('=== 상품 업로드 성공 ===')
    
    return productDoc.id
    
  } catch (error) {
    console.error('=== 상품 업로드 에러 ===')
    console.error('에러 객체:', error)
    console.error('에러 타입:', typeof error)
    console.error('에러 메시지:', error instanceof Error ? error.message : 'Unknown error')
    console.error('에러 스택:', error instanceof Error ? error.stack : 'No stack trace')
    
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Firebase 에러 코드:', (error as any).code)
    }
    
    throw new Error(`상품 업로드에 실패했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const getProducts = async (limitCount: number = 20): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    const products: Product[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      products.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        condition: data.condition,
        location: data.location,
        imageUrl: data.imageUrl,
        userId: data.userId,
        userName: data.userName,
        createdAt: data.createdAt.toDate(),
        tags: data.tags || []
      })
    })
    
    return products
  } catch (error) {
    console.error('상품 조회 에러:', error)
    throw new Error('상품 조회에 실패했습니다.')
  }
}

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const products: Product[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.category === category) {
        products.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          price: data.price,
          category: data.category,
          condition: data.condition,
          location: data.location,
          imageUrl: data.imageUrl,
          userId: data.userId,
          userName: data.userName,
          createdAt: data.createdAt.toDate(),
          tags: data.tags || []
        })
      }
    })
    
    return products
  } catch (error) {
    console.error('카테고리별 상품 조회 에러:', error)
    throw new Error('상품 조회에 실패했습니다.')
  }
} 