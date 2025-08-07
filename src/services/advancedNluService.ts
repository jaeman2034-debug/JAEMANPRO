// Advanced NLU Service with OpenAI GPT
export interface AdvancedNLUConfig {
  openaiApiKey: string
  model: string
  maxTokens: number
  temperature: number
}

export interface GPTResponse {
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

// OpenAI GPT 호출
export const callOpenAIGPT = async (
  prompt: string,
  config: AdvancedNLUConfig
): Promise<string> => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.openaiApiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: `당신은 한국어 음성 회원가입을 위한 NLU 전문가입니다. 
          사용자의 음성을 분석하여 의도와 엔티티를 정확히 추출해주세요.
          
          응답 형식:
          {
            "intent": "의도 (start_signup, input_name, input_email, input_password, input_phone, confirm, cancel, retry)",
            "confidence": 0.0-1.0,
            "entities": [
              {
                "type": "name|email|password|phone",
                "value": "추출된 값",
                "confidence": 0.0-1.0
              }
            ],
            "suggestions": ["제안사항1", "제안사항2"]
          }`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API 오류: ${response.status}`)
  }

  const result = await response.json()
  return result.choices[0].message.content
}

// 고급 의도 분류
export const classifyIntentAdvanced = async (
  text: string,
  currentStage: string,
  config: AdvancedNLUConfig
): Promise<GPTResponse> => {
  const prompt = `
현재 단계: ${currentStage}
사용자 음성: "${text}"

이 음성을 분석하여 의도와 엔티티를 추출해주세요.
JSON 형식으로 응답해주세요.
`

  try {
    const gptResponse = await callOpenAIGPT(prompt, config)
    
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
    return fallbackIntentClassification(text, currentStage)
  }
}

// 폴백 규칙 기반 분석
const fallbackIntentClassification = (
  text: string,
  currentStage: string
): GPTResponse => {
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

// 고급 NLU 서비스 클래스
export class AdvancedNLUService {
  private config: AdvancedNLUConfig

  constructor(config: AdvancedNLUConfig) {
    this.config = config
  }

  async processVoiceInput(
    text: string,
    currentStage: string
  ): Promise<GPTResponse> {
    try {
      return await classifyIntentAdvanced(text, currentStage, this.config)
    } catch (error) {
      console.error('고급 NLU 처리 실패:', error)
      return fallbackIntentClassification(text, currentStage)
    }
  }

  // 스마트 재시도 로직
  generateRetrySuggestion(
    currentStage: string,
    retryCount: number,
    // lastError: string
  ): string {
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
}

// 기본 고급 NLU 서비스 인스턴스
export const advancedNluService = new AdvancedNLUService({
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  model: 'gpt-3.5-turbo',
  maxTokens: 150,
  temperature: 0.3
}) 