import { useCallback, useEffect, useState } from 'react'

export const useSpeechSynthesis = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

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

  const speak = useCallback((text: string, lang: string = 'ko-KR') => {
    console.log('TTS 실행:', text)
    
    if ('speechSynthesis' in window) {
      // 기존 음성 중지
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 0.9
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
      utterance.onstart = () => console.log('TTS 시작')
      utterance.onend = () => console.log('TTS 종료')
      utterance.onerror = (event) => console.error('TTS 에러:', event.error)
      
      speechSynthesis.speak(utterance)
    } else {
      console.error('Speech Synthesis가 지원되지 않습니다.')
    }
  }, [voices])

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
  }, [])

  return { speak, stop }
} 