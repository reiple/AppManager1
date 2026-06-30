# Application Manager Web Console

**클라우드 인프라를 관리하기 위한 전문가급 웹 기반 관리 콘솔**

Application Manager Web Console은 React와 Vite를 활용하여 애플리케이션과 오브젝트 스토리지를 효율적으로 관리할 수 있는 풀스택 대시보드입니다. 실시간 모니터링, 로그 분석, S3 호환 오브젝트 스토리지 관리 등 다양한 기능을 제공합니다.

## 📋 프로젝트 개요

- **다국어 지원**: 영어, 한국어, 중국어 (헤더 dropdown에서 선택 가능)
- **반응형 레이아웃**: 접을 수 있는 사이드바 메뉴 + 메인 콘텐츠 영역
- **헤더**: 로그인 정보, 사용자 프로필, 언어 선택 기능
- **프론트엔드**: React 기반 SPA (Single Page Application)
- **백엔드**: Python FastAPI 기반 REST API 서버

## 🛠️ 기술 스택

### 프론트엔드

- **프레임워크**: React 19.2+ (함수형 컴포넌트, Hooks)
- **번들러**: Vite 8.1+
- **언어**: JavaScript (ES6+)
- **라우팅**: React Router v6+
- **상태 관리**: Zustand
- **API 통신**: React Query (@tanstack/react-query v5), axios
- **다국어 지원**: i18next + react-i18next
- **UI 라이브러리**: Material-UI (MUI)
- **패키지 관리자**: npm
- **스타일링**: CSS (Scoped CSS)

### 백엔드

- **언어**: Python 3.12+
- **프레임워크**: FastAPI 0.115+
- **서버**: Uvicorn
- **스토리지**: boto3 (S3 호환 오브젝트 스토리지)
- **데이터 유효성 검사**: Pydantic v2
- **패키지 관리자**: uv

## 📁 디렉토리 구조

```
AppManager1/
├── src/                          # 프론트엔드 소스
│   ├── components/
│   │   ├── layout/               # 레이아웃 컴포넌트
│   │   │   ├── Sidebar.jsx             # 접을 수 있는 사이드바 메뉴
│   │   │   ├── Header.jsx              # 헤더 (사용자 정보 + 언어 선택)
│   │   │   └── MainLayout.jsx          # 전체 레이아웃
│   │   └── common/               # 재사용 가능한 공통 UI 요소
│   ├── pages/                    # 기능별 페이지
│   │   ├── Dashboard.jsx               # 대시보드 (시스템 요약)
│   │   ├── ApplicationManagement.jsx   # 애플리케이션 관리
│   │   ├── Logs.jsx                    # 로그 조회 및 필터링
│   │   ├── Monitoring.jsx              # 실시간 모니터링
│   │   ├── ObjectStorage.jsx           # 오브젝트 스토리지 관리
│   │   └── Settings.jsx                # 설정 관리
│   ├── locales/                  # 다국어 번역 파일
│   │   ├── en.json                     # 영어
│   │   ├── ko.json                     # 한국어
│   │   └── zh.json                     # 중국어 (간체)
│   ├── services/                 # 백엔드 API 통신 레이어
│   │   └── storageApi.js               # 오브젝트 스토리지 API
│   ├── i18n.js                   # i18next 설정
│   ├── App.jsx
│   └── main.jsx
└── backend/                      # 백엔드 소스
    ├── app/
    │   ├── main.py                     # FastAPI 앱 진입점
    │   ├── routers/
    │   │   └── storage.py              # 스토리지/버킷/오브젝트 라우터
    │   ├── services/
    │   │   └── storage_manager.py      # S3 연동 비즈니스 로직
    │   ├── schemas/
    │   │   └── storage.py              # Pydantic 스키마
    │   ├── models/
    │   │   └── storage.py              # 데이터 모델
    │   ├── dependencies.py             # FastAPI 의존성
    │   └── errors.py                   # 에러 핸들링
    ├── tests/
    │   └── test_storage_api.py         # API 테스트
    └── pyproject.toml                  # Python 의존성 정의
```

## 🚀 시작하기

### 프론트엔드

#### 1. 의존성 설치

```bash
npm install
```

#### 2. 개발 서버 실행

```bash
npm run dev
```

개발 서버가 시작되면 브라우저에서 `http://localhost:5173` 접속

#### 3. 프로덕션 빌드

```bash
npm run build
```

최적화된 프로덕션 번들이 `dist/` 디렉토리에 생성됩니다.

#### 4. 코드 린트 확인

```bash
npm run lint
```

---

### 백엔드

#### 1. uv 설치 (처음 한 번)

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

#### 2. 백엔드 디렉토리로 이동

```bash
cd backend
```

#### 3. 개발 서버 실행

```bash
uv run uvicorn app.main:app --reload
```

서버가 시작되면 `http://127.0.0.1:8000` 에서 API가 제공됩니다.
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

#### 4. 테스트 실행

```bash
uv run pytest tests/test_storage_api.py -q
```

## 🎨 주요 기능

### 1. **Dashboard (대시보드)**
- 전체 애플리케이션 상태 요약
- 시스템 상태 표시 (정상/경고/위험)
- 최근 배포 통계
- 최근 활동 로그 실시간 업데이트

### 2. **Application Management (애플리케이션 관리)**
- 실행 중인 모든 애플리케이션 목록 조회
- 애플리케이션별 상태 표시 (실행 중/중지)
- 포트, 업타임, 메모리, CPU 정보 표시
- **시작/중지 버튼**으로 애플리케이션 제어
- 애플리케이션별 로그 접근 링크
- 요약 통계 (실행 중/중지/전체)

### 3. **Logs (로그 조회)**
- 모든 애플리케이션의 통합 로그 조회
- **필터 기능**: 애플리케이션별, 로그 레벨별 필터
- 타임스탬프, 앱 이름, 로그 레벨, 메시지 표시
- 로그 삭제 기능

### 4. **Monitoring (실시간 모니터링)**
- **시스템 전체 지표**: CPU, 메모리, 디스크 사용률
- **애플리케이션별 실시간 메트릭**:
  - CPU & 메모리 사용률 (진행 바 시각화)
  - 요청/분 (Requests per minute)
  - 에러율 (Error rate %)
  - 평균 응답시간 (ms)
- 3초마다 자동 갱신
- 건강도 상태 표시 (정상🟢/경고🟡/심각🔴)

### 5. **Object Storage (오브젝트 스토리지)** ✨
- **스토리지 연결 관리**: S3 호환 스토리지 연결 등록/삭제
- **3단계 탐색**: 스토리지 목록 → 버킷 목록 → 오브젝트 탐색
- **버킷 관리**: 버킷 생성/삭제, 접근 권한 설정 (공개/비공개)
- **오브젝트 탐색**: 가상 폴더 구조 지원, 경로 브레드크럼 네비게이션
- **파일 업로드**: 멀티파트 업로드 지원
- **파일 다운로드**: Presigned URL 기반 안전한 다운로드
- **실시간 피드백**: 작업 결과 토스트 알림
- FastAPI 백엔드와 완전 연동 (`http://localhost:8000`)

### 6. **Settings (설정 관리)**
- **일반 설정**: 앱 이름, 갱신 간격, 로그 보관 기간 설정
- **기능 토글**: 알림, 자동 재시작, 유지보수 모드
- **위험 작업**: 로그 삭제, 설정 초기화, 설정 내보내기
- 현재 설정 JSON 미리보기

### 7. **다국어 지원** 🌍
- **3개 언어 지원**: 영어(English), 한국어(한국어), 중국어(中文)
- 헤더의 **언어 선택 dropdown**에서 즉시 변경
- 페이지 새로고침 없이 실시간 언어 변환
- 선택한 언어는 localStorage에 저장되어 다음 방문 시에도 유지

### 8. **UI/UX 특징**
- **접을 수 있는 사이드바**: 메뉴 토글 기능으로 화면 공간 최적화
- **다크 네온 글래스모피즘**: 현대적인 UI 디자인
- **직관적인 네비게이션**: React Router 기반 SPA
- **시각적 피드백**: 상태별 색상 코딩
- **실시간 업데이트**: 자동 갱신 및 즉시 반영

## 📝 개발 가이드라인

### 컴포넌트 작성

- 함수형 컴포넌트 사용
- React Hooks 활용 (`useState`, `useEffect`, `useContext`)
- `useTranslation()` 훅을 사용하여 다국어 지원
- 스타일 오염 방지를 위한 스코프 스타일링

### 다국어 지원

언어별 번역은 `src/locales/` 디렉토리의 JSON 파일에서 관리합니다.

**텍스트를 추가할 때:**
1. `src/locales/en.json`, `ko.json`, `zh.json`에 모두 번역 추가
2. 컴포넌트에서 `useTranslation()` 훅 사용: `const { t } = useTranslation()`
3. 텍스트 대신 번역 키 사용: `t('common.appName')`

예시:
```jsx
const { t } = useTranslation()

return <h1>{t('dashboard.title')}</h1>
```

### 상태 관리

- UI 상태 (사이드바 토글): 로컬 state 또는 Context API
- 글로벌 상태: Zustand 활용
- 로그인 정보: Context API를 통한 전역 접근
- 언어 선택: i18n 인스턴스를 통해 자동 관리

### API 통신

- 백엔드 API 요청은 `src/services/` 디렉토리로 분리
- 컴포넌트 내부에 직접적인 fetch/axios 호출 지양
- React Query를 활용한 효율적인 데이터 페칭 및 캐싱

## 🔗 백엔드 API

오브젝트 스토리지 API는 FastAPI로 구현되어 있으며, `http://localhost:8000`에서 제공됩니다.

### 주요 엔드포인트

| 기능 | HTTP Method | 엔드포인트 |
|------|-------------|-----------|
| 스토리지 목록 조회 | GET | `/api/v1/storages` |
| 스토리지 등록 | POST | `/api/v1/storages` |
| 스토리지 삭제 | DELETE | `/api/v1/storages/{id}` |
| 연결 테스트 | POST | `/api/v1/storages/{id}/test` |
| 버킷 목록 조회 | GET | `/api/v1/buckets` |
| 버킷 생성 | POST | `/api/v1/buckets` |
| 버킷 삭제 | DELETE | `/api/v1/buckets/{id}` |
| 오브젝트 목록 조회 | GET | `/api/v1/buckets/{id}/objects` |
| 오브젝트 업로드 | POST | `/api/v1/buckets/{id}/objects` |
| 오브젝트 삭제 | DELETE | `/api/v1/storages/{id}/objects/{key}` |
| Presigned URL 생성 | POST | `/api/v1/storages/{id}/presigned-url` |

자세한 API 명세는 `backend/API.md` 참조.

### 현재 상태

- ✅ 프론트엔드 UI/UX 완성
- ✅ 라우팅 및 페이지 구조 구성
- ✅ 다국어 지원 완료 (한국어/영어/중국어)
- ✅ 오브젝트 스토리지 백엔드 API 구현 완료 (FastAPI)
- ✅ 프론트엔드-백엔드 오브젝트 스토리지 완전 연동

## 📦 빌드 및 배포

### 프론트엔드 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 🐛 버그 리포트 및 기능 요청

버그를 발견하거나 새로운 기능을 제안하고 싶으신 경우, GitHub Issues를 통해 보고해주세요.

---

**마지막 업데이트**: 2026-06-30

## 📚 주요 업데이트 이력

### v1.2.0 (2026-06-30)
- ✨ 오브젝트 스토리지 페이지 추가 (S3 호환 스토리지 관리)
- ✨ Python FastAPI 백엔드 추가
- ✨ 3단계 스토리지 탐색 (스토리지 → 버킷 → 오브젝트)
- ✨ 파일 업로드/다운로드 (멀티파트, Presigned URL)
- ✨ 버킷 생성/삭제 기능
- 🎨 다크 네온 글래스모피즘 UI 리디자인

### v1.1.0 (2026-06-25)
- ✨ 다국어 지원 추가 (영어, 한국어, 중국어)
- ✨ 5개 주요 페이지 구현 완료
- 🎨 반응형 UI 개선
- 📊 실시간 모니터링 기능 추가

### v1.0.0 (2026-06-24)
- 🎉 프로젝트 초기 릴리스
- ✨ 기본 레이아웃 및 네비게이션 구현
- 📊 대시보드 페이지 구현
