// 매우 단순한 대화 관리자
import { simpleNLU } from './simpleNLU'

export interface ConversationState {
  step: 'WELCOME' | 'ASK_EMAIL' | 'ASK_PASSWORD' | 'CONFIRM' | 'COMPLETE'
  email: string
  password: string
  message: string
}

export class SimpleConversation {
  private state: ConversationState = {
    step: 'WELCOME',
    email: '',
    password: '',
    message: '안녕하세요! 회원가입을 도와드리겠습니다.'
  }
  
  // 대화 시작
  start(): string {
    this.state = {
      step: 'WELCOME',
      email: '',
      password: '',
      message: '안녕하세요! 회원가입을 도와드리겠습니다. 이메일을 말씀해주세요.'
    }
    return this.state.message
  }
  
  // 사용자 입력 처리
  processInput(input: string): { message: string; shouldContinue: boolean; data?: { email: string; password: string } } {
    const intent = simpleNLU.analyzeIntent(input)
    const entities = simpleNLU.extractEntities(input)
    
    console.log('🎯 단순 NLU 분석:', { intent, entities })
    
    // 이메일 추출
    const emailEntity = entities.find(e => e.type === 'EMAIL')
    if (emailEntity && !this.state.email) {
      this.state.email = emailEntity.value
      this.state.step = 'ASK_PASSWORD'
      return {
        message: `이메일 ${emailEntity.value}이 입력되었습니다. 비밀번호를 말씀해주세요.`,
        shouldContinue: true
      }
    }
    
    // 비밀번호 추출
    const passwordEntity = entities.find(e => e.type === 'PASSWORD')
    if (passwordEntity && !this.state.password) {
      this.state.password = passwordEntity.value
      this.state.step = 'CONFIRM'
      return {
        message: `비밀번호가 입력되었습니다. 회원가입을 진행하시겠습니까?`,
        shouldContinue: true
      }
    }
    
    // 회원가입 명령
    if (intent.type === 'REGISTER' && this.state.email && this.state.password) {
      this.state.step = 'COMPLETE'
      return {
        message: '회원가입이 완료되었습니다!',
        shouldContinue: false,
        data: { email: this.state.email, password: this.state.password }
      }
    }
    
    // 도움 요청
    if (intent.type === 'HELP') {
      return {
        message: '이메일과 비밀번호를 순서대로 말씀해주세요. 예: "test@example.com" 그리고 "123456"',
        shouldContinue: true
      }
    }
    
    // 기본 응답
    if (this.state.step === 'WELCOME' || this.state.step === 'ASK_EMAIL') {
      return {
        message: '이메일을 말씀해주세요.',
        shouldContinue: true
      }
    }
    
    if (this.state.step === 'ASK_PASSWORD') {
      return {
        message: '비밀번호를 말씀해주세요.',
        shouldContinue: true
      }
    }
    
    return {
      message: '다시 말씀해주세요.',
      shouldContinue: true
    }
  }
  
  // 상태 초기화
  reset(): void {
    this.state = {
      step: 'WELCOME',
      email: '',
      password: '',
      message: '안녕하세요! 회원가입을 도와드리겠습니다.'
    }
  }
  
  // 현재 상태 반환
  getState(): ConversationState {
    return { ...this.state }
  }
}

export const simpleConversation = new SimpleConversation() 