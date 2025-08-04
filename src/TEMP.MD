# 🏃‍♂️ Yago Sports Platform - 개발 노트

## 📝 현재 개발 상태

### ✅ 완료된 기능
- **음성 기반 회원가입/로그인**: Web Speech API 활용
- **상품 등록 시스템**: 이미지 업로드 및 AI 태깅
- **상품 상세 페이지**: 상품 정보 표시
- **Firebase 연동**: Authentication, Firestore, Storage
- **이미지 압축**: Base64 저장 및 1MB 제한 대응

### 🔧 최근 수정 사항
- **STT/TTS 충돌 해결**: 음성 인식 시 TTS 간섭 제거
- **비프음 구현**: Web Audio API를 활용한 시작 신호
- **음성 인식 최적화**: 30초 타임아웃 및 연속 인식 지원

### 🐛 해결된 문제들
1. **CORS 에러**: Firebase Storage → Base64 저장 방식으로 변경
2. **이미지 크기 제한**: 클라이언트 사이드 압축 구현
3. **음성 인식 충돌**: TTS 메시지 제거로 순수 STT 환경 구성

### 🚧 진행 중인 작업
- 음성 인식 안정성 개선
- 상품 검색 및 필터링 기능
- AI 채팅봇 구현

### 📋 다음 개발 계획
- [ ] 구인구직 매칭 시스템
- [ ] 커뮤니티 기능
- [ ] 모임 생성 및 관리
- [ ] 음성 기반 네비게이션

## 🛠️ 기술적 세부사항

### 음성 인식 구현
```typescript
// Web Speech API 설정
const recognition = new (window as any).SpeechRecognition()
recognition.continuous = true
recognition.interimResults = true
recognition.lang = 'ko-KR'
recognition.maxAlternatives = 3
```

### 이미지 처리
```typescript
// Canvas를 이용한 이미지 압축
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      // 800px 너비로 리사이즈, 70% 품질
      const maxWidth = 800
      const ratio = maxWidth / img.width
      canvas.width = maxWidth
      canvas.height = img.height * ratio
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    
    img.src = URL.createObjectURL(file)
  })
}
```

## 📊 성능 최적화

### 이미지 압축 전략
- **1차 압축**: 800px 너비, 70% JPEG 품질
- **2차 압축**: 600px 너비, 50% JPEG 품질 (필요시)
- **최종 검증**: 1MB 이하 확인 후 저장

### 음성 인식 최적화
- **연속 인식**: `continuous = true`
- **실시간 결과**: `interimResults = true`
- **자동 타임아웃**: 30초 후 자동 중지
- **에러 처리**: `no-speech` 에러 무시

## 🔍 디버깅 노트

### 음성 인식 문제 해결 과정
1. **비프음 문제**: Web Audio API 추가
2. **마이크 권한**: `getUserMedia` 권한 요청
3. **무한 루프**: 타임아웃 및 상태 관리 개선
4. **STT/TTS 충돌**: TTS 메시지 완전 제거

### Firebase 연동 문제 해결
1. **CORS 에러**: Storage → Base64 방식 변경
2. **권한 에러**: Firestore 규칙 설정
3. **크기 제한**: 이미지 압축 구현

## 📚 참고 자료

- [Web Speech API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Firebase Documentation](https://firebase.google.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

**마지막 업데이트**: 2024년 12월
**개발자**: Jaeman
**프로젝트**: Yago Sports Platform