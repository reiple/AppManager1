# Application Manager Web Console

Application Manager Web Console는 애플리케이션 관리를 위한 웹 기반 관리 콘솔입니다. React와 Vite를 활용하여 빠르고 효율적인 사용자 경험을 제공합니다.

## 📋 프로젝트 개요

- **레이아웃**: 접을 수 있는 사이드바 메뉴 + 메인 콘텐츠 영역
- **헤더**: 로그인 정보 및 사용자 프로필 표시
- **프론트엔드 클라이언트**: React 기반 SPA (Single Page Application)
- **백엔드**: 별도 API 서버와 통신

## 🛠️ 기술 스택

- **프론트엔드 프레임워크**: React (함수형 컴포넌트, Hooks)
- **번들러**: Vite
- **언어**: JavaScript (ES6+)
- **상태 관리**: Zustand
- **API 통신**: React Query
- **UI 라이브러리**: Material-UI (MUI)
- **패키지 관리자**: pnpm
- **스타일링**: CSS Modules / Scoped CSS

## 📁 디렉토리 구조

```
src/
├── components/
│   ├── layout/           # 레이아웃 컴포넌트 (Sidebar, Header, MainLayout)
│   └── common/           # 재사용 가능한 공통 UI 요소
├── pages/                # 웹 콘솔의 각 기능별 페이지
├── services/             # 백엔드 API 통신 레이어
├── App.jsx
└── index.css
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 시작되면 브라우저에서 `http://localhost:5173` 접속

### 3. 프로덕션 빌드

```bash
npm run build
```

최적화된 프로덕션 번들이 `dist/` 디렉토리에 생성됩니다.

### 4. 코드 린트 확인

```bash
npm run lint
```

## 🎨 주요 기능

- **접을 수 있는 사이드바**: 메뉴를 숨기고 표시할 수 있는 토글 기능
- **반응형 레이아웃**: Flexbox/Grid를 활용한 유연한 레이아웃
- **사용자 프로필**: 로그인된 사용자 정보 표시
- **대시보드**: 애플리케이션 관리 페이지

## 📝 개발 가이드라인

### 컴포넌트 작성

- 함수형 컴포넌트 사용
- React Hooks 활용 (`useState`, `useEffect`, `useContext`)
- 스타일 오염 방지를 위한 스코프 스타일링

### 상태 관리

- UI 상태 (사이드바 토글): 로컬 state 또는 Context API
- 글로벌 상태: Zustand 활용
- 로그인 정보: Context API를 통한 전역 접근

### API 통신

- 백엔드 API 요청은 `src/services/` 또는 `src/api/` 레이어로 분리
- 컴포넌트 내부에 직접적인 fetch/axios 호출 지양
- React Query를 활용한 효율적인 데이터 페칭 및 캐싱

## 📦 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
```

### 빌드 결과물 확인

```bash
npm run preview
```

빌드된 파일을 로컬에서 프리뷰합니다.

## 🔗 백엔드 API 연동

이 프로젝트는 별도의 백엔드 API 서버와 통신합니다. 백엔드 설정 및 API 엔드포인트는 환경 변수로 관리합니다.

## 📄 라이선스

프로젝트에 대한 라이선스 정보는 프로젝트 루트의 LICENSE 파일을 참고하세요.

## 👤 개발자

Application Manager Web Console 개발팀

---

**마지막 업데이트**: 2026-06-25
