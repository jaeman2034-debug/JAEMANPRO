// Firebase 의존성 제거 - 더미 함수로 대체
// import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore'
// import { db, auth } from '../firebase'

export interface Product {
  id: string
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

// 더미 함수들
export const addProduct = async (productData: any) => {
  console.log('더미: 상품 추가', productData)
  return { id: 'dummy_id', ...productData }
}

export const uploadProduct = async (productData: any, imageFile: File) => {
  console.log('더미: 상품 업로드', productData, imageFile.name)
  return 'dummy_product_id'
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