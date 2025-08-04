import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { Product } from '../../services/productService'

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
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
        console.log('상품 상세 정보 조회 시작:', productId)
        const productDoc = await getDoc(doc(db, 'products', productId))
        
        if (productDoc.exists()) {
          const data = productDoc.data()
          const productData: Product = {
            id: productDoc.id,
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
          }
          setProduct(productData)
          console.log('상품 정보 로드 완료:', productData)
        } else {
          setError('상품을 찾을 수 없습니다.')
        }
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
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/market')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로가기
          </button>
          <h1 className="text-lg font-semibold text-gray-800">상품 상세</h1>
          <div className="w-6"></div> {/* 균형을 위한 빈 공간 */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* 이미지 섹션 */}
          <div className="relative">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-96 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzE3NSAyMDAgMTUwIDI1MCAyMDAgMzAwQzI1MCAyNTAgMjI1IDIwMCAyMDAgMTUwWiIgZmlsbD0iI0QxRDU5QSIvPgo8L3N2Zz4K'
              }}
            />
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                product.condition === '새상품' ? 'bg-green-100 text-green-800' :
                product.condition === '거의새상품' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {product.condition}
              </span>
            </div>
          </div>

          {/* 상품 정보 섹션 */}
          <div className="p-6">
            {/* 제목과 가격 */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <p className="text-3xl font-bold text-blue-600">{formatPrice(product.price)}원</p>
            </div>

            {/* 카테고리와 위치 */}
            <div className="flex items-center space-x-4 mb-6 text-sm text-gray-600">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {product.category}
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {product.location}
              </div>
            </div>

            {/* 상품 설명 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">상품 설명</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>

            {/* 태그 */}
            {product.tags && product.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">태그</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 판매자 정보 */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">판매자 정보</h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{product.userName}</p>
                  <p className="text-sm text-gray-600">등록일: {formatDate(product.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* 연락하기 버튼 */}
            <div className="mt-8 flex space-x-4">
              <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                판매자에게 연락하기
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                관심상품 등록
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail 