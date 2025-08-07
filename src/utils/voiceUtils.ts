// 숫자·영문 발음 보정 맵 (중복키 제거, 숫자 우선)
export const phoneticMap: Record<string, string> = {
  // 숫자
  "공": "0", "영": "0", "제로": "0",
  "일": "1", "원": "1", "one": "1", "원즈": "1",
  "이": "2", /* "이": "e", */ "투": "2", "two": "2",
  "삼": "3", "쓰리": "3", "three": "3",
  "사": "4", "포": "4", "four": "4", "포어": "4",
  "오": "5", /* "오": "o", */ "파이브": "5", "five": "5",
  "육": "6", "식스": "6", "six": "6",
  "칠": "7", "세븐": "7", "seven": "7",
  "팔": "8", "에잇": "8", "eight": "8",
  "구": "9", "나인": "9", "nine": "9",

  // 알파벳
  "에이": "a", "비": "b", "씨": "c", "디": "d",
  // "이": "e", // 중복: 숫자 2 우선
  "에프": "f", "지": "g", "에이치": "h",
  "아이": "i", "제이": "j", "케이": "k", "엘": "l",
  "엠": "m", "엔": "n", /* "오": "o", */ "피": "p",
  "큐": "q", "아르": "r", "에스": "s", "티": "t",
  "유": "u", "브이": "v", "더블유": "w", "엑스": "x",
  "와이": "y", "제트": "z",
  "골뱅이": "@", "닷": ".", "점": "."
};

// 발음을 실제 문자로 변환
export const normalizeSpeechToText = (text: string) => {
  let result = text.toLowerCase().trim();
  for (const [key, value] of Object.entries(phoneticMap)) {
    const regex = new RegExp(key, "gi");
    result = result.replace(regex, value);
  }
  return result.replace(/\s+/g, "");
};

// 이메일 정규식
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// 비밀번호 정규식 (최소 6자, 영문/숫자/특수문자 조합)
export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

// 전화번호 정규식 (한국 전화번호 형식)
export const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;

// 이름 검증
export const validateName = (name: string): { isValid: boolean; message: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: "이름을 입력해주세요." };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, message: "이름은 최소 2자 이상이어야 합니다." };
  }
  
  return { isValid: true, message: "이름이 유효합니다." };
}; 

// 이메일 검증
export const validateEmail = (email: string): { isValid: boolean; message: string } => {
  if (!email) {
    return { isValid: false, message: "이메일을 입력해주세요." };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "올바른 이메일 형식이 아닙니다." };
  }
  return { isValid: true, message: "이메일이 유효합니다." };
};

// 비밀번호 검증
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (!password) {
    return { isValid: false, message: "비밀번호를 입력해주세요." };
  }
  if (password.length < 6) {
    return { isValid: false, message: "비밀번호는 최소 6자 이상이어야 합니다." };
  }
  if (!passwordRegex.test(password)) {
    return { 
      isValid: false, 
      message: "비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다." 
    };
  }
  return { isValid: true, message: "비밀번호가 유효합니다." };
};

// 전화번호 검증
export const validatePhone = (phone: string): { isValid: boolean; message: string } => {
  if (!phone) {
    return { isValid: false, message: "전화번호를 입력해주세요." };
  }
  const cleanPhone = phone.replace(/-/g, '');
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, message: "올바른 전화번호 형식이 아닙니다." };
  }
  return { isValid: true, message: "전화번호가 유효합니다." };
}; 