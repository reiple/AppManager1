# Project Memory - Application Manager Web Console

**Latest Update:** 2026-06-25

## 📋 프로젝트 완료 상태

### ✅ Phase 1: 웹 애플리케이션 핵심 구축 (완료)
5개 주요 페이지 구현:
1. **Dashboard** - 시스템 상태 요약, 최근 활동 표시
2. **Application Management** - 애플리케이션 목록, 시작/중지 제어
3. **Logs** - 통합 로그 조회, 앱/레벨 필터링
4. **Monitoring** - 실시간 메트릭 표시 (CPU, 메모리, 요청/분, 에러율)
5. **Settings** - 설정 관리 (일반, 기능, 위험 작업)

### ✅ Phase 2: 다국어 지원 구현 (완료)
- 3개 언어 지원: 영어, 한국어, 중국어
- i18next 기반 국제화 (i18n)
- 헤더의 dropdown에서 실시간 언어 전환
- localStorage에 언어 선택 저장 (자동 복원)

**주요 파일:**
- `src/i18n.js` - i18next 설정
- `src/locales/en.json`, `ko.json`, `zh.json` - 다국어 번역
- `src/components/layout/Header.jsx` - 언어 선택 드롭다운

### ✅ Phase 3: GitHub Push 및 문서화 (완료)
- 7개 커밋을 GitHub에 push
- Repository: https://github.com/reiple/AppManager1
- README.md 전체 업데이트 (기능 설명, 스크린샷)
- docs/screenshots/ 디렉토리에 5개 페이지 스크린샷 저장

## 🛠️ 기술 스택 (최종)
- **React** 19.2+ (함수형 컴포넌트, Hooks)
- **Vite** 8.1+ (번들러)
- **React Router** v6+ (라우팅)
- **i18next** + react-i18next (다국어)
- **Zustand** (상태 관리)
- **React Query** (API 통신)
- **Material-UI** (UI 라이브러리)
- **CSS** (스코프드 스타일링)
- **Playwright** (자동 스크린샷)

## 📁 핵심 디렉토리 구조

```
src/
├── components/layout/
│   ├── Sidebar.jsx (메뉴, 라우팅)
│   ├── Header.jsx (헤더, 언어 선택)
│   └── MainLayout.jsx (전체 레이아웃)
├── pages/
│   ├── Dashboard.jsx
│   ├── ApplicationManagement.jsx
│   ├── Logs.jsx
│   ├── Monitoring.jsx
│   └── Settings.jsx
├── locales/
│   ├── en.json (영어)
│   ├── ko.json (한국어)
│   └── zh.json (중국어)
├── services/ (API 통신 레이어)
├── i18n.js
├── App.jsx
└── main.jsx

docs/
└── screenshots/ (5개 페이지 스크린샷)
```

## 🚀 개발 및 배포 명령어

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 코드 린트
npm run lint
```

## 🔗 GitHub 저장소
**URL:** https://github.com/reiple/AppManager1
**Branch:** main
**Status:** ✅ 완성 및 배포 준비 완료

## 📝 마지막 7개 커밋

1. feat: add routing and dependencies
2. feat: implement Application Management page with start/stop controls
3. feat: implement Logs page with filtering by app and log level
4. feat: implement Monitoring page with real-time performance metrics
5. feat: implement Settings page with configuration management
6. feat: add multi-language support (English, Korean, Chinese)
7. docs: update README with feature descriptions and screenshots

## 🚀 다음 단계
- 백엔드 API 서버 연동 (별도 프로젝트)
- 실제 데이터 바인딩 (현재는 Mock 데이터 사용)
- Docker 배포 설정
- CI/CD 파이프라인 구성

## 💡 개발자 노트
- 모든 UI 텍스트는 i18n을 통해 관리 (다국어 지원 시 locales JSON에만 추가)
- 컴포넌트는 함수형 + Hooks 패턴 사용
- API 통신은 `src/services/` 디렉토리로 분리
- 상태 관리는 Zustand 활용
- Mock 데이터는 각 페이지 컴포넌트에 useState로 정의

---

**프로젝트 완료일:** 2026-06-25
**개발:** Claude Code (AI Assistant)
