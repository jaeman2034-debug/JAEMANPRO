// 오류 추적 서비스
export interface ErrorData {
  type: string
  message: string
  browser: string
  os: string
  timestamp: number
  userAgent: string
  url: string
  sessionId: string
  retryCount: number
  errorCount: number
}

export interface ErrorStats {
  totalErrors: number
  errorTypes: Record<string, number>
  browserStats: Record<string, number>
  dailyStats: Record<string, number>
  successRate: number
}

class ErrorTrackingService {
  private errors: ErrorData[] = []
  private sessionId: string
  private errorCount: number = 0
  private successCount: number = 0

  constructor() {
    this.sessionId = this.generateSessionId()
    this.loadFromStorage()
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  private getBrowserInfo() {
    const userAgent = navigator.userAgent
    let browser = 'Unknown'
    let os = 'Unknown'

    // 브라우저 감지
    if (userAgent.includes('Chrome')) browser = 'Chrome'
    else if (userAgent.includes('Firefox')) browser = 'Firefox'
    else if (userAgent.includes('Safari')) browser = 'Safari'
    else if (userAgent.includes('Edge')) browser = 'Edge'

    // OS 감지
    if (userAgent.includes('Windows')) os = 'Windows'
    else if (userAgent.includes('Mac')) os = 'macOS'
    else if (userAgent.includes('Linux')) os = 'Linux'
    else if (userAgent.includes('Android')) os = 'Android'
    else if (userAgent.includes('iOS')) os = 'iOS'

    return { browser, os }
  }

  // 오류 기록
  trackError(errorType: string, message: string, retryCount: number = 0) {
    this.errorCount++
    const { browser, os } = this.getBrowserInfo()
    
    const errorData: ErrorData = {
      type: errorType,
      message,
      browser,
      os,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.sessionId,
      retryCount,
      errorCount: this.errorCount
    }

    this.errors.push(errorData)
    this.saveToStorage()
    this.sendToServer(errorData)
    
    console.log('📊 오류 추적:', errorData)
  }

  // 성공 기록
  trackSuccess() {
    this.successCount++
    this.saveToStorage()
  }

  // 성공률 계산
  getSuccessRate(): number {
    const total = this.errorCount + this.successCount
    return total > 0 ? (this.successCount / total) * 100 : 0
  }

  // 오류 통계
  getErrorStats(): ErrorStats {
    const errorTypes: Record<string, number> = {}
    const browserStats: Record<string, number> = {}
    const dailyStats: Record<string, number> = {}

    this.errors.forEach(error => {
      // 오류 타입별 카운트
      errorTypes[error.type] = (errorTypes[error.type] || 0) + 1
      
      // 브라우저별 카운트
      browserStats[error.browser] = (browserStats[error.browser] || 0) + 1
      
      // 일별 카운트
      const date = new Date(error.timestamp).toDateString()
      dailyStats[date] = (dailyStats[date] || 0) + 1
    })

    return {
      totalErrors: this.errors.length,
      errorTypes,
      browserStats,
      dailyStats,
      successRate: this.getSuccessRate()
    }
  }

  // 로컬 스토리지 저장
  private saveToStorage() {
    try {
      localStorage.setItem('errorTracking', JSON.stringify({
        errors: this.errors,
        errorCount: this.errorCount,
        successCount: this.successCount,
        sessionId: this.sessionId
      }))
    } catch (error) {
      console.warn('로컬 스토리지 저장 실패:', error)
    }
  }

  // 로컬 스토리지에서 로드
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('errorTracking')
      if (stored) {
        const data = JSON.parse(stored)
        this.errors = data.errors || []
        this.errorCount = data.errorCount || 0
        this.successCount = data.successCount || 0
        this.sessionId = data.sessionId || this.sessionId
      }
    } catch (error) {
      console.warn('로컬 스토리지 로드 실패:', error)
    }
  }

  // 서버로 전송 (실제 구현 시)
  private sendToServer(errorData: ErrorData) {
    // 실제 배포 시에는 서버 API로 전송
    // 예: Google Analytics, Sentry, 또는 자체 서버
    console.log('🌐 서버로 오류 데이터 전송:', errorData)
    
    // 임시로 localStorage에 저장
    this.saveToStorage()
  }

  // 데이터 내보내기
  exportData(): string {
    return JSON.stringify({
      errors: this.errors,
      stats: this.getErrorStats(),
      sessionId: this.sessionId
    }, null, 2)
  }

  // 데이터 초기화
  clearData() {
    this.errors = []
    this.errorCount = 0
    this.successCount = 0
    this.sessionId = this.generateSessionId()
    localStorage.removeItem('errorTracking')
  }
}

// 싱글톤 인스턴스
export const errorTracking = new ErrorTrackingService()

// 편의 함수들
export const trackSTTError = (errorType: string, message: string, retryCount: number = 0) => {
  errorTracking.trackError(`STT_${errorType}`, message, retryCount)
}

export const trackNLUError = (errorType: string, message: string) => {
  errorTracking.trackError(`NLU_${errorType}`, message)
}

export const trackSuccess = () => {
  errorTracking.trackSuccess()
} 