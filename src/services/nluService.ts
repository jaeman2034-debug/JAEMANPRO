// NLU Service for Voice-based Signup
export interface NLUConfig {
  provider: 'openai' | 'google' | 'azure'
  apiKey: string
  maxRetryCount: number
  speechTimeout: number
}

export interface IntentResult {
  intent: string
  confidence: number
  entities: Entity[]
  rawText: string
}

export interface Entity {
  type: 'name' | 'email' | 'password' | 'phone' | 'number'
  value: string
  confidence: number
  start: number
  end: number
}

export interface VoiceCommand {
  command: string
  action: string
  parameters: Record<string, any>
}

// 음성 명령어 매핑
const VOICE_COMMANDS: Record<string, VoiceCommand> = {
  '회원가입': { command: '회원가입', action: 'start_signup', parameters: {} },
  '이름': { command: '이름', action: 'input_name', parameters: {} },
  '이메일': { command: '이메일', action: 'input_email', parameters: {} },
  '비밀번호': { command: '비밀번호', action: 'input_password', parameters: {} },
  '전화번호': { command: '전화번호', action: 'input_phone', parameters: {} },
  '확인': { command: '확인', action: 'confirm', parameters: {} },
  '다시': { command: '다시', action: 'retry', parameters: {} },
  '취소': { command: '취소', action: 'cancel', parameters: {} }
}

// 이름 정규화 매핑
const NAME_MAPPING: Record<string, string> = {
  '이재만': '이재만',
  '이제만': '이재만',  // 음성 인식 오류 보정
  '이민수': '이민수',
  'e제10': '이재만',
  'e재10': '이재만',
  'jaeman': '이재만',  // 영문 이름도 매핑
  '재만': '이재만'
}

// 이메일 정규화
export const normalizeEmail = (text: string): string => {
  return text
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
}

// 전화번호 정규화
export const normalizePhone = (text: string): string => {
  const numbers = text.replace(/[^\d]/g, '')
  if (numbers.length === 11 && numbers.startsWith('010')) {
    return numbers
  }
  return numbers
}

// 비밀번호 정규화
export const normalizePassword = (text: string): string => {
  return text
    .replace(/\s+/g, '')
    .replace(/숫자/g, '')
    .replace(/자/g, '')
}

// OpenAI Whisper API 호출
export const transcribeWithWhisper = async (audioBlob: Blob): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다.')
  }

  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.webm')
  formData.append('model', 'whisper-1')
  formData.append('language', 'ko')

  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Whisper API 오류: ${response.status}`)
    }

    const result = await response.json()
    return result.text
  } catch (error) {
    console.error('Whisper API 호출 실패:', error)
    throw error
  }
}

// 의도 분류
export const classifyIntent = (text: string): IntentResult => {
  const normalizedText = text.toLowerCase().trim()
  
  // 명령어 매칭
  for (const [command, voiceCommand] of Object.entries(VOICE_COMMANDS)) {
    if (normalizedText.includes(command)) {
      return {
        intent: voiceCommand.action,
        confidence: 0.9,
        entities: [],
        rawText: text
      }
    }
  }

  // 기본 의도 분류
  if (normalizedText.includes('이름') || normalizedText.includes('이름이')) {
    return {
      intent: 'input_name',
      confidence: 0.8,
      entities: extractEntities(text, 'name'),
      rawText: text
    }
  }

  if (normalizedText.includes('이메일') || normalizedText.includes('메일')) {
    return {
      intent: 'input_email',
      confidence: 0.8,
      entities: extractEntities(text, 'email'),
      rawText: text
    }
  }

  if (normalizedText.includes('비밀번호') || normalizedText.includes('패스워드')) {
    return {
      intent: 'input_password',
      confidence: 0.8,
      entities: extractEntities(text, 'password'),
      rawText: text
    }
  }

  if (normalizedText.includes('전화번호') || normalizedText.includes('폰번호')) {
    return {
      intent: 'input_phone',
      confidence: 0.8,
      entities: extractEntities(text, 'phone'),
      rawText: text
    }
  }

  return {
    intent: 'unknown',
    confidence: 0.1,
    entities: [],
    rawText: text
  }
}

// 자유 발화 처리를 위한 고급 의도 분류
export const classifyIntentAdvanced = (text: string): IntentResult => {
  // const normalizedText = text.toLowerCase().trim()
  
  // 복합 의도 감지 (여러 정보가 포함된 경우)
  const hasMultipleInfo = detectMultipleInfo(text)
  if (hasMultipleInfo) {
    return {
      intent: 'multi_input',
      confidence: 0.9,
      entities: extractEntitiesAdvanced(text),
      rawText: text
    }
  }

  // 기존 의도 분류 로직
  return classifyIntent(text)
}

// 복합 정보 감지
const detectMultipleInfo = (text: string): boolean => {
  const normalizedText = text.toLowerCase().trim()
  
  // 여러 엔티티 타입이 동시에 존재하는지 확인
  const entityTypes = ['name', 'email', 'phone', 'password']
  let foundTypes = 0
  
  entityTypes.forEach(type => {
    if (hasEntityType(normalizedText, type)) {
      foundTypes++
    }
  })
  
  return foundTypes >= 2
}

// 특정 엔티티 타입 존재 여부 확인
const hasEntityType = (text: string, type: string): boolean => {
  switch (type) {
    case 'name':
      return Object.keys(NAME_MAPPING).some(name => 
        text.includes(name.toLowerCase())
      )
    case 'email':
      return /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)
    case 'phone':
      return /(\d{3})[-.\s]?(\d{3,4})[-.\s]?(\d{4})/.test(text)
    case 'password':
      return /\d{6,}/.test(text) || text.includes('비밀번호') || text.includes('패스워드')
    default:
      return false
  }
}

// 고급 엔티티 추출 (자유 발화용)
export const extractEntitiesAdvanced = (text: string): Entity[] => {
  const entities: Entity[] = []
  // const normalizedText = text.toLowerCase().trim()

  // 모든 엔티티 타입을 동시에 추출
  const entityTypes = ['name', 'email', 'phone', 'password']
  
  entityTypes.forEach(type => {
    const extracted = extractEntitiesByType(text, type)
    entities.push(...extracted)
  })

  return entities
}

// 타입별 엔티티 추출
const extractEntitiesByType = (text: string, type: string): Entity[] => {
  const entities: Entity[] = []
  const normalizedText = text.toLowerCase().trim()

  switch (type) {
    case 'name':
      // 이름 추출 개선
      for (const [mappedName, correctName] of Object.entries(NAME_MAPPING)) {
        if (normalizedText.includes(mappedName.toLowerCase())) {
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
      
      // 일반적인 이름 패턴 추출 (이름은 ~입니다)
      const namePattern = /(?:이름은|성함은|제 이름은)\s*([가-힣]{2,4})/i
      const nameMatch = text.match(namePattern)
      if (nameMatch && !entities.length) {
        entities.push({
          type: 'name',
          value: nameMatch[1],
          confidence: 0.8,
          start: nameMatch.index!,
          end: nameMatch.index! + nameMatch[0].length
        })
      }
      break

    case 'email':
      // 이메일 추출 개선
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
      const emailMatches = text.match(emailRegex)
      if (emailMatches) {
        emailMatches.forEach(match => {
          entities.push({
            type: 'email',
            value: normalizeEmail(match),
            confidence: 0.9,
            start: text.indexOf(match),
            end: text.indexOf(match) + match.length
          })
        })
      }
      
      // 음성 변환 이메일 처리 (골뱅이, 닷 등)
      const voiceEmailPattern = /(?:이메일은|메일은)\s*([a-zA-Z0-9._%+-]+)\s*(?:골뱅이|@)\s*([a-zA-Z0-9.-]+)\s*(?:닷|점|\.)\s*([a-zA-Z]{2,})/i
      const voiceEmailMatch = text.match(voiceEmailPattern)
      if (voiceEmailMatch && !entities.length) {
        const email = `${voiceEmailMatch[1]}@${voiceEmailMatch[2]}.${voiceEmailMatch[3]}`
        entities.push({
          type: 'email',
          value: email,
          confidence: 0.8,
          start: voiceEmailMatch.index!,
          end: voiceEmailMatch.index! + voiceEmailMatch[0].length
        })
      }
      
      // 분리된 이메일 조각들을 조합 (예: jaeman 2034 @ gmail.com)
      const emailParts = text.match(/([a-zA-Z0-9._%+-]+)\s+(\d+)\s*@\s*([a-zA-Z0-9.-]+)\s*\.\s*([a-zA-Z]{2,})/i)
      if (emailParts && !entities.length) {
        const email = `${emailParts[1]}${emailParts[2]}@${emailParts[3]}.${emailParts[4]}`
        entities.push({
          type: 'email',
          value: email,
          confidence: 0.7,
          start: emailParts.index!,
          end: emailParts.index! + emailParts[0].length
        })
      }
      
      // 더 유연한 이메일 패턴 (공백 포함)
      const flexibleEmailPattern = /([a-zA-Z0-9._%+-]+)\s*@\s*([a-zA-Z0-9.-]+)\s*\.\s*([a-zA-Z]{2,})/i
      const flexibleEmailMatch = text.match(flexibleEmailPattern)
      if (flexibleEmailMatch && !entities.length) {
        const email = `${flexibleEmailMatch[1]}@${flexibleEmailMatch[2]}.${flexibleEmailMatch[3]}`
        entities.push({
          type: 'email',
          value: email,
          confidence: 0.6,
          start: flexibleEmailMatch.index!,
          end: flexibleEmailMatch.index! + flexibleEmailMatch[0].length
        })
      }
      break

    case 'phone':
      // 전화번호 추출 개선
      const phoneRegex = /(\d{3})[-.\s]?(\d{3,4})[-.\s]?(\d{4})/g
      const phoneMatches = text.match(phoneRegex)
      if (phoneMatches) {
        phoneMatches.forEach(match => {
          entities.push({
            type: 'phone',
            value: normalizePhone(match),
            confidence: 0.9,
            start: text.indexOf(match),
            end: text.indexOf(match) + match.length
          })
        })
      }
      
      // 음성 변환 전화번호 처리 (한국어 숫자 포함)
      const voicePhonePattern = /(?:전화번호는|폰번호는|연락처는)\s*(\d{3})[-\s]?(\d{3,4})[-\s]?(\d{4})/i
      const voicePhoneMatch = text.match(voicePhonePattern)
      if (voicePhoneMatch && !entities.length) {
        const phone = `${voicePhoneMatch[1]}-${voicePhoneMatch[2]}-${voicePhoneMatch[3]}`
        entities.push({
          type: 'phone',
          value: phone,
          confidence: 0.8,
          start: voicePhoneMatch.index!,
          end: voicePhoneMatch.index! + voicePhoneMatch[0].length
        })
      }
      
      // 한국어 숫자 변환 후 전화번호 추출
      const koreanNumberMap: Record<string, string> = {
        '영': '0', '일': '1', '이': '2', '삼': '3', '사': '4', '오': '5',
        '육': '6', '칠': '7', '팔': '8', '구': '9', '공': '0'
      }
      
      let processedText = text
      for (const [korean, number] of Object.entries(koreanNumberMap)) {
        processedText = processedText.replace(new RegExp(korean, 'g'), number)
      }
      
      // 변환된 텍스트에서 전화번호 추출
      const convertedPhoneRegex = /(\d{3})[-.\s]?(\d{3,4})[-.\s]?(\d{4})/g
      const convertedPhoneMatches = processedText.match(convertedPhoneRegex)
      if (convertedPhoneMatches && !entities.length) {
        convertedPhoneMatches.forEach(match => {
          entities.push({
            type: 'phone',
            value: normalizePhone(match),
            confidence: 0.7,
            start: text.indexOf(match),
            end: text.indexOf(match) + match.length
          })
        })
      }
      
      // 부분 전화번호 조합 (예: 0105689 공팔영영)
      const partialPhonePattern = /(\d{7})\s*(공|영|일|이|삼|사|오|육|칠|팔|구)(공|영|일|이|삼|사|오|육|칠|팔|구)(공|영|일|이|삼|사|오|육|칠|팔|구)(공|영|일|이|삼|사|오|육|칠|팔|구)/i
      const partialPhoneMatch = text.match(partialPhonePattern)
      if (partialPhoneMatch && !entities.length) {
        const firstPart = partialPhoneMatch[1]
        const secondPart = partialPhoneMatch.slice(2, 6).map(korean => koreanNumberMap[korean]).join('')
        const fullPhone = firstPart + secondPart
        
        if (fullPhone.length === 11 && fullPhone.startsWith('010')) {
          entities.push({
            type: 'phone',
            value: fullPhone,
            confidence: 0.6,
            start: partialPhoneMatch.index!,
            end: partialPhoneMatch.index! + partialPhoneMatch[0].length
          })
        }
      }
      break

    case 'password':
      // 비밀번호 추출 개선
      const passwordPattern = /(?:비밀번호는|패스워드는)\s*(\d{6,})/i
      const passwordMatch = text.match(passwordPattern)
      if (passwordMatch) {
        entities.push({
          type: 'password',
          value: passwordMatch[1],
          confidence: 0.8,
          start: passwordMatch.index!,
          end: passwordMatch.index! + passwordMatch[0].length
        })
      }
      
      // 숫자만 있는 비밀번호
      const numberPasswordPattern = /\b(\d{6,})\b/
      const numberPasswordMatch = text.match(numberPasswordPattern)
      if (numberPasswordMatch && !entities.length) {
        entities.push({
          type: 'password',
          value: numberPasswordMatch[1],
          confidence: 0.7,
          start: numberPasswordMatch.index!,
          end: numberPasswordMatch.index! + numberPasswordMatch[0].length
        })
      }
      break
  }

  return entities
}

// 엔티티 추출 (기존 함수 유지)
export const extractEntities = (text: string, expectedType?: string): Entity[] => {
  const entities: Entity[] = []
  const normalizedText = text.toLowerCase().trim()

  // 이름 추출
  if (!expectedType || expectedType === 'name') {
    for (const [mappedName, correctName] of Object.entries(NAME_MAPPING)) {
      if (normalizedText.includes(mappedName.toLowerCase())) {
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
  }

  // 이메일 추출
  if (!expectedType || expectedType === 'email') {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const matches = text.match(emailRegex)
    if (matches) {
      matches.forEach(match => {
        entities.push({
          type: 'email',
          value: normalizeEmail(match),
          confidence: 0.9,
          start: text.indexOf(match),
          end: text.indexOf(match) + match.length
        })
      })
    }
  }

  // 전화번호 추출
  if (!expectedType || expectedType === 'phone') {
    const phoneRegex = /(\d{3})[-.\s]?(\d{3,4})[-.\s]?(\d{4})/g
    const matches = text.match(phoneRegex)
    if (matches) {
      matches.forEach(match => {
        entities.push({
          type: 'phone',
          value: normalizePhone(match),
          confidence: 0.9,
          start: text.indexOf(match),
          end: text.indexOf(match) + match.length
        })
      })
    }
    
    // 한국어 숫자 변환 후 전화번호 추출
    const koreanNumberMap: Record<string, string> = {
      '영': '0', '일': '1', '이': '2', '삼': '3', '사': '4', '오': '5',
      '육': '6', '칠': '7', '팔': '8', '구': '9', '공': '0'
    }
    
    let processedText = text
    for (const [korean, number] of Object.entries(koreanNumberMap)) {
      processedText = processedText.replace(new RegExp(korean, 'g'), number)
    }
    
    // 변환된 텍스트에서 전화번호 추출
    const convertedPhoneRegex = /(\d{3})[-.\s]?(\d{3,4})[-.\s]?(\d{4})/g
    const convertedPhoneMatches = processedText.match(convertedPhoneRegex)
    if (convertedPhoneMatches && !matches) {
      convertedPhoneMatches.forEach(match => {
        entities.push({
          type: 'phone',
          value: normalizePhone(match),
          confidence: 0.7,
          start: text.indexOf(match),
          end: text.indexOf(match) + match.length
        })
      })
    }
  }

  return entities
}

// NLU 메인 서비스
export class NLUService {
  // private config: NLUConfig

  constructor(_config: NLUConfig) {
    // this.config = config
  }

  async processVoiceInput(audioBlob?: Blob, text?: string): Promise<IntentResult> {
    try {
      let inputText = text

      // 오디오가 있으면 Whisper로 변환
      if (audioBlob && !text) {
        inputText = await transcribeWithWhisper(audioBlob)
      }

      if (!inputText) {
        throw new Error('음성 입력이 없습니다.')
      }

      // 의도 분류 및 엔티티 추출
      const intentResult = classifyIntent(inputText)
      
      return intentResult
    } catch (error) {
      console.error('NLU 처리 실패:', error)
      throw error
    }
  }

  // 음성 명령어 처리
  processVoiceCommand(text: string): VoiceCommand | null {
    const normalizedText = text.toLowerCase().trim()
    
    for (const [command, voiceCommand] of Object.entries(VOICE_COMMANDS)) {
      if (normalizedText.includes(command)) {
        return voiceCommand
      }
    }
    
    return null
  }
}

// 기본 NLU 서비스 인스턴스
export const nluService = new NLUService({
  provider: 'openai',
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  maxRetryCount: 3,
  speechTimeout: 10000
}) 