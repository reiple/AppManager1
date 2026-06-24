# Claude 프로젝트 컨텍스트 - Application Manager Web Console

## 프로젝트 개요
이 프로젝트는 React, Vite, JavaScript를 사용하여 개발하는 **Application Manager Web Console**입니다. 백엔드는 별도로 작성되므로, 이 저장소는 프론트엔드 클라이언트 구현에 집중합니다.

### 핵심 레이아웃 및 UI 요구사항
- **레이아웃**: 왼쪽에 **접을 수 있는 사이드바 메뉴(Collapsible Sidebar)**가 있고, 오른쪽에 **메인 화면**이 위치하는 구조.
- **헤더**: 오른쪽 메인 화면의 **우측 상단에 로그인 정보(유저 프로필)**를 표시.
- **기술 스택**: React (함수형 컴포넌트, Hooks), Vite, JavaScript (ES6+), CSS/UI 라이브러리. 상태관리 zustand, API 호출 react-query, UI 라이브러리 MUI, 패키지 설치는 npm 대신 pnpm 사용

---

## 빌드 및 개발 명령어
프로젝트 관리를 위해 아래 명령어들을 사용합니다:
- **의존성 설치**: `npm install`
- **개발 서버 실행**: `npm run dev`
- **프로덕션 빌드**: `npm run build`
- **코드 린트 실행**: `npm run lint`

---

## 코드 아키텍처 및 개발 가이드라인

### 레이아웃 구조 지침
- **사이드바 (`<Sidebar />`)**: 열림/접힘 상태는 React state 또는 Context로 관리하며, 토글 버튼을 통해 접고 펼칠 수 있어야 함.
- **헤더 (`<Header />`)**: 메인 영역 상단에 고정되며, 로그인된 사용자 정보가 우측 끝에 정렬되도록 구성.
- **메인 레이아웃**: Flexbox 또는 Grid를 활용하여 사이드바와 메인 콘텐츠 영역이 유연하게 배치되도록 구현.

### 코드 스타일 및 규칙
- **컴포넌트**: 함수형 컴포넌트와 Hooks(`useState`, `useEffect`, `useContext`)를 사용.
- **상태 관리**: 사이드바 토글 등 UI 상태는 로컬 state를 사용하고, 로그인 정보는 Context API 등을 활용해 전역적으로 접근 가능하게 설계.
- **JavaScript**: 현대적인 JavaScript (ES6+) 문법을 사용. (TypeScript는 사용하지 않음)
- **API 연동**: 백엔드가 별도 존재하므로 API 요청은 전역 서비스 레이어(`src/services/` 또는 `src/api/`)로 분리하고, UI 컴포넌트 내부에 직접적인 fetch/axios 호출을 지양.
- **스타일링**: 컴포넌트별 스코프 스타일(CSS Modules, Tailwind CSS 등 프로젝트 설정에 따름)을 준수하여 스타일 오염 방지.

---

## 디렉토리 구조 전략
`src/` 디렉토리 내부는 다음 구조를 지향하며 개발을 진행합니다:
- `src/components/layout/` - `Sidebar.jsx`, `Header.jsx`, `MainLayout.jsx` (레이아웃 관련 컴포넌트)
- `src/components/common/` - 재사용 가능한 공통 UI 요소 (Button, Input 등)
- `src/pages/` - 웹 콘솔의 각 기능별 페이지 뷰
- `src/services/` - 백엔드 API 통신 전담 레이어