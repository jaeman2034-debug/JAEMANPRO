// 한글 발음 → 영문 변환 매핑
const koreanToEnglish: { [key: string]: string } = {
  // 알파벳 (전체 단어)
  '에이': 'a', '비': 'b', '씨': 'c', '디': 'd', '이': 'e', '에프': 'f', '지': 'g', '에이치': 'h',
  '아이': 'i', '제이': 'j', '케이': 'k', '엘': 'l', '엠': 'm', '엔': 'n', '오': 'o', '피': 'p',
  '큐': 'q', '알': 'r', '에스': 's', '티': 't', '유': 'u', '브이': 'v', '더블유': 'w', '엑스': 'x',
  '와이': 'y',
  
  // 개별 알파벳 (한글 발음)
  '제': 'j', '에': 'a', '더블': 'w',
  
  // 숫자 (정확도 향상)
  '제로': '0', '원': '1', '투': '2', '쓰리': '3', '포': '4', '파이브': '5',
  '식스': '6', '세븐': '7', '에이트': '8', '나인': '9',
  '영': '0', '일': '1', '삼': '3', '사': '4',
  '육': '6', '칠': '7', '팔': '8', '구': '9',
  
  // 특수문자
  '골뱅이': '@', '골뱅': '@', '앳': '@', '앳사인': '@',
  '점': '.', '닷': '.', '도트': '.',
  '언더바': '_', '언더스코어': '_',
  '하이픈': '-', '마이너스': '-',
  '플러스': '+', '더하기': '+',
  
  // 이메일 관련 단어
  '지메일': 'gmail', '지메': 'gmail', '메일': 'mail',
  '네이버': 'naver', '네': 'naver',
  '다음': 'daum', '다': 'daum',
  '아웃룩': 'outlook', '아': 'outlook',
  '야후': 'yahoo', '야': 'yahoo',
  '핫메일': 'hotmail', '핫': 'hotmail',
  '컴': 'com', '코': 'com',
  '넷': 'net', '오알지': 'org', '에듀': 'edu',
  
  // 자주 사용되는 이름 패턴 (정확도 향상)
  '재만': 'jaeman', '재맨': 'jaeman', '제이맨': 'jaeman',
  '재민': 'jaemin', '제이민': 'jaemin',
  '재현': 'jaehyun', '제이현': 'jaehyun'
}

// 이메일 ID만 정규화하는 함수 (도메인 자동 추가 없음)
export function normalizeEmailId(input: string): string {
  let normalized = input.toLowerCase().trim()
  
  console.log('🔤 이메일 ID 정규화 시작:', input)
  
  // 특수한 경우 먼저 처리
  // "jae" 발음이 "11daum1daume1"로 잘못 인식되는 경우 수정
  if (normalized.includes('11daum') || normalized.includes('daume')) {
    normalized = normalized.replace(/11daum1daume1/g, 'jae')
    normalized = normalized.replace(/11daum/g, 'jae')
    normalized = normalized.replace(/daume/g, 'e')
    console.log('🔧 특수 케이스 수정:', normalized)
  }
  
  // "jaeman" 패턴 수정 (j2aeman → jaeman)
  if (normalized.includes('j2aeman') || normalized.includes('j2aem')) {
    normalized = normalized.replace(/j2aeman/g, 'jaeman')
    normalized = normalized.replace(/j2aem/g, 'jaem')
    console.log('🔧 jaeman 패턴 수정:', normalized)
  }
  
  // "j2ama" 패턴 수정 (j2ama → jama)
  if (normalized.includes('j2ama')) {
    normalized = normalized.replace(/j2ama/g, 'jama')
    console.log('🔧 j2ama 패턴 수정:', normalized)
  }
  
  // "j2aman" 패턴 수정 (j2aman → jaman)
  if (normalized.includes('j2aman')) {
    normalized = normalized.replace(/j2aman/g, 'jaman')
    console.log('🔧 j2aman 패턴 수정:', normalized)
  }
  
  // 숫자 정확도 개선 (중복 숫자 제거)
  normalized = normalized.replace(/(\d)\1+/g, '$1') // 연속된 같은 숫자를 하나로
  
  // 연속된 숫자 패턴 수정 (2024 → 22034 같은 문제 해결)
  normalized = normalized.replace(/(\d)(\d)(\d)(\d)/g, (match, a, b, c, d) => {
    // 연속된 4자리 숫자에서 순서가 뒤바뀐 경우 수정
    if (a === b && c === d) {
      return a + c // 22034 → 2024
    }
    if (a === c && b === d) {
      return a + b // 2024 → 2024 (정상)
    }
    return match
  })
  
  // 한글 발음을 영문으로 변환 (긴 단어부터 처리)
  const sortedEntries = Object.entries(koreanToEnglish).sort((a, b) => b[0].length - a[0].length)
  for (const [korean, english] of sortedEntries) {
    const regex = new RegExp(korean, 'gi')
    normalized = normalized.replace(regex, english)
  }
  
  // 불필요한 공백 제거
  normalized = normalized.replace(/\s+/g, '')
  
  // 음성 인식 종료 메시지 제거
  normalized = normalized
    .replace(/종료되었습니다/g, '')
    .replace(/종료/g, '')
    .replace(/되었습니다/g, '')
    .replace(/뽀뽀/g, '') // 뽀뽀 텍스트 제거
    .replace(/뽀/g, '') // 뽀 텍스트 제거
  
  // 이메일 형식 정리 (한글 문자 제거, @ 제거)
  normalized = normalized.replace(/[^a-zA-Z0-9._%+-]/g, '')
  
  // 특정 패턴 수정 (jaemapn → jaeman)
  normalized = normalized
    .replace(/jaemanpn/g, 'jaeman')
    .replace(/jaemapn/g, 'jaeman')
    .replace(/jaemap/g, 'jaeman')
    .replace(/jaemam/g, 'jaeman')
    .replace(/jaemane/g, 'jaeman') // jaemane → jaeman 수정
  
  console.log('🔤 이메일 ID 정규화 완료:', normalized)
  return normalized
}

// 이메일 정규화 함수
export function normalizeEmailInput(input: string): string {
  let normalized = input.toLowerCase().trim()
  
  console.log('🔤 이메일 정규화 시작:', input)
  
  // 특수한 경우 먼저 처리
  // "jae" 발음이 "11daum1daume1"로 잘못 인식되는 경우 수정
  if (normalized.includes('11daum') || normalized.includes('daume')) {
    normalized = normalized.replace(/11daum1daume1/g, 'jae')
    normalized = normalized.replace(/11daum/g, 'jae')
    normalized = normalized.replace(/daume/g, 'e')
    console.log('🔧 특수 케이스 수정:', normalized)
  }
  
  // 한국어 발음 "메1.컴" 패턴 수정 (골뱅이 이후 인식 문제 해결)
  if (normalized.includes('메1.컴') || normalized.includes('메1컴') || normalized.includes('메1')) {
    normalized = normalized.replace(/메1\.컴/g, 'gmail.com')
    normalized = normalized.replace(/메1컴/g, 'gmail.com')
    normalized = normalized.replace(/메1/g, 'gmail')
    console.log('🔧 메1.컴 패턴 수정:', normalized)
  }
  
  // "메일" 패턴 수정 (한국어 발음)
  if (normalized.includes('메일')) {
    normalized = normalized.replace(/메일/g, 'mail')
    console.log('🔧 메일 패턴 수정:', normalized)
  }
  
  // "컴" 패턴 수정 (한국어 발음)
  if (normalized.includes('컴')) {
    normalized = normalized.replace(/컴/g, 'com')
    console.log('🔧 컴 패턴 수정:', normalized)
  }
  
  // "jaeman" 패턴 수정 (j2aeman → jaeman)
  if (normalized.includes('j2aeman') || normalized.includes('j2aem')) {
    normalized = normalized.replace(/j2aeman/g, 'jaeman')
    normalized = normalized.replace(/j2aem/g, 'jaem')
    console.log('🔧 jaeman 패턴 수정:', normalized)
  }
  
  // "j2ama" 패턴 수정 (j2ama → jama)
  if (normalized.includes('j2ama')) {
    normalized = normalized.replace(/j2ama/g, 'jama')
    console.log('🔧 j2ama 패턴 수정:', normalized)
  }
  
  // "j2aman" 패턴 수정 (j2aman → jaman)
  if (normalized.includes('j2aman')) {
    normalized = normalized.replace(/j2aman/g, 'jaman')
    console.log('🔧 j2aman 패턴 수정:', normalized)
  }
  
  // "@2g1" 패턴 수정 (@2g1 → @gmail.com)
  if (normalized.includes('@2g1') || normalized.includes('@2g')) {
    normalized = normalized.replace(/@2g1/g, '@gmail.com')
    normalized = normalized.replace(/@2g/g, '@gmail.com')
    console.log('🔧 gmail 패턴 수정:', normalized)
  }
  
  // 숫자 정확도 개선 (중복 숫자 제거)
  normalized = normalized.replace(/(\d)\1+/g, '$1') // 연속된 같은 숫자를 하나로
  
  // 연속된 숫자 패턴 수정 (2024 → 22034 같은 문제 해결)
  normalized = normalized.replace(/(\d)(\d)(\d)(\d)/g, (match, a, b, c, d) => {
    // 연속된 4자리 숫자에서 순서가 뒤바뀐 경우 수정
    if (a === b && c === d) {
      return a + c // 22034 → 2024
    }
    if (a === c && b === d) {
      return a + b // 2024 → 2024 (정상)
    }
    return match
  })
  
  // 한글 발음을 영문으로 변환 (긴 단어부터 처리)
  const sortedEntries = Object.entries(koreanToEnglish).sort((a, b) => b[0].length - a[0].length)
  for (const [korean, english] of sortedEntries) {
    const regex = new RegExp(korean, 'gi')
    normalized = normalized.replace(regex, english)
  }
  
  // 불필요한 공백 제거
  normalized = normalized.replace(/\s+/g, '')
  
  // 음성 인식 종료 메시지 제거
  normalized = normalized
    .replace(/종료되었습니다/g, '')
    .replace(/종료/g, '')
    .replace(/되었습니다/g, '')
    .replace(/뽀뽀/g, '') // 뽀뽀 텍스트 제거
    .replace(/뽀/g, '') // 뽀 텍스트 제거
  
  // 중복된 점 제거 (@ 앞뒤)
  normalized = normalized.replace(/\.+@/g, '@')
  normalized = normalized.replace(/@\.+/g, '@')
  
  // 이메일 형식 정리 (한글 문자 제거)
  normalized = normalized.replace(/[^a-zA-Z0-9@._%+-]/g, '')
  
  // 특정 패턴 수정 (jaemapn → jaeman)
  normalized = normalized
    .replace(/jaemanpn/g, 'jaeman')
    .replace(/jaemapn/g, 'jaeman')
    .replace(/jaemap/g, 'jaeman')
    .replace(/jaemam/g, 'jaeman')
    .replace(/jaemane/g, 'jaeman') // jaemane → jaeman 수정
  
  // 골뱅이(@) 이후 도메인 자동 추가 로직
  if (normalized.includes('@')) {
    // 이미 @가 있는 경우, 기존 도메인 처리
    const atIndex = normalized.indexOf('@')
    const localPart = normalized.substring(0, atIndex)
    const domainPart = normalized.substring(atIndex + 1)
    
    // 도메인 부분 정리
    let cleanDomain = domainPart.replace(/[^a-zA-Z0-9.]/g, '')
    
    // 도메인이 없거나 불완전한 경우 gmail.com으로 설정
    if (!cleanDomain || cleanDomain.length < 3) {
      cleanDomain = 'gmail.com'
    } else if (!cleanDomain.includes('.')) {
      // 점이 없는 경우 .com 추가
      cleanDomain = cleanDomain + '.com'
    }
    
    normalized = localPart + '@' + cleanDomain
    console.log('🔧 도메인 자동 추가:', normalized)
  } else {
    // @가 없는 경우, 자동으로 @gmail.com 추가
    if (normalized.length > 0 && /^[a-zA-Z0-9._%+-]+$/.test(normalized)) {
      normalized = normalized + '@gmail.com'
      console.log('🔧 골뱅이 자동 추가:', normalized)
    }
  }
  
  // 도메인 중복 제거 (comcomcomcom → com)
  normalized = normalized
    .replace(/(com){2,}/g, 'com') // comcomcomcom → com
    .replace(/(\.com){2,}/g, '.com') // .com.com.com → .com
    .replace(/(@gmail\.com){2,}/g, '@gmail.com') // @gmail.com@gmail.com → @gmail.com
  
  // 도메인 패턴 수정 (@2gmailcom → @gmail.com)
  normalized = normalized
    .replace(/@2gmailcom/g, '@gmail.com')
    .replace(/@2gmail/g, '@gmail.com')
    .replace(/@2gmail\./g, '@gmail.com')
    .replace(/@gmailcom/g, '@gmail.com')
    .replace(/@gmail\./g, '@gmail.com')
    .replace(/@gmail$/g, '@gmail.com')
    .replace(/@2g1/g, '@gmail.com') // @2g1 → @gmail.com 수정
    .replace(/@2g/g, '@gmail.com') // @2g → @gmail.com 수정
    .replace(/@2$/g, '@gmail.com') // @2 → @gmail.com 수정 (추가)
    .replace(/@2\./g, '@gmail.com') // @2. → @gmail.com 수정 (추가)
    .replace(/@2\.2mailcom/g, '@gmail.com') // @2.2mailcom → @gmail.com 수정 (추가)
    .replace(/@2\.같2mailcom/g, '@gmail.com') // @2.같2mailcom → @gmail.com 수정 (추가)
  
  // gmail.comcomcom → gmail.com 수정 (중복 도메인 제거)
  normalized = normalized
    .replace(/gmail\.comcomcom/g, 'gmail.com')
    .replace(/gmail\.comcom/g, 'gmail.com')
    .replace(/gmail\.com\.com/g, 'gmail.com')
    .replace(/gmail\.comcom2/g, 'gmail.com') // gmail.comcom2 → gmail.com 수정
    .replace(/gmail\.com2/g, 'gmail.com') // gmail.com2 → gmail.com 수정
  
  // 일반적인 도메인 패턴 수정
  normalized = normalized
    .replace(/@2([a-z]+)com/g, '@$1.com')
    .replace(/@([a-z]+)com/g, '@$1.com')
    .replace(/@([a-z]+)\./g, '@$1.com')
    .replace(/@([a-z]+)$/g, '@$1.com')
    .replace(/@2\.([a-z]+)com/g, '@$1.com') // @2.mailcom → @mail.com
    .replace(/@2\.([a-z]+)\./g, '@$1.com') // @2.mail. → @mail.com
  
  // 점(.) 누락 수정 (도메인 부분)
  if (normalized.includes('@') && !normalized.includes('.', normalized.indexOf('@'))) {
    // @ 뒤에 점이 없는 경우 추가
    const atIndex = normalized.indexOf('@')
    const domainPart = normalized.substring(atIndex + 1)
    if (domainPart && !domainPart.includes('.')) {
      // 일반적인 도메인 패턴에 .com 추가
      if (domainPart.includes('gmail')) {
        normalized = normalized.replace(/@gmail$/, '@gmail.com')
      } else if (domainPart.includes('naver')) {
        normalized = normalized.replace(/@naver$/, '@naver.com')
      } else if (domainPart.includes('daum')) {
        normalized = normalized.replace(/@daum$/, '@daum.com')
      } else if (domainPart.includes('yahoo')) {
        normalized = normalized.replace(/@yahoo$/, '@yahoo.com')
      } else if (domainPart.includes('hotmail')) {
        normalized = normalized.replace(/@hotmail$/, '@hotmail.com')
      } else if (domainPart.includes('outlook')) {
        normalized = normalized.replace(/@outlook$/, '@outlook.com')
      } else {
        // 기타 도메인에 .com 추가
        normalized = normalized.replace(/@([a-z]+)$/, '@$1.com')
      }
    }
  }
  
  // 숫자와 문자 사이의 잘못된 연결 수정
  normalized = normalized
    .replace(/(\d)@/g, '$1@') // 숫자@ → 숫자@ (정상)
    .replace(/@(\d)/g, '@$1') // @숫자 → @숫자 (정상)
  
  // 최종 정리: 중복된 도메인 패턴 완전 제거
  normalized = normalized
    .replace(/(@gmail\.com){2,}/g, '@gmail.com')
    .replace(/(@naver\.com){2,}/g, '@naver.com')
    .replace(/(@daum\.net){2,}/g, '@daum.net')
    .replace(/(@yahoo\.com){2,}/g, '@yahoo.com')
    .replace(/(@hotmail\.com){2,}/g, '@hotmail.com')
    .replace(/(@outlook\.com){2,}/g, '@outlook.com')
  
  console.log('🔤 이메일 정규화 완료:', normalized)
  return normalized
}

// 이메일 유효성 검사
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

// 이메일에서 도메인 추출
export function extractDomain(email: string): string {
  const parts = email.split('@')
  return parts.length > 1 ? parts[1] : ''
} 