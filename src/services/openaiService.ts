// OpenAI API 호출을 위한 서비스 함수
// 브라우저에서 직접 호출하는 대신 서버를 통해 호출하는 것을 권장합니다.

// interface OpenAIResponse {
//   success: boolean
//   data?: any
//   error?: string
// }

// 로컬 테스트용 더미 응답
const DUMMY_RESPONSES = {
  "이름은 이재만이고, 이메일은 jaeman2034@gmail.com, 비밀번호는 12345678, 전화번호는 01012345678입니다": {
    intent: "회원가입",
    entities: {
      name: "이재만",
      email: "jaeman2034@gmail.com",
      password: "12345678",
      phone: "01012345678"
    }
  },
  "이름은 김철수이고, 이메일은 kim@test.com, 비밀번호는 password123, 전화번호는 01098765432입니다": {
    intent: "회원가입",
    entities: {
      name: "김철수",
      email: "kim@test.com",
      password: "password123",
      phone: "01098765432"
    }
  }
}

// 더미 분석 함수 (실제 OpenAI API 대신 사용)
export const analyzeSignupIntentDummy = async (text: string): Promise<any> => {
  console.log('🤖 더미 분석 시작:', text)
  
  // 실제 API 호출을 시뮬레이션하기 위한 지연
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 텍스트에서 키워드 매칭
  const normalizedText = text.toLowerCase()
  
  // 이름 추출
  const nameMatch = text.match(/(?:이름은|이름이)\s*([가-힣]+)/)
  const name = nameMatch ? nameMatch[1] : ""
  
  // 이메일 추출
  const emailMatch = text.match(/(?:이메일은|이메일이)\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
  const email = emailMatch ? emailMatch[1] : ""
  
  // 비밀번호 추출
  const passwordMatch = text.match(/(?:비밀번호는|비밀번호가)\s*([a-zA-Z0-9]+)/)
  const password = passwordMatch ? passwordMatch[1] : ""
  
  // 전화번호 추출
  const phoneMatch = text.match(/(?:전화번호는|전화번호가)\s*(\d{11})/)
  const phone = phoneMatch ? phoneMatch[1] : ""
  
  // 미리 정의된 응답이 있으면 사용
  for (const [key, value] of Object.entries(DUMMY_RESPONSES)) {
    if (normalizedText.includes(key.toLowerCase())) {
      console.log('🤖 미리 정의된 응답 사용:', value)
      return value
    }
  }
  
  // 동적 분석 결과
  const result = {
    intent: "회원가입",
    entities: {
      name,
      email,
      password,
      phone
    }
  }
  
  console.log('🤖 동적 분석 결과:', result)
  return result
}

// 실제 OpenAI API 호출 (서버를 통해 호출하는 것을 권장)
export const analyzeSignupIntentReal = async (text: string): Promise<any> => {
  try {
    // 실제 구현에서는 서버 API를 호출해야 합니다
    // 예: fetch('/api/analyze-signup', { method: 'POST', body: JSON.stringify({ text }) })
    
    console.warn('⚠️ 실제 OpenAI API 호출은 서버를 통해 구현해야 합니다.')
    return await analyzeSignupIntentDummy(text)
  } catch (error) {
    console.error('OpenAI API 호출 실패:', error)
    return await analyzeSignupIntentDummy(text)
  }
}

// 기본 export (더미 함수 사용)
export const analyzeSignupIntent = analyzeSignupIntentDummy 