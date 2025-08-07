// Firebase 의존성 제거 - 더미 함수로 대체
// import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore'
// import { db, auth } from '../firebase'

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

// 더미 함수들
export const addProduct = async (productData: any) => {
  console.log('더미: 상품 추가', productData)
  return { id: 'dummy_id', ...productData }
}

export const getProducts = async () => {
  console.log('더미: 상품 목록 조회')
  return []
}

export const getProductById = async (id: string) => {
  console.log('더미: 상품 조회', id)
  return null
}

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    // 더미 함수로 대체
    console.log('더미: 카테고리별 상품 조회', category)
    return []
  } catch (error) {
    console.error('카테고리별 상품 조회 에러:', error)
    throw new Error('상품 조회에 실패했습니다.')
  }
} 