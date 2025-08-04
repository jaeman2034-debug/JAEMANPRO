import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { uploadProduct, getProducts, Product } from '../../services/productService'

const Market = () => {
  const navigate = useNavigate()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [productData, setProductData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'good',
    location: ''
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // 상품 목록 로드
  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const productList = await getProducts()
      setProducts(productList)
    } catch (error) {
      console.error('상품 로드 에러:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('=== 상품 등록 폼 제출 시작 ===')
    
    if (!user) {
      console.log('❌ 사용자 로그인 상태 확인 실패')
      alert('로그인이 필요합니다.')
      return
    }

    if (!selectedImage) {
      console.log('❌ 이미지 선택 확인 실패')
      alert('이미지를 선택해주세요.')
      return
    }

    console.log('✅ 사용자 정보:', user.uid, user.displayName, user.email)
    console.log('✅ 상품 데이터:', productData)
    console.log('✅ 선택된 이미지:', selectedImage.name, selectedImage.size, selectedImage.type)

    setUploading(true)
    try {
      const productInfo = {
        ...productData,
        price: Number(productData.price),
        userId: user.uid,
        userName: user.displayName || user.email || '익명'
      }

      console.log('📤 업로드할 상품 정보:', productInfo)
      console.log('🚀 uploadProduct 함수 호출 시작...')
      
      const productId = await uploadProduct(productInfo, selectedImage!)
      console.log('✅ 상품 업로드 성공! 상품 ID:', productId)
      
      alert('상품이 성공적으로 등록되었습니다!')
      setShowUploadModal(false)
      setProductData({
        title: '',
        description: '',
        price: '',
        category: '',
        condition: 'good',
        location: ''
      })
      setSelectedImage(null)
      setImagePreview('')
      
      console.log('🔄 상품 목록 새로고침 시작...')
      await loadProducts()
      console.log('✅ 상품 목록 새로고침 완료')
    } catch (error) {
      console.error('❌ 상품 업로드 에러:', error)
      console.error('❌ 에러 타입:', typeof error)
      console.error('❌ 에러 메시지:', error instanceof Error ? error.message : error)
      console.error('❌ 에러 스택:', error instanceof Error ? error.stack : 'No stack trace')
      alert(`상품 업로드에 실패했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      console.log('🔄 업로드 상태 초기화')
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">중고 스포츠 마켓</h1>
              <p className="text-gray-600 mt-2">AI 자동 태깅과 GPS 기반 위치 필터링</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition flex items-center gap-2"
            >
              <span>📦</span>
              상품 등록
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">상품을 불러오는 중...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📦</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">등록된 상품이 없습니다</h3>
            <p className="text-gray-600">첫 번째 상품을 등록해보세요!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="card hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate(`/market/product/${product.id}`)}
              >
                <div className="aspect-square bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-primary-600">₩{product.price.toLocaleString()}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                    {product.condition}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{product.location}</span>
                  <span>{product.userName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 상품 업로드 모달 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">상품 등록</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 이미지 업로드 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상품 이미지 *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {imagePreview ? (
                      <div>
                        <img
                          src={imagePreview}
                          alt="상품 미리보기"
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null)
                            setImagePreview('')
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          이미지 제거
                        </button>
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl mb-4 block">📷</span>
                        <p className="text-gray-600 mb-2">이미지를 클릭하거나 드래그하여 업로드하세요</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="bg-primary-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-primary-600 transition"
                        >
                          이미지 선택
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* 상품 정보 */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상품명 *
                    </label>
                    <input
                      type="text"
                      value={productData.title}
                      onChange={(e) => setProductData({...productData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="상품명을 입력하세요"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리 *
                    </label>
                    <select
                      value={productData.category}
                      onChange={(e) => setProductData({...productData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">카테고리 선택</option>
                      <option value="football">축구</option>
                      <option value="basketball">농구</option>
                      <option value="baseball">야구</option>
                      <option value="tennis">테니스</option>
                      <option value="golf">골프</option>
                      <option value="fitness">피트니스</option>
                      <option value="running">러닝</option>
                      <option value="swimming">수영</option>
                      <option value="other">기타</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      가격 *
                    </label>
                    <input
                      type="number"
                      value={productData.price}
                      onChange={(e) => setProductData({...productData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="가격을 입력하세요"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상태 *
                    </label>
                    <select
                      value={productData.condition}
                      onChange={(e) => setProductData({...productData, condition: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="new">새상품</option>
                      <option value="like-new">거의 새상품</option>
                      <option value="good">좋음</option>
                      <option value="fair">보통</option>
                      <option value="poor">나쁨</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    위치
                  </label>
                  <input
                    type="text"
                    value={productData.location}
                    onChange={(e) => setProductData({...productData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="거래 희망 지역 (예: 서울 강남구)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상품 설명 *
                  </label>
                  <textarea
                    value={productData.description}
                    onChange={(e) => setProductData({...productData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={4}
                    placeholder="상품에 대한 자세한 설명을 입력하세요"
                    required
                  />
                </div>

                {/* 버튼 */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
                  >
                    {uploading ? '업로드 중...' : '상품 등록'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Market 