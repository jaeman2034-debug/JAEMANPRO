import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
// Firebase 의존성 제거
// import { doc, getDoc } from 'firebase/firestore'
// import { db } from '../../services/firebase'
import { Product } from '../../services/productService'

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const [product, _setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError('상품 ID가 없습니다.')
        setLoading(false)
        return
      }

      try {
        console.log('더미: 상품 상세 정보 조회', productId)
        // Firebase 대신 더미 데이터 사용
        setError('Firebase가 비활성화되었습니다.')
      } catch (error) {
        console.error('상품 조회 에러:', error)
        setError('상품 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">상품 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error || '상품을 찾을 수 없습니다.'}</p>
          <button
            onClick={() => navigate('/market')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            마켓으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
              <p className="text-2xl font-bold text-blue-600 mb-4">
                ₩{formatPrice(product.price)}
              </p>
              <div className="space-y-4 mb-6">
                <div>
                  <span className="font-semibold text-gray-700">카테고리:</span>
                  <span className="ml-2 text-gray-600">{product.category}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">상태:</span>
                  <span className="ml-2 text-gray-600">{product.condition}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">위치:</span>
                  <span className="ml-2 text-gray-600">{product.location}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">판매자:</span>
                  <span className="ml-2 text-gray-600">{product.userName}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">등록일:</span>
                  <span className="ml-2 text-gray-600">{formatDate(product.createdAt)}</span>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">상품 설명</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
              </div>
              {product.tags && product.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">태그</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex space-x-4">
                <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                  문의하기
                </button>
                <button className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors">
                  찜하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail 