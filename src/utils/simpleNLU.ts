// 매우 단순한 NLU 모듈
import { normalizeEmailInput, isValidEmail } from './emailNormalizer'

export interface SimpleIntent {
  type: 'REGISTER' | 'LOGIN' | 'EMAIL' | 'PASSWORD' | 'HELP' | 'UNKNOWN'
  confidence: number
}

export interface SimpleEntity {
  type: 'EMAIL' | 'PASSWORD' | 'NUMBER'
  value: string
}

export class SimpleNLU {
  // 의도 분석 (매우 단순)
  analyzeIntent(text: string): SimpleIntent {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('가입') || lowerText.includes('회원가입') || lowerText.includes('등록')) {
      return { type: 'REGISTER', confidence: 0.9 }
    }
    
    if (lowerText.includes('로그인') || lowerText.includes('입장') || lowerText.includes('로그인')) {
      return { type: 'LOGIN', confidence: 0.9 }
    }
    
    if (lowerText.includes('이메일') || lowerText.includes('메일')) {
      return { type: 'EMAIL', confidence: 0.8 }
    }
    
    if (lowerText.includes('비밀번호') || lowerText.includes('패스워드')) {
      return { type: 'PASSWORD', confidence: 0.8 }
    }
    
    if (lowerText.includes('도움') || lowerText.includes('help') || lowerText.includes('어떻게')) {
      return { type: 'HELP', confidence: 0.7 }
    }
    
    return { type: 'UNKNOWN', confidence: 0.1 }
  }
  
  // 엔티티 추출 (매우 단순)
  extractEntities(text: string): SimpleEntity[] {
    const entities: SimpleEntity[] = []
    
    console.log('🔍 엔티티 추출 시작:', text)
    
    // 이메일 추출 (정규화 적용)
    const normalizedText = normalizeEmailInput(text)
    const emailMatch = normalizedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
    if (emailMatch && isValidEmail(emailMatch[0])) {
      entities.push({ type: 'EMAIL', value: emailMatch[0].toLowerCase() })
      console.log('✅ 이메일 추출됨:', emailMatch[0])
    }
    
    // 비밀번호 추출 (숫자 6자리 이상)
    const passwordMatch = text.match(/\d{6,}/)
    if (passwordMatch) {
      entities.push({ type: 'PASSWORD', value: passwordMatch[0] })
      console.log('✅ 비밀번호 추출됨:', passwordMatch[0])
    }
    
    console.log('🔍 엔티티 추출 완료:', entities)
    return entities
  }
  
  // 입력 검증 (매우 단순)
  validateInput(intent: SimpleIntent, entities: SimpleEntity[]): { isValid: boolean; message: string } {
    if (intent.type === 'REGISTER' || intent.type === 'LOGIN') {
      const hasEmail = entities.some(e => e.type === 'EMAIL')
      const hasPassword = entities.some(e => e.type === 'PASSWORD')
      
      if (!hasEmail && !hasPassword) {
        return { isValid: false, message: '이메일과 비밀번호를 말씀해주세요.' }
      }
      
      if (!hasEmail) {
        return { isValid: false, message: '이메일을 말씀해주세요.' }
      }
      
      if (!hasPassword) {
        return { isValid: false, message: '비밀번호를 말씀해주세요.' }
      }
    }
    
    return { isValid: true, message: '입력이 완료되었습니다.' }
  }
}

export const simpleNLU = new SimpleNLU() 