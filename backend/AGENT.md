# Agent Role & Context: FastAPI S3 Backend API Developer

## 1. Project Overview
이 프로젝트는 **FastAPI**를 사용하여 프론트엔드(웹페이지)에서 **AWS S3**에 안전하게 접근하고 파일을 관리할 수 있도록 지원하는 백엔드 RESTful API입니다. AI 에이전트는 이 가이드를 준수하여 고성능, 고품질의 Python 코드를 작성해야 합니다.

## 2. Tech Stack
* **Language:** Python 3.10+
* **Framework:** FastAPI
* **AWS SDK:** Boto3 (Asynchronous wrapping preferred if possible, or standard synchronous with FastAPI's `threadpool`)
* **Environment Management:** Pydantic v2 (Settings)
* **Package/Task Runner:** uv (`uv run ...`, `uv add ...`, `uv sync` 우선 사용)
* **Asynchronous ASGI Server:** Uvicorn

## 3. Core Features & Requirements

### 3.1. S3 Integration Features
1.  **Presigned URL Generation (추천 방식):** 프론트엔드가 S3에 직접 안전하게 업로드/다운로드할 수 있도록 제한시간이 있는 Presigned URL을 발급합니다.
2.  **Direct File Upload/Download:** 백엔드 서버를 거쳐 S3로 파일을 중계 업로드하거나 다운로드하는 스트리밍 API를 제공합니다.
3.  **Object Management:** S3 버킷 내의 파일 목록 조회(List), 삭제(Delete) 기능을 제공합니다.

### 3.2. Technical Rules & Constraints
* **Pydantic 구조화:** 모든 Request/Response Body 및 환경 변수(`env`) 설정은 Pydantic 모델을 사용하여 철저하게 검증(Validation)해야 합니다.
* **에러 핸들링:** AWS Boto3 에러(`botocore.exceptions.ClientError`) 및 비즈니스 로직 에러는 FastAPI의 `HTTPException`을 사용하여 명확한 상태 코드와 메시지로 응답해야 합니다.
* **의존성 주입 (Dependency Injection):** S3 클라이언트 세션 및 설정 정보는 FastAPI의 `Depends`를 활용하여 주입식으로 관리합니다.
* **CORS 설정:** 웹페이지(프론트엔드)에서 접근할 수 있도록 적절한 CORS(Cross-Origin Resource Sharing) 미들웨어 설정이 포함되어야 합니다.
* **의존성/명령 실행:** Python 패키지 설치 및 테스트/서버 실행은 `pip` 또는 시스템 Python 직접 실행보다 `uv`를 우선 사용합니다. 예: `uv sync`, `uv run pytest`, `uv run uvicorn app.main:app --reload`.

### 3.3. Test Object Storage
로컬 테스트용 오브젝트 저장소 정보는 다음과 같습니다.

* **Endpoint:** `http://localhost:9000`
* **Access Key:** `rootuser`
* **Secret Key:** `CHANGEME123`

실제 코드 구현 시에는 위 값을 하드코딩하지 말고, 기존 설정/환경 변수 방식을 우선 사용합니다.

---

## 4. Architecture & Directory Structure
에이전트는 새로운 파일이나 기능을 추가할 때 아래의 구조를 기반으로 코드를 작성해야 합니다.

```text
.
├── app/
│   ├── __init__.py
│   ├── main.py             # FastAPI 앱 초기화 및 미들웨어 설정
│   ├── config.py           # Pydantic Settings를 이용한 환경 변수 관리
│   ├── dependencies.py     # Boto3 클라이언트 등 의존성 주입 정의
│   ├── routers/            # API 엔드포인트 라우팅
│   │   ├── __init__.py
│   │   └── s3.py           # S3 관련 API (Upload, List, Delete 등)
│   └── services/           # 비즈니스 로직 및 S3 통신 래퍼
│       ├── __init__.py
│       └── s3_service.py
├── .env                    # AWS Credentials 및 설정 파일 (Git 제외)
└── requirements.txt
