import { useCallback, useEffect, useState } from 'react'

export const useSpeechSynthesis = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    // 음성 목록 로드
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices()
      console.log('사용 가능한 음성 목록:', availableVoices)
      setVoices(availableVoices)
    }

    // 초기 로드
    loadVoices()

    // 음성 목록이 변경될 때 다시 로드
    speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const speak = useCallback((text: string, onEndCallback?: () => void, lang: string = 'ko-KR') => {
    console.log('🎤 TTS 실행 시도:', text)
    console.log('🎤 speechSynthesis 지원 여부:', 'speechSynthesis' in window)
    
    if ('speechSynthesis' in window) {
      // 이미 TTS가 실행 중이면 중단
      if (speechSynthesis.speaking) {
        console.log('🔄 TTS 이미 실행 중, 중단')
        speechSynthesis.cancel()
      }
      
      // 기존 음성 완전 중지 및 대기
      speechSynthesis.cancel()
      
      // TTS 중지 후 충분한 대기 (interrupted 에러 방지)
      setTimeout(() => {
        // 다시 한번 중지 (이중 안전장치)
        speechSynthesis.cancel()
        
        setTimeout(() => {
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 1.5  // 속도를 훨씬 더 빠르게 설정
      utterance.pitch = 1
      utterance.volume = 1
      
      // 한국어 음성 찾기
      const koreanVoice = voices.find(voice => 
        voice.lang.includes('ko') || voice.lang.includes('KR')
      )
      
      if (koreanVoice) {
        console.log('한국어 음성 사용:', koreanVoice.name)
        utterance.voice = koreanVoice
      } else {
        console.log('한국어 음성을 찾을 수 없음, 기본 음성 사용')
      }
      
      // 이벤트 리스너 추가
      utterance.onstart = () => {
        console.log('TTS 시작')
        setIsSpeaking(true)
        // TTS와 음성 인식 병렬 처리 (에코 루프는 onresult에서 방지)
        console.log('🎤 TTS와 음성 인식 병렬 처리')
      }
      utterance.onend = () => {
        console.log('TTS 종료')
        setIsSpeaking(false)
        // TTS 완료 후 약간의 지연을 두고 콜백 실행
        setTimeout(() => {
          if (onEndCallback) {
            onEndCallback()
          }
        }, 200)
      }
      utterance.onerror = (event) => {
        console.error('TTS 에러:', event.error)
        // 에러 발생 시에도 콜백 실행
        if (onEndCallback) {
          onEndCallback()
        }
      }
      
              console.log('🎤 TTS 실제 실행:', text)
        speechSynthesis.speak(utterance)
        }, 300) // 300ms 대기 후 실행
      }, 500) // 500ms 대기 후 실행
    } else {
      console.error('🎤 Speech Synthesis가 지원되지 않습니다.')
      // 지원되지 않는 경우에도 콜백 실행
      if (onEndCallback) {
        onEndCallback()
      }
    }
  }, [voices])

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [])

  return { speak, stop, isSpeaking }
} 