import { useState, useRef, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { 
  normalizeSpeechToText, 
  validateName, 
  validateEmail, 
  validatePassword, 
  validatePhone 
} from "../utils/voiceUtils";

// 단계별 타입 정의
type Step = 'name' | 'email' | 'password' | 'phone' | 'agreement' | 'complete';

// 사용자 정보 타입
interface UserInfo {
  name: string;
  email: string;
  password: string;
  phone: string;
  agreement: boolean;
}

export default function VoiceSignup() {
  // 상태 관리
  const [currentStep, setCurrentStep] = useState<Step>('name');
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    password: '',
    phone: '',
    agreement: false
  });
  const [message, setMessage] = useState("회원가입을 시작합니다. 이름을 말씀해주세요.");
  const [isListening, setIsListening] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [showKeyboardInput, setShowKeyboardInput] = useState(false);
  
  // 음성 인식 관련
  const recognitionRef = useRef<any | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 단계별 안내 메시지
  const stepMessages = {
    name: "이름을 말씀해주세요.",
    email: "이메일 주소를 말씀해주세요. (예: 제이맨 골뱅이 지메일 닷 컴)",
    password: "비밀번호를 말씀해주세요. 최소 6자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.",
    phone: "전화번호를 말씀해주세요. (예: 공일공 하이픈 일이삼사 하이픈 오육칠팔)",
    agreement: "개인정보 수집 및 이용에 동의하시면 '동의'라고 말씀해주세요.",
    complete: "회원가입이 완료되었습니다!"
  };

  // 음성 안내(TTS)
  const speak = (text: string) => {
    if (window.speechSynthesis) {
      // 이전 음성 중지
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => {
        console.log('🔊 TTS 시작:', text);
      };
      
      utterance.onend = () => {
        console.log('🔊 TTS 완료');
        // TTS 완료 후 음성 인식 시작
        setTimeout(() => {
          if (currentStep !== 'complete') {
            startRecognition();
          }
        }, 1000);
      };
      
      synthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 음성 인식 시작
  const startRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      console.log('🎤 음성 인식 시작');
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      console.log('🎤 인식된 음성:', transcript);
      handleSpeechResult(transcript);
    };

    recognition.onerror = (event: any) => {
      console.log('❌ 음성 인식 오류:', event.error);
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        speak("음성이 인식되지 않았습니다. 다시 말씀해주세요.");
      } else {
        speak("음성 인식에 오류가 발생했습니다. 다시 시도해주세요.");
      }
      
      setErrorCount(prev => prev + 1);
    };

    recognition.onend = () => {
      console.log('🎤 음성 인식 종료');
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // 음성 인식 결과 처리
  const handleSpeechResult = (text: string) => {
    setErrorCount(0); // 성공 시 오류 카운트 리셋
    
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
    const validation = validateName(text);
    if (validation.isValid) {
      setUserInfo(prev => ({ ...prev, name: text.trim() }));
      setCurrentStep('email');
      const nextMessage = stepMessages.email;
      setMessage(nextMessage);
      speak(nextMessage);
    } else {
      speak(validation.message);
      setMessage(validation.message);
    }
  };

  // 이메일 입력 처리
  const handleEmailInput = (text: string) => {
    const normalizedEmail = normalizeSpeechToText(text);
    console.log('📧 변환된 이메일:', normalizedEmail);
    
    const validation = validateEmail(normalizedEmail);
    if (validation.isValid) {
      setUserInfo(prev => ({ ...prev, email: normalizedEmail }));
      setCurrentStep('password');
      const nextMessage = stepMessages.password;
      setMessage(nextMessage);
      speak(nextMessage);
    } else {
      speak(validation.message);
      setMessage(validation.message);
    }
  };

  // 비밀번호 입력 처리
  const handlePasswordInput = (text: string) => {
    const convertedText = normalizeSpeechToText(text);
    console.log('🔐 변환된 비밀번호:', convertedText);
    
    const validation = validatePassword(convertedText);
    if (validation.isValid) {
      setUserInfo(prev => ({ ...prev, password: convertedText }));
      setCurrentStep('phone');
      const nextMessage = stepMessages.phone;
      setMessage(nextMessage);
      speak(nextMessage);
    } else {
      speak(validation.message);
      setMessage(validation.message);
    }
  };

  // 전화번호 입력 처리
  const handlePhoneInput = (text: string) => {
    const convertedText = normalizeSpeechToText(text);
    console.log('📞 변환된 전화번호:', convertedText);
    
    const validation = validatePhone(convertedText);
    if (validation.isValid) {
      setUserInfo(prev => ({ ...prev, phone: convertedText }));
      setCurrentStep('agreement');
      const nextMessage = stepMessages.agreement;
      setMessage(nextMessage);
      speak(nextMessage);
    } else {
      speak(validation.message);
      setMessage(validation.message);
    }
  };

  // 동의 입력 처리
  const handleAgreementInput = (text: string) => {
    const normalizedText = text.toLowerCase().trim();
    
    if (normalizedText.includes('동의') || normalizedText.includes('네') || normalizedText.includes('예')) {
      setUserInfo(prev => ({ ...prev, agreement: true }));
      handleSignup();
    } else {
      speak("동의하지 않으시면 회원가입을 진행할 수 없습니다. '동의'라고 말씀해주세요.");
      setMessage("동의하지 않으시면 회원가입을 진행할 수 없습니다. '동의'라고 말씀해주세요.");
    }
  };

  // Firebase 회원가입
  const handleSignup = async () => {
    try {
      speak("회원가입을 진행하고 있습니다. 잠시만 기다려주세요.");
      setMessage("회원가입을 진행하고 있습니다...");
      
      await createUserWithEmailAndPassword(auth, userInfo.email, userInfo.password);
      
      setCurrentStep('complete');
      const completeMessage = `회원가입이 완료되었습니다! 환영합니다, ${userInfo.name}님.`;
      setMessage(completeMessage);
      speak(completeMessage);
      
      console.log('✅ 회원가입 성공:', userInfo);
    } catch (error: any) {
      console.error('❌ 회원가입 실패:', error);
      
      let errorMessage = "회원가입에 실패했습니다.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "이미 사용 중인 이메일입니다.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "비밀번호가 너무 약합니다.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "올바르지 않은 이메일 형식입니다.";
      }
      
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
                placeholder="이름을 입력하세요"
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
                placeholder="이메일을 입력하세요"
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
                placeholder="비밀번호를 입력하세요"
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
                placeholder="010-1234-5678"
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
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md font-semibold"
            >
              회원가입
            </button>
          </form>
          
          <button
            onClick={() => setShowKeyboardInput(false)}
            className="w-full mt-4 text-blue-500 hover:text-blue-600 text-sm"
          >
            음성 입력으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      <h1 className="text-2xl font-bold mb-4">🎤 음성 기반 회원가입</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
        {/* 진행 상태 표시 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">진행률</span>
            <span className="text-sm font-medium text-blue-600">
              {Object.keys(stepMessages).indexOf(currentStep) + 1} / 6
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${((Object.keys(stepMessages).indexOf(currentStep) + 1) / 6) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        {/* 현재 단계 표시 */}
        <div className="mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {currentStep === 'name' && '이름 입력'}
            {currentStep === 'email' && '이메일 입력'}
            {currentStep === 'password' && '비밀번호 입력'}
            {currentStep === 'phone' && '전화번호 입력'}
            {currentStep === 'agreement' && '동의 확인'}
            {currentStep === 'complete' && '완료'}
          </span>
        </div>

        {/* 안내 메시지 */}
        <p className="mb-6 text-gray-700">{message}</p>

        {/* 음성 인식 상태 */}
        <div className="mb-6">
          {isListening ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-500 font-medium">음성 인식 중...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-gray-500">대기 중</span>
            </div>
          )}
        </div>

        {/* 수동 음성 인식 시작 버튼 */}
        {!isListening && currentStep !== 'complete' && (
          <button
            onClick={startRecognition}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg w-full font-semibold mb-4"
          >
            🎙️ 음성 입력 시작
          </button>
        )}

        {/* 키보드 입력 전환 버튼 */}
        {currentStep !== 'complete' && (
          <button
            onClick={switchToKeyboard}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ⌨️ 키보드로 입력하기
          </button>
        )}

        {/* 입력된 정보 표시 */}
        {currentStep !== 'complete' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
            <h3 className="font-medium text-gray-700 mb-2">입력된 정보</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>이름: {userInfo.name || '-'}</p>
              <p>이메일: {userInfo.email || '-'}</p>
              <p>비밀번호: {userInfo.password ? '●●●●●●' : '-'}</p>
              <p>전화번호: {userInfo.phone || '-'}</p>
              <p>동의: {userInfo.agreement ? '✅' : '❌'}</p>
            </div>
          </div>
        )}

        {/* 완료 메시지 */}
        {currentStep === 'complete' && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="text-green-800">
              <p className="font-medium">🎉 회원가입이 완료되었습니다!</p>
              <p className="text-sm mt-1">환영합니다, {userInfo.name}님!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 