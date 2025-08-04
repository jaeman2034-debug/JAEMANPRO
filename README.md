# 🏃‍♂️ Yago Sports Platform

AI 기반 스포츠 커뮤니티 플랫폼으로, 음성 인식과 AI 기능을 활용한 혁신적인 스포츠 서비스입니다.

## 🚀 주요 기능

### 🎤 음성 기반 사용자 인증
- **음성 회원가입/로그인**: Web Speech API를 활용한 음성 인식 기반 사용자 인증
- **실시간 음성-텍스트 변환**: STT(Speech-to-Text) 기술로 음성을 실시간 텍스트 변환
- **음성 피드백**: TTS(Text-to-Speech) 기술로 사용자에게 음성 안내 제공

### 🛒 AI 기반 중고 스포츠 마켓
- **상품 등록**: 이미지 업로드 및 상품 정보 입력
- **AI 자동 태깅**: OpenAI GPT-4 Vision API를 활용한 상품 자동 태깅
- **GPS 기반 위치 필터링**: 사용자 위치 기반 상품 검색
- **상품 상세 페이지**: 상품 정보, 판매자 정보, 연락 기능

### 💼 AI 기반 구인구직 매칭
- **스마트 매칭**: AI가 사용자 프로필과 선호도를 분석하여 최적의 매칭 제공
- **음성 기반 채팅**: 음성으로 대화하는 AI 채팅봇

### 🏟️ 커뮤니티 & 모임
- **음성 기반 모임 생성**: 음성으로 모임 정보 입력
- **AI 음성 가이드**: 모임 장소까지 음성 안내

## 🛠️ 기술 스택

### Frontend
- **React 18** - 사용자 인터페이스
- **TypeScript** - 타입 안전성
- **Vite** - 빠른 개발 환경
- **Tailwind CSS** - 스타일링
- **React Router DOM** - 라우팅

### Backend & Database
- **Firebase Authentication** - 사용자 인증
- **Firestore** - NoSQL 데이터베이스
- **Firebase Storage** - 이미지 저장

### AI & Voice
- **OpenAI GPT-4 Vision API** - 이미지 분석 및 AI 태깅
- **Web Speech API** - 음성 인식(STT) 및 음성 합성(TTS)
- **Kakao Maps API** - 지도 및 위치 서비스

### Deployment
- **Netlify** - 웹 호스팅

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── TabNavigation.tsx
│   ├── MainApp.tsx
│   └── VoiceTest.tsx
├── hooks/              # 커스텀 React 훅
│   ├── useAuth.ts
│   ├── useSpeechRecognition.ts
│   └── useSpeechSynthesis.ts
├── pages/              # 페이지 컴포넌트
│   ├── start/          # 시작 페이지
│   ├── login/          # 로그인
│   ├── register/       # 회원가입
│   ├── home/           # 메인 홈
│   ├── market/         # 중고 마켓
│   ├── chat/           # AI 채팅
│   └── mypage/         # 마이페이지
├── services/           # 서비스 로직
│   ├── firebase.ts     # Firebase 설정
│   └── productService.ts # 상품 관련 서비스
├── utils/              # 유틸리티 함수
│   └── voiceCommands.ts
└── types/              # TypeScript 타입 정의
    └── env.d.ts
```

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/jaeman2034-debug/JAEMANPRO.git
cd JAEMANPRO
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# Firebase 설정
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# OpenAI API
VITE_OPENAI_API_KEY=your_openai_api_key

# Kakao Maps API
VITE_KAKAO_MAPS_API_KEY=your_kakao_maps_api_key
```

### 4. 개발 서버 실행
```bash
npm run dev
```

### 5. 빌드
```bash
npm run build
```

## 🎯 주요 기능 상세

### 음성 인식 기능
- **Web Speech API** 활용
- **실시간 음성-텍스트 변환**
- **한국어 음성 인식 지원**
- **음성 명령 처리**

### 상품 관리 시스템
- **이미지 압축 및 Base64 저장**
- **Firestore 문서 크기 제한 대응**
- **실시간 상품 목록 조회**
- **카테고리별 필터링**

### 사용자 인증
- **Firebase Authentication**
- **Google 로그인 지원**
- **음성 기반 회원가입/로그인**

## 🔧 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- npm 또는 yarn
- Chrome/Edge 브라우저 (Web Speech API 지원)

### 권장 개발 도구
- VS Code
- React Developer Tools
- Firebase Console

## 📝 API 문서

### Firebase 설정
Firebase 프로젝트를 생성하고 다음 서비스를 활성화하세요:
- Authentication
- Firestore Database
- Storage

### Web Speech API
브라우저에서 `navigator.mediaDevices.getUserMedia` 권한이 필요합니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 👨‍💻 개발자

- **Jaeman** - [GitHub](https://github.com/jaeman2034-debug)

## 🙏 감사의 말

- OpenAI GPT-4 Vision API
- Firebase
- Web Speech API
- React & TypeScript 커뮤니티

---

**Yago Sports Platform** - AI와 음성 기술로 만드는 스포츠의 미래 🏆 