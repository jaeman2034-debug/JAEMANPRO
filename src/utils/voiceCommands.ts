export interface VoiceCommand {
  command: string
  action: () => void
  description: string
}

export const processVoiceCommand = (
  transcript: string,
  commands: VoiceCommand[]
): { matched: boolean; action?: () => void; message?: string; data?: any } => {
  const lowerTranscript = transcript.toLowerCase().trim()
  
  // 이메일 패턴 추출
  const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
  const emailMatch = transcript.match(emailPattern)
  const extractedEmail = emailMatch ? emailMatch[1] : null
  
  // 비밀번호 패턴 추출 (숫자 6자리)
  const passwordPattern = /(\d{6})/
  const passwordMatch = transcript.match(passwordPattern)
  const extractedPassword = passwordMatch ? passwordMatch[1] : null
  
  console.log('음성 명령 처리:', {
    transcript,
    extractedEmail,
    extractedPassword
  })
  
  for (const cmd of commands) {
    const commandKeywords = cmd.command.toLowerCase().split(' ')
    const transcriptWords = lowerTranscript.split(' ')
    
    // 명령어 키워드가 모두 포함되어 있는지 확인
    const isMatch = commandKeywords.every(keyword => 
      transcriptWords.some(word => word.includes(keyword))
    )
    
    if (isMatch) {
      return {
        matched: true,
        action: cmd.action,
        message: `${cmd.description}을 실행합니다.`,
        data: {
          email: extractedEmail,
          password: extractedPassword
        }
      }
    }
  }
  
  return { matched: false }
}

// 로그인 관련 음성 명령
export const getLoginVoiceCommands = (
  onEmailInput: (email: string) => void,
  onPasswordInput: (password: string) => void,
  onSubmit: () => void
): VoiceCommand[] => [
  {
    command: '이메일',
    action: () => {
      // 이메일 추출 로직은 processVoiceCommand에서 처리
      onEmailInput('')
    },
    description: '이메일 입력'
  },
  {
    command: '비밀번호',
    action: () => {
      // 비밀번호 추출 로직은 processVoiceCommand에서 처리
      onPasswordInput('')
    },
    description: '비밀번호 입력'
  },
  {
    command: '로그인',
    action: onSubmit,
    description: '로그인 실행'
  },
  {
    command: '시작',
    action: onSubmit,
    description: '로그인 실행'
  }
]

// 회원가입 관련 음성 명령
export const getRegisterVoiceCommands = (
  onEmailInput: (email: string) => void,
  onPasswordInput: (password: string) => void,
  onConfirmPasswordInput: (password: string) => void,
  onSubmit: () => void
): VoiceCommand[] => [
  {
    command: '이메일',
    action: () => {
      onEmailInput('')
    },
    description: '이메일 입력'
  },
  {
    command: '비밀번호',
    action: () => {
      onPasswordInput('')
    },
    description: '비밀번호 입력'
  },
  {
    command: '확인',
    action: () => {
      onConfirmPasswordInput('')
    },
    description: '비밀번호 확인 입력'
  },
  {
    command: '가입',
    action: onSubmit,
    description: '회원가입 실행'
  },
  {
    command: '시작',
    action: onSubmit,
    description: '회원가입 실행'
  }
] 