// GPT 기반 NLU 분석 함수
export interface NLUAnalysisResult {
  intent: string
  confidence: number
  entities: Entity[]
  suggestions: string[]
  rawText: string
}

export interface Entity {
  type: 'name' | 'email' | 'password' | 'phone' | 'number'
  value: string
  confidence: number
  start: number
  end: number
}

export interface NLUConfig {
  openaiApiKey: string
  model: string
  maxTokens: number
  temperature: number
}

// import { openai } from '../libs/openai' // 브라우저 보안 문제로 주석 처리

// OpenAI GPT 호출 (브라우저 보안 문제로 더미 함수 사용)
const callOpenAIGPT = async (
  prompt: string,
  // config: NLUConfig
): Promise<string> => {
  // 브라우저 보안 문제로 실제 OpenAI API 대신 더미 응답 사용
  console.warn('⚠️ 브라우저 보안 문제로 더미 응답을 사용합니다.')
  
  // 간단한 키워드 매칭으로 더미 응답 생성
  const text = prompt.toLowerCase()
  
  if (text.includes('이름') && text.includes('이메일') && text.includes('비밀번호')) {
    return JSON.stringify({
      intent: "회원가입",
      confidence: 0.9,
      entities: [
        { type: "name", value: "이재만", confidence: 0.9 },
        { type: "email", value: "jaeman2034@gmail.com", confidence: 0.9 },
        { type: "password", value: "12345678", confidence: 0.9 },
        { type: "phone", value: "01012345678", confidence: 0.9 }
      ],
      suggestions: ["회원가입을 진행합니다"]
    })
  }
  
  return JSON.stringify({
    intent: "unknown",
    confidence: 0.1,
    entities: [],
    suggestions: ["다시 말씀해주세요"]
  })
}

// 메인 NLU 분석 함수
export const analyzeSpeechText = async (
  text: string,
  currentStage: string,
  // config: NLUConfig
): Promise<NLUAnalysisResult> => {
  const prompt = `
현재 단계: ${currentStage}
사용자 음성: "${text}"

이 음성을 분석하여 의도와 엔티티를 추출해주세요.
JSON 형식으로 응답해주세요.
`

  try {
    const gptResponse = await callOpenAIGPT(prompt)
    
    // JSON 파싱
    const parsed = JSON.parse(gptResponse)
    
    return {
      intent: parsed.intent || 'unknown',
      confidence: parsed.confidence || 0.5,
      entities: parsed.entities || [],
      suggestions: parsed.suggestions || [],
      rawText: text
    }
  } catch (error) {
    console.error('GPT 분석 실패:', error)
    
    // 폴백: 기본 규칙 기반 분석
    return fallbackAnalysis(text, currentStage)
  }
}

// 폴백 규칙 기반 분석
const fallbackAnalysis = (
  text: string,
  currentStage: string
): NLUAnalysisResult => {
  const normalizedText = text.toLowerCase().trim()
  
  // 단계별 의도 분류
  switch (currentStage) {
    case 'name':
      if (normalizedText.includes('이름') || normalizedText.includes('이름이')) {
        return {
          intent: 'input_name',
          confidence: 0.8,
          entities: extractNameEntities(text),
          suggestions: ['이름을 다시 말씀해주세요'],
          rawText: text
        }
      }
      break
      
    case 'email':
      if (normalizedText.includes('이메일') || normalizedText.includes('메일')) {
        return {
          intent: 'input_email',
          confidence: 0.8,
          entities: extractEmailEntities(text),
          suggestions: ['이메일을 다시 말씀해주세요'],
          rawText: text
        }
      }
      break
      
    case 'password':
      if (normalizedText.includes('비밀번호') || normalizedText.includes('패스워드')) {
        return {
          intent: 'input_password',
          confidence: 0.8,
          entities: extractPasswordEntities(text),
          suggestions: ['비밀번호를 다시 말씀해주세요'],
          rawText: text
        }
      }
      break
      
    case 'phone':
      if (normalizedText.includes('전화번호') || normalizedText.includes('폰번호')) {
        return {
          intent: 'input_phone',
          confidence: 0.8,
          entities: extractPhoneEntities(text),
          suggestions: ['전화번호를 다시 말씀해주세요'],
          rawText: text
        }
      }
      break
      
    case 'confirm':
      if (normalizedText.includes('네') || normalizedText.includes('확인')) {
        return {
          intent: 'confirm',
          confidence: 0.9,
          entities: [],
          suggestions: ['회원가입을 진행합니다'],
          rawText: text
        }
      } else if (normalizedText.includes('아니오') || normalizedText.includes('취소')) {
        return {
          intent: 'cancel',
          confidence: 0.9,
          entities: [],
          suggestions: ['회원가입이 취소되었습니다'],
          rawText: text
        }
      }
      break
  }
  
  return {
    intent: 'unknown',
    confidence: 0.1,
    entities: [],
    suggestions: ['다시 말씀해주세요'],
    rawText: text
  }
}

// 엔티티 추출 함수들
const extractNameEntities = (text: string): Entity[] => {
  const entities: Entity[] = []
  
  // 이름 매핑
  const nameMapping: Record<string, string> = {
    '이재만': '이재만',
    '김철수': '김철수',
    '박영희': '박영희',
    'e제10': '이재만',
    'e재10': '이재만'
  }
  
  for (const [mappedName, correctName] of Object.entries(nameMapping)) {
    if (text.toLowerCase().includes(mappedName.toLowerCase())) {
      entities.push({
        type: 'name',
        value: correctName,
        confidence: 0.9,
        start: text.indexOf(mappedName),
        end: text.indexOf(mappedName) + mappedName.length
      })
      break
    }
  }
  
  return entities
}

const extractEmailEntities = (text: string): Entity[] => {
  const entities: Entity[] = []
  
  // 이메일 정규화
  const normalizedText = text
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/골뱅이/g, '@')
    .replace(/닷/g, '.')
    .replace(/점/g, '.')
    .replace(/at/g, '@')
    .replace(/dot/g, '.')
    .replace(/컴/g, 'com')
    .replace(/넷/g, 'net')
    .replace(/오알지/g, 'org')
  
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  const matches = normalizedText.match(emailRegex)
  
  if (matches) {
    matches.forEach(match => {
      entities.push({
        type: 'email',
        value: match,
        confidence: 0.9,
        start: text.indexOf(match),
        end: text.indexOf(match) + match.length
      })
    })
  }
  
  return entities
}

const extractPasswordEntities = (text: string): Entity[] => {
  const entities: Entity[] = []
  
  const normalizedText = text
    .replace(/\s+/g, '')
    .replace(/숫자/g, '')
    .replace(/자/g, '')
  
  if (normalizedText.length >= 6) {
    entities.push({
      type: 'password',
      value: normalizedText,
      confidence: 0.8,
      start: 0,
      end: text.length
    })
  }
  
  return entities
}

const extractPhoneEntities = (text: string): Entity[] => {
  const entities: Entity[] = []
  
  const numbers = text.replace(/[^\d]/g, '')
  
  if (numbers.length === 11 && numbers.startsWith('010')) {
    entities.push({
      type: 'phone',
      value: numbers,
      confidence: 0.9,
      start: 0,
      end: text.length
    })
  }
  
  return entities
}

// 스마트 재시도 제안 생성
export const generateRetrySuggestion = (
  currentStage: string,
  retryCount: number,
  // lastError: string
): string => {
  const suggestions = {
    name: [
      '이름을 명확하게 말씀해주세요',
      '한글 이름을 천천히 말씀해주세요',
      '이름을 다시 한 번 말씀해주세요'
    ],
    email: [
      '이메일을 천천히 말씀해주세요',
      '골뱅이와 점을 명확히 말씀해주세요',
      '이메일 주소를 다시 말씀해주세요'
    ],
    password: [
      '비밀번호를 천천히 말씀해주세요',
      '숫자와 문자를 명확히 말씀해주세요',
      '비밀번호를 다시 말씀해주세요'
    ],
    phone: [
      '전화번호를 천천히 말씀해주세요',
      '숫자만 말씀해주세요',
      '전화번호를 다시 말씀해주세요'
    ]
  }

  const stageSuggestions = suggestions[currentStage as keyof typeof suggestions] || ['다시 말씀해주세요']
  const suggestionIndex = Math.min(retryCount, stageSuggestions.length - 1)
  
  return stageSuggestions[suggestionIndex]
}

// 기본 NLU 설정
export const defaultNLUConfig: NLUConfig = {
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  model: 'gpt-4o',
  maxTokens: 150,
  temperature: 0.2
}

// 간결한 회원가입 분석 함수 (더미 함수 사용)
export async function analyzeSignupIntent(text: string) {
  console.log('🤖 회원가입 분석 시작:', text)
  
  // 실제 API 호출을 시뮬레이션하기 위한 지연
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 텍스트에서 키워드 매칭
  // const normalizedText = text.toLowerCase().trim()
  
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
  
  const result = {
    intent: "회원가입",
    entities: {
      name,
      email,
      password,
      phone
    }
  }
  
  console.log('🤖 분석 결과:', result)
  return result
} 