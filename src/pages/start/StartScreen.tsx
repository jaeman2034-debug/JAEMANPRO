import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// 음성 훅들을 직접 import
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../../hooks/useSpeechSynthesis";

// 도메인 옵션 정의
const DOMAIN_OPTIONS = [
  { id: 'kr', name: '대한민국', flag: '🇰🇷', description: '한국' },
  { id: 'us', name: '미국', flag: '🇺🇸', description: '미국' },
  { id: 'jp', name: '일본', flag: '🇯🇵', description: '일본' },
  { id: 'cn', name: '중국', flag: '🇨🇳', description: '중국' },
  { id: 'uk', name: '영국', flag: '🇬🇧', description: '영국' },
  { id: 'de', name: '독일', flag: '🇩🇪', description: '독일' },
  { id: 'fr', name: '프랑스', flag: '🇫🇷', description: '프랑스' },
  { id: 'ca', name: '캐나다', flag: '🇨🇦', description: '캐나다' },
  { id: 'au', name: '호주', flag: '🇦🇺', description: '호주' },
  { id: 'br', name: '브라질', flag: '🇧🇷', description: '브라질' }
];

export default function StartScreen() {
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState(DOMAIN_OPTIONS[0]);
  const [showDomainSelector, setShowDomainSelector] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceError] = useState(false);

  // 음성 관련 refs
  const speakingRef = useRef(false);
  const processingRef = useRef(false);
  const lastProcessedRef = useRef('');
  // const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 음성 인식 및 합성 훅
  const { transcript, isListening, startListening, stopListening } = useSpeechRecognition();
  const { speak } = useSpeechSynthesis();

  // 음성 모드 토글
  const toggleVoiceMode = useCallback(() => {
    console.log('🎤 음성 모드 토글 버튼 클릭됨');
    console.log('🎤 현재 voiceError:', voiceError);
    console.log('🎤 현재 isVoiceMode:', isVoiceMode);
    
    if (voiceError) {
      alert('음성 기능을 사용할 수 없습니다.');
      return;
    }

    const newVoiceMode = !isVoiceMode;
    console.log('🎤 새로운 음성 모드:', newVoiceMode);
    setIsVoiceMode(newVoiceMode);
    
    if (newVoiceMode) {
      console.log('음성 모드 활성화');
      // 음성 인식 중지 후 TTS 출력
      stopListening();
      speak('음성 모드 활성화. 국가명을 말씀해주세요.');
      speakingRef.current = true;
      setTimeout(() => {
        speakingRef.current = false;
        startListening();
      }, 2500);
    } else {
      console.log('음성 모드 비활성화');
      stopListening();
      speak('음성 모드 비활성화.');
      speakingRef.current = true;
      setTimeout(() => {
        speakingRef.current = false;
      }, 1000);
    }
  }, [isVoiceMode, speak, startListening, stopListening, voiceError]);

  // 도메인 이동 함수
  const navigateToDomain = (domainId: string) => {
    console.log('🚀 도메인 이동 시도:', domainId);
    console.log('🚀 DOMAIN_OPTIONS:', DOMAIN_OPTIONS);
    
    const domainInfo = DOMAIN_OPTIONS.find(option => option.id === domainId);
    console.log('🚀 찾은 도메인 정보:', domainInfo);
    
    try {
      console.log('🚀 navigate 함수 호출 시도');
      navigate('/register', { 
        state: { 
          selectedDomain: domainId,
          domainName: domainInfo?.name || 'Unknown'
        }
      });
      console.log('🚀 navigate 함수 호출 성공');
    } catch (error) {
      console.error('🚀 페이지 이동 오류:', error);
      console.log('🚀 window.location.href로 대체 이동 시도');
      window.location.href = '/register';
    }
  };

  // 음성 인식 결과 처리
  useEffect(() => {
    console.log('🎤 음성 인식 결과 처리 시도:', {
      isVoiceMode,
      transcript,
      processingRef: processingRef.current,
      speakingRef: speakingRef.current,
      voiceError
    });
    
    if (!isVoiceMode || !transcript || processingRef.current || speakingRef.current || voiceError) {
      console.log('🎤 처리 조건 불만족으로 중단');
      return;
    }

    const normalizedTranscript = transcript.toLowerCase().trim();
    
    if (normalizedTranscript === lastProcessedRef.current) {
      return;
    }

    // 시스템 메시지 필터링 (에코 루프 방지)
    const systemMessages = [
      '죄송합니다', '다시 말씀해주세요', '선택되었습니다', 
      '음성 모드가 활성화되었습니다', '음성 모드가 비활성화되었습니다',
      '원하는 국가를 말씀해주세요', '듣는 중', '음성 인식 준비 중',
      '도메인', '처리', '대기', '활성', '비활성', 'yago', 'sports'
    ];
    
    // 시스템 메시지 필터링 강화
    const hasSystemMessage = systemMessages.some(msg => 
      normalizedTranscript.includes(msg.toLowerCase())
    );
    
    if (hasSystemMessage) {
      console.log('시스템 메시지 무시:', normalizedTranscript);
      return;
    }

    // 반복 텍스트 감지
    const words = normalizedTranscript.split(/\s+/);
    const uniqueWords = [...new Set(words)];
    if (words.length > 5 && uniqueWords.length < words.length * 0.5) {
      console.log('반복 텍스트 감지, 무시:', normalizedTranscript);
      return;
    }

    console.log('음성 인식 결과 처리:', normalizedTranscript);
    lastProcessedRef.current = normalizedTranscript;

    // 한국어 숫자 및 발음 매핑
    const numberMapping: { [key: string]: string } = {
      '일': '1', '이': '2', '삼': '3', '사': '4', '오': '5',
      '육': '6', '칠': '7', '팔': '8', '구': '9', '십': '10',
      '영': '0', '하나': '1', '둘': '2', '셋': '3', '넷': '4', '다섯': '5'
    };

    // 특정 발음 매핑 (독일 우선순위)
    const pronunciationMapping: { [key: string]: string } = {
      // 독일 관련 (우선순위 높음)
      '독일': '독일', '독1': '독일', '도이칠란트': '독일', '도이': '독일',
      '저먼': '독일', '게르만': '독일', '독': '독일', '도이치': '독일',
      // 일본 관련
      '일본': '일본', '1본': '일본', '일봉': '일본', '1봉': '일본',
      '니혼': '일본', '니혼고쿠': '일본', '재팬': '일본', '일': '일본'
    };

    // 숫자를 한국어로 변환
    let processedTranscript = normalizedTranscript;
    Object.entries(numberMapping).forEach(([korean, number]) => {
      processedTranscript = processedTranscript.replace(new RegExp(korean, 'g'), number);
    });

    // 발음 매핑 적용
    let finalTranscript = processedTranscript;
    Object.entries(pronunciationMapping).forEach(([input, output]) => {
      if (finalTranscript.includes(input)) {
        finalTranscript = finalTranscript.replace(new RegExp(input, 'g'), output);
      }
    });

    console.log('🎤 원본:', normalizedTranscript);
    console.log('🎤 숫자 변환 후:', processedTranscript);
    console.log('🎤 발음 매핑 후:', finalTranscript);

    // 도메인 매칭 (정확한 매칭 우선)
    let matchedDomain = null;
    
    // 1단계: 정확한 발음 매핑 확인
    for (const [input, output] of Object.entries(pronunciationMapping)) {
      if (normalizedTranscript.includes(input)) {
        matchedDomain = DOMAIN_OPTIONS.find(domain => 
          domain.name.toLowerCase() === output.toLowerCase()
        );
        console.log(`🎤 발음 매핑 매칭: "${input}" → "${output}"`);
        break;
      }
    }
    
    // 2단계: 정확한 매칭이 없으면 일반 매칭
    if (!matchedDomain) {
      matchedDomain = DOMAIN_OPTIONS.find(domain => {
        const domainName = domain.name.toLowerCase();
        const domainDesc = domain.description.toLowerCase();
        const domainId = domain.id.toLowerCase();
        
        return normalizedTranscript.includes(domainName) ||
               normalizedTranscript.includes(domainDesc) ||
               normalizedTranscript.includes(domainId) ||
               processedTranscript.includes(domainName) ||
               processedTranscript.includes(domainDesc) ||
               processedTranscript.includes(domainId) ||
               finalTranscript.includes(domainName) ||
               finalTranscript.includes(domainDesc) ||
               finalTranscript.includes(domainId);
      });
    }

    // 매칭 결과에 따라 즉시 처리
    processingRef.current = true;

    if (matchedDomain) {
      console.log('도메인 매칭 성공:', matchedDomain);
      setSelectedDomain(matchedDomain);
      
      // 음성 출력 전에 음성 인식 중지
      stopListening();
      
      console.log('TTS 호출 시도:', `${matchedDomain.name}이 선택되었습니다.`);
      speak(`${matchedDomain.name}이 선택되었습니다.`);
      speakingRef.current = true;
      
      setTimeout(() => {
        speakingRef.current = false;
        navigateToDomain(matchedDomain.id);
      }, 1500);
    } else {
      console.log('도메인 매칭 실패');
      
      // 음성 출력 전에 음성 인식 중지
      stopListening();
      
      console.log('TTS 호출 시도: 다시 말씀해주세요.');
      speak('다시 말씀해주세요.');
      speakingRef.current = true;
      
      setTimeout(() => {
        speakingRef.current = false;
        // 음성 출력 완료 후 다시 음성 인식 시작
        if (isVoiceMode) {
          startListening();
        }
      }, 1000);
    }

    setTimeout(() => {
      processingRef.current = false;
    }, 2000);
  }, [transcript, isVoiceMode, speak, navigate, voiceError, stopListening, startListening]);

  // 도메인 선택 핸들러
  const handleDomainSelect = (domain: typeof DOMAIN_OPTIONS[0]) => {
    console.log('도메인 선택:', domain);
    setSelectedDomain(domain);
    setShowDomainSelector(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white text-center">
      {/* 로고 - 둥근 모서리 파란색 사각형에 AI와 양팔 위로 벌린 사람 */}
      <div className="mb-6">
        <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mx-auto relative">
          {/* AI 텍스트 (상단) */}
          <span className="text-sm font-bold text-white absolute top-2">AI</span>
          
          {/* 양팔 위로 벌린 사람 실루엣 */}
          <div className="flex flex-col items-center justify-center">
            {/* 머리 (원) */}
            <div className="w-2 h-2 bg-white rounded-full mb-1"></div>
            {/* 몸통 (세로 막대) */}
            <div className="w-1 h-3 bg-white rounded-full mb-1"></div>
            {/* 팔 (가로 막대) */}
            <div className="w-4 h-1 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      {/* 영어 제목 */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        YAGO SPORTS
      </h1>
      <p className="text-sm text-gray-600 mb-4">
        AI Platform for Sports Enthusiasts
      </p>

      {/* 한국어 슬로건 */}
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        스포츠의 시작, 야고
      </h2>
      <p className="text-sm text-gray-700 mb-4">
        체육인 커뮤니티, 장터, 모임까지 <br />
        지금 위치를 선택하고 시작해보세요!
      </p>

      {/* 위치 선택 */}
      <div className="w-full max-w-sm mb-6 relative">
        <div
          className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-100 transition"
          onClick={() => setShowDomainSelector(!showDomainSelector)}
        >
          <div className="flex items-center">
            <span className="text-xl mr-3">{selectedDomain.flag}</span>
            <span className="text-base font-semibold text-gray-900">{selectedDomain.name}</span>
          </div>
          <span className="text-gray-500">▼</span>
        </div>

        {/* 음성 모드 토글 버튼 */}
        <div className="mt-2 flex justify-center">
          <button
            onClick={toggleVoiceMode}
            disabled={voiceError}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              voiceError
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : isVoiceMode
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {voiceError ? '🎤 음성 기능 사용 불가' : isVoiceMode ? '🎤 음성 모드 끄기' : '🎤 음성 모드 켜기'}
          </button>
        </div>

        {/* 음성 인식 상태 표시 */}
        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${voiceError ? 'bg-gray-400' : isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-blue-700">
              {voiceError 
                ? '음성 기능 사용 불가' 
                : isListening 
                ? '듣는 중...' 
                : '음성 인식 준비 중...'
              }
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            <div>음성 모드: {voiceError ? '사용 불가' : isVoiceMode ? '활성' : '비활성'}</div>
            <div>TTS: {voiceError ? '사용 불가' : speakingRef.current ? '활성' : '비활성'}</div>
            <div>처리: {voiceError ? '사용 불가' : processingRef.current ? '중' : '대기'}</div>
            <div>마이크: {voiceError ? '사용 불가' : isListening ? '듣는 중' : '대기'}</div>
            {transcript && !voiceError && <div>인식결과: {transcript}</div>}
            {isVoiceMode && !voiceError && (
              <div className="text-xs text-blue-600 mt-1">
                🎤 음성 명령: "한국", "미국", "일본", "중국", "영국", "독일", "프랑스", "캐나다", "호주", "브라질"
              </div>
            )}
            {voiceError && (
              <div className="text-red-500 mt-1">
                ⚠️ 음성 기능을 사용할 수 없습니다. 수동으로 선택해주세요.
              </div>
            )}
          </div>
        </div>

        {/* 도메인 선택 드롭다운 */}
        {showDomainSelector && (
          <div className="absolute z-10 w-full top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {DOMAIN_OPTIONS.map((domain, index) => (
              <div
                key={domain.id}
                className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleDomainSelect(domain)}
              >
                <span className="text-lg mr-3">{domain.flag}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">{domain.name}</div>
                </div>
                <span className="text-xs text-gray-400">#{index + 1}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 시작 버튼 */}
      <button
        className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold text-base shadow-md hover:bg-blue-600 transition mb-4"
        onClick={() => {
          console.log('🚀 시작 버튼 클릭됨');
          console.log('🚀 선택된 도메인:', selectedDomain);
          console.log('🚀 도메인 ID:', selectedDomain.id);
          navigateToDomain(selectedDomain.id);
        }}
      >
        {selectedDomain.name}에서 시작하기
      </button>

      {/* 로그인 링크 */}
      <p className="text-sm text-gray-600">
        이미 계정이 있나요?{" "}
        <button
          onClick={() => {
            try {
              navigate("/login");
            } catch (error) {
              console.error('로그인 페이지 이동 오류:', error);
              window.location.href = '/login';
            }
          }}
          className="text-red-500 font-bold"
        >
          로그인
        </button>
      </p>
    </div>
  );
} 