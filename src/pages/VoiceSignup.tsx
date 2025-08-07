import React, { useState, useEffect, useRef } from 'react'
// Firebase 의존성 제거
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../firebase";

type Step = 'name' | 'email' | 'password' | 'phone' | 'agreement' | 'complete';

interface UserInfo {
  name: string;
  email: string;
  password: string;
  phone: string;
  agreement: boolean;
}

export default function VoiceSignup() {
  const [currentStep, setCurrentStep] = useState<Step>('name');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    password: '',
    phone: '',
    agreement: false
  });
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [showKeyboardInput, setShowKeyboardInput] = useState(false);
  const recognitionRef = useRef<any>(null);

  const stepMessages = {
    name: "이름을 말씀해주세요.",
    email: "이메일 주소를 말씀해주세요.",
    password: "비밀번호를 말씀해주세요.",
    phone: "전화번호를 말씀해주세요.",
    agreement: "개인정보 수집 및 이용에 동의하시면 '동의합니다'라고 말씀해주세요."
  };

  // TTS 함수
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.5;
      speechSynthesis.speak(utterance);
    }
  };

  // 음성 인식 시작
  const startRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'ko-KR';

    recognition.onstart = () => {
      setIsListening(true);
      console.log('음성 인식 시작');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('인식된 음성:', transcript);
      handleSpeechResult(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('음성 인식 오류:', event.error);
      setErrorCount(prev => prev + 1);
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        speak("음성이 감지되지 않았습니다. 다시 말씀해주세요.");
      } else {
        speak("음성 인식에 실패했습니다. 다시 시도해주세요.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('음성 인식 종료');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // 음성 결과 처리
  const handleSpeechResult = (text: string) => {
    switch (currentStep) {
      case 'name':
        handleNameInput(text);
        break;
      case 'email':
        handleEmailInput(text);
        break;
      case 'password':
        handlePasswordInput(text);
        break;
      case 'phone':
        handlePhoneInput(text);
        break;
      case 'agreement':
        handleAgreementInput(text);
        break;
    }
  };

  // 이름 입력 처리
  const handleNameInput = (text: string) => {
    const name = text.replace(/[^가-힣a-zA-Z\s]/g, '').trim();
    if (name.length >= 2) {
      setUserInfo(prev => ({ ...prev, name }));
      setCurrentStep('email');
      const nextMessage = stepMessages.email;
      setMessage(nextMessage);
      speak(nextMessage);
    } else {
      speak("이름을 다시 말씀해주세요.");
    }
  };

  // 이메일 입력 처리
  const handleEmailInput = (text: string) => {
    const email = text.toLowerCase().replace(/\s/g, '');
    if (email.includes('@') && email.includes('.')) {
      setUserInfo(prev => ({ ...prev, email }));
      setCurrentStep('password');
      const nextMessage = stepMessages.password;
      setMessage(nextMessage);
      speak(nextMessage);
    } else {
      speak("올바른 이메일 주소를 말씀해주세요.");
    }
  };

  // 비밀번호 입력 처리
  const handlePasswordInput = (text: string) => {
    const password = text.replace(/\s/g, '');
    if (password.length >= 6) {
      setUserInfo(prev => ({ ...prev, password }));
      setCurrentStep('phone');
      const nextMessage = stepMessages.phone;
      setMessage(nextMessage);
      speak(nextMessage);
    } else {
      speak("비밀번호는 6자 이상이어야 합니다. 다시 말씀해주세요.");
    }
  };

  // 전화번호 입력 처리
  const handlePhoneInput = (text: string) => {
    const phone = text.replace(/[^0-9]/g, '');
    if (phone.length >= 10) {
      setUserInfo(prev => ({ ...prev, phone }));
      setCurrentStep('agreement');
      const nextMessage = stepMessages.agreement;
      setMessage(nextMessage);
      speak(nextMessage);
    } else {
      speak("올바른 전화번호를 말씀해주세요.");
    }
  };

  // 동의 처리
  const handleAgreementInput = (text: string) => {
    if (text.includes('동의') || text.includes('네') || text.includes('예')) {
      setUserInfo(prev => ({ ...prev, agreement: true }));
      handleSignup();
    } else {
      speak("개인정보 수집 및 이용에 동의해주세요.");
    }
  };

  // Firebase 회원가입 (더미 함수로 대체)
  const handleSignup = async () => {
    try {
      speak("회원가입을 진행하고 있습니다. 잠시만 기다려주세요.");
      setMessage("회원가입을 진행하고 있습니다...");
      
      // Firebase 대신 더미 처리
      console.log('더미: 회원가입 시도', userInfo);
      
      setCurrentStep('complete');
      const completeMessage = `회원가입이 완료되었습니다! 환영합니다, ${userInfo.name}님.`;
      setMessage(completeMessage);
      speak(completeMessage);
      
      console.log('✅ 회원가입 성공:', userInfo);
    } catch (error: any) {
      console.error('❌ 회원가입 실패:', error);
      
      let errorMessage = "회원가입에 실패했습니다.";
      
      speak(errorMessage);
      setMessage(errorMessage);
      
      // 오류 시 이메일 단계로 돌아가기
      setCurrentStep('email');
      setTimeout(() => {
        const nextMessage = stepMessages.email;
        setMessage(nextMessage);
        speak(nextMessage);
      }, 2000);
    }
  };

  // 키보드 입력으로 전환
  const switchToKeyboard = () => {
    setShowKeyboardInput(true);
    speak("키보드 입력으로 전환합니다.");
  };

  // 키보드 입력 처리
  const handleKeyboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 모든 필드 검증
    const nameValidation = validateName(userInfo.name);
    const emailValidation = validateEmail(userInfo.email);
    const passwordValidation = validatePassword(userInfo.password);
    const phoneValidation = validatePhone(userInfo.phone);
    
    if (!nameValidation.isValid) {
      alert(nameValidation.message);
      return;
    }
    if (!emailValidation.isValid) {
      alert(emailValidation.message);
      return;
    }
    if (!passwordValidation.isValid) {
      alert(passwordValidation.message);
      return;
    }
    if (!phoneValidation.isValid) {
      alert(phoneValidation.message);
      return;
    }
    if (!userInfo.agreement) {
      alert("개인정보 수집 및 이용에 동의해주세요.");
      return;
    }
    
    handleSignup();
  };

  // 오류 횟수 체크 (3회 이상 시 키보드 입력 제안)
  useEffect(() => {
    if (errorCount >= 3) {
      speak("음성 인식이 어려우시면 키보드 입력을 사용해주세요.");
      setMessage("음성 인식이 어려우시면 키보드 입력을 사용해주세요.");
    }
  }, [errorCount]);

  // 컴포넌트 마운트 시 음성 안내 시작
  useEffect(() => {
    speak(stepMessages.name);
  }, []);

  // 키보드 입력 폼
  if (showKeyboardInput) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
        <h1 className="text-2xl font-bold mb-6">⌨️ 키보드 회원가입</h1>
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <form onSubmit={handleKeyboardSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input
                type="text"
                value={userInfo.name}
                onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={userInfo.email}
                onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={userInfo.password}
                onChange={(e) => setUserInfo(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
              <input
                type="tel"
                value={userInfo.phone}
                onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={userInfo.agreement}
                onChange={(e) => setUserInfo(prev => ({ ...prev, agreement: e.target.checked }))}
                className="mr-2"
                required
              />
              <label className="text-sm text-gray-700">
                개인정보 수집 및 이용에 동의합니다
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              회원가입
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 완료 화면
  if (currentStep === 'complete') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-green-800 mb-4">회원가입 완료!</h1>
          <p className="text-lg text-green-600 mb-6">
            환영합니다, {userInfo.name}님!
          </p>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
            <h2 className="text-xl font-semibold mb-4">가입 정보</h2>
            <div className="space-y-2 text-left">
              <p><strong>이름:</strong> {userInfo.name}</p>
              <p><strong>이메일:</strong> {userInfo.email}</p>
              <p><strong>전화번호:</strong> {userInfo.phone}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">🎤 음성 회원가입</h1>
        <p className="text-blue-600">음성으로 간편하게 회원가입하세요</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
          }`}>
            <div className="text-white text-2xl">
              {isListening ? '🎤' : '🎤'}
            </div>
          </div>
          <p className="text-lg font-medium text-gray-800 mb-2">
            {currentStep === 'name' && '이름'}
            {currentStep === 'email' && '이메일'}
            {currentStep === 'password' && '비밀번호'}
            {currentStep === 'phone' && '전화번호'}
            {currentStep === 'agreement' && '개인정보 동의'}
          </p>
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={startRecognition}
            disabled={isListening}
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
              isListening
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isListening ? '음성 인식 중...' : '마이크 버튼을 눌러 말씀하세요'}
          </button>

          <button
            onClick={switchToKeyboard}
            className="w-full py-2 px-4 text-blue-600 hover:text-blue-800 transition-colors"
          >
            키보드로 입력하기
          </button>
        </div>

        {/* 진행 상황 표시 */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>진행 상황</span>
            <span>{Object.keys(stepMessages).indexOf(currentStep) + 1} / {Object.keys(stepMessages).length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((Object.keys(stepMessages).indexOf(currentStep) + 1) / Object.keys(stepMessages).length) * 100}%`
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 검증 함수들
const validateName = (name: string) => {
  if (name.length < 2) {
    return { isValid: false, message: '이름은 2자 이상이어야 합니다.' };
  }
  return { isValid: true, message: '' };
};

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: '올바른 이메일 형식이 아닙니다.' };
  }
  return { isValid: true, message: '' };
};

const validatePassword = (password: string) => {
  if (password.length < 6) {
    return { isValid: false, message: '비밀번호는 6자 이상이어야 합니다.' };
  }
  return { isValid: true, message: '' };
};

const validatePhone = (phone: string) => {
  if (phone.length < 10) {
    return { isValid: false, message: '올바른 전화번호를 입력해주세요.' };
  }
  return { isValid: true, message: '' };
}; 