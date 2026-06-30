# Object Storage API 명세서

> **Base URL**: `https://api.example.com`  
> **API Version**: `v1`  
> **인증 방식**: Bearer Token (모든 API 공통 적용)

---

## 목차

1. [버킷(Bucket) 관리 API](#1-버킷bucket-관리-api)
   - [1.1 버킷 목록 조회](#11-버킷-목록-조회)
   - [1.2 버킷 생성](#12-버킷-생성)
   - [1.3 버킷 삭제](#13-버킷-삭제)
2. [오브젝트(Object) 관리 API](#2-오브젝트object-관리-api)
   - [2.1 오브젝트 목록 조회](#21-오브젝트-목록-조회)
   - [2.2 오브젝트 단일 업로드](#22-오브젝트-단일-업로드)
   - [2.3 멀티파트 업로드 초기화](#23-멀티파트-업로드-초기화)
   - [2.4 멀티파트 업로드 파트 전송](#24-멀티파트-업로드-파트-전송)
   - [2.5 멀티파트 업로드 완료](#25-멀티파트-업로드-완료)
   - [2.6 오브젝트 다운로드 URL 생성 (Presigned URL)](#26-오브젝트-다운로드-url-생성-presigned-url)
   - [2.7 오브젝트 삭제 (단일)](#27-오브젝트-삭제-단일)
   - [2.8 오브젝트 다중 삭제](#28-오브젝트-다중-삭제)

---

## 공통 사항

### 공통 Request Headers

| 헤더명 | 필수 | 설명 |
|--------|------|------|
| `Authorization` | 필수 | `Bearer <access_token>` 형식의 인증 토큰 |
| `Content-Type` | 조건부 | 요청 본문이 있는 경우 `application/json` |

### 공통 에러 응답 형식

```json
{
  "code": "ERROR_CODE",
  "message": "에러에 대한 상세 설명",
  "timestamp": "2026-06-30T12:00:00Z"
}
```

### 공통 에러 코드

| HTTP 상태 코드 | code | 설명 |
|----------------|------|------|
| `400 Bad Request` | `INVALID_REQUEST` | 요청 파라미터 또는 바디 유효성 오류 |
| `401 Unauthorized` | `UNAUTHORIZED` | 인증 토큰 누락 또는 만료 |
| `403 Forbidden` | `FORBIDDEN` | 해당 리소스에 대한 접근 권한 없음 |
| `404 Not Found` | `NOT_FOUND` | 리소스를 찾을 수 없음 |
| `409 Conflict` | `CONFLICT` | 리소스 충돌 (예: 이미 존재하는 버킷명) |
| `500 Internal Server Error` | `INTERNAL_SERVER_ERROR` | 서버 내부 오류 |

---

## 1. 버킷(Bucket) 관리 API

---

### 1.1 버킷 목록 조회

버킷 목록 전체를 조회합니다. 페이지네이션을 지원합니다.

**Method & URL**
```
GET /api/v1/buckets
```

**Request Headers**
```
Authorization: Bearer <access_token>
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| `page` | `integer` | 선택 | `1` | 조회할 페이지 번호 |
| `size` | `integer` | 선택 | `20` | 페이지당 항목 수 (최대 100) |
| `region` | `string` | 선택 | - | 특정 리전으로 필터링 (예: `kr-1`) |

**Response Body (Success) - `200 OK`**

```json
{
  "total": 3,
  "page": 1,
  "size": 20,
  "buckets": [
    {
      "id": "bkt-a1b2c3d4",
      "name": "my-app-assets",
      "region": "kr-1",
      "accessControl": "private",
      "objectCount": 1523,
      "totalSize": 10737418240,
      "totalSizeReadable": "10.0 GB",
      "createdAt": "2026-01-15T09:30:00Z"
    },
    {
      "id": "bkt-e5f6g7h8",
      "name": "public-static-files",
      "region": "kr-2",
      "accessControl": "public",
      "objectCount": 342,
      "totalSize": 524288000,
      "totalSizeReadable": "500.0 MB",
      "createdAt": "2026-03-22T14:10:00Z"
    },
    {
      "id": "bkt-i9j0k1l2",
      "name": "backup-data-2026",
      "region": "us-east-1",
      "accessControl": "private",
      "objectCount": 0,
      "totalSize": 0,
      "totalSizeReadable": "0 B",
      "createdAt": "2026-06-01T00:00:00Z"
    }
  ]
}
```

**Response Body (Error)**

```json
// 401 Unauthorized - 인증 토큰 누락 또는 만료
{
  "code": "UNAUTHORIZED",
  "message": "인증 토큰이 유효하지 않거나 만료되었습니다.",
  "timestamp": "2026-06-30T12:00:00Z"
}
```

---

### 1.2 버킷 생성

새로운 버킷을 생성합니다.

**Method & URL**
```
POST /api/v1/buckets
```

**Request Headers**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `name` | `string` | 필수 | 버킷 이름 (소문자, 숫자, 하이픈만 허용 / 3~63자) |
| `region` | `string` | 필수 | 버킷을 생성할 리전 코드 (예: `kr-1`, `us-east-1`) |
| `accessControl` | `string` | 필수 | 공개 여부 (`public` 또는 `private`) |

```json
{
  "name": "my-new-bucket",
  "region": "kr-1",
  "accessControl": "private"
}
```

**Response Body (Success) - `201 Created`**

```json
{
  "id": "bkt-m3n4o5p6",
  "name": "my-new-bucket",
  "region": "kr-1",
  "accessControl": "private",
  "objectCount": 0,
  "totalSize": 0,
  "totalSizeReadable": "0 B",
  "createdAt": "2026-06-30T12:00:00Z"
}
```

**Response Body (Error)**

```json
// 400 Bad Request - 버킷 이름 유효성 오류
{
  "code": "INVALID_REQUEST",
  "message": "버킷 이름은 소문자, 숫자, 하이픈(-)만 사용할 수 있으며, 3자 이상 63자 이하여야 합니다.",
  "timestamp": "2026-06-30T12:00:00Z"
}

// 409 Conflict - 이미 존재하는 버킷 이름
{
  "code": "CONFLICT",
  "message": "이미 사용 중인 버킷 이름입니다. 다른 이름을 입력해 주세요.",
  "timestamp": "2026-06-30T12:00:00Z"
}
```

---

### 1.3 버킷 삭제

지정한 버킷을 삭제합니다. 버킷 내에 오브젝트가 존재하면 삭제할 수 없습니다.

**Method & URL**
```
DELETE /api/v1/buckets/{bucketId}
```

**Request Headers**
```
Authorization: Bearer <access_token>
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `bucketId` | `string` | 필수 | 삭제할 버킷의 고유 ID |

**Response Body (Success) - `204 No Content`**

```
응답 본문 없음
```

**Response Body (Error)**

```json
// 404 Not Found - 버킷이 존재하지 않음
{
  "code": "NOT_FOUND",
  "message": "해당 버킷을 찾을 수 없습니다.",
  "timestamp": "2026-06-30T12:00:00Z"
}

// 409 Conflict - 버킷이 비어 있지 않음
{
  "code": "CONFLICT",
  "message": "버킷에 오브젝트가 존재합니다. 모든 오브젝트를 삭제한 후 다시 시도해 주세요.",
  "timestamp": "2026-06-30T12:00:00Z"
}
```

---

## 2. 오브젝트(Object) 관리 API

---

### 2.1 오브젝트 목록 조회

특정 버킷 내의 오브젝트 목록을 조회합니다. `prefix`를 사용하여 폴더 구조를 탐색할 수 있습니다.

**Method & URL**
```
GET /api/v1/buckets/{bucketId}/objects
```

**Request Headers**
```
Authorization: Bearer <access_token>
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `bucketId` | `string` | 필수 | 조회할 버킷의 고유 ID |

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| `prefix` | `string` | 선택 | `""` | 조회할 폴더 경로 (예: `images/2026/`) |
| `delimiter` | `string` | 선택 | `/` | 폴더 구분자. 설정 시 공통 접두사(가상 폴더)를 반환 |
| `page` | `integer` | 선택 | `1` | 조회할 페이지 번호 |
| `size` | `integer` | 선택 | `50` | 페이지당 항목 수 (최대 200) |
| `sort` | `string` | 선택 | `name` | 정렬 기준 (`name`, `size`, `lastModified`) |
| `order` | `string` | 선택 | `asc` | 정렬 방향 (`asc`, `desc`) |

**Response Body (Success) - `200 OK`**

```json
{
  "bucketId": "bkt-a1b2c3d4",
  "prefix": "images/2026/",
  "delimiter": "/",
  "total": 4,
  "page": 1,
  "size": 50,
  "folders": [
    {
      "type": "folder",
      "prefix": "images/2026/january/"
    },
    {
      "type": "folder",
      "prefix": "images/2026/february/"
    }
  ],
  "objects": [
    {
      "type": "object",
      "key": "images/2026/banner.png",
      "name": "banner.png",
      "extension": "png",
      "size": 204800,
      "sizeReadable": "200.0 KB",
      "contentType": "image/png",
      "lastModified": "2026-06-28T08:15:00Z",
      "etag": "d41d8cd98f00b204e9800998ecf8427e"
    },
    {
      "type": "object",
      "key": "images/2026/logo.svg",
      "name": "logo.svg",
      "extension": "svg",
      "size": 4096,
      "sizeReadable": "4.0 KB",
      "contentType": "image/svg+xml",
      "lastModified": "2026-05-10T11:00:00Z",
      "etag": "a87ff679a2f3e71d9181a67b7542122c"
    }
  ]
}
```

**Response Body (Error)**

```json
// 404 Not Found - 버킷이 존재하지 않음
{
  "code": "NOT_FOUND",
  "message": "해당 버킷을 찾을 수 없습니다.",
  "timestamp": "2026-06-30T12:00:00Z"
}
```

---

### 2.2 오브젝트 단일 업로드

단일 파일(최대 100MB)을 업로드합니다. 대용량 파일은 [멀티파트 업로드](#23-멀티파트-업로드-초기화)를 사용하세요.

**Method & URL**
```
POST /api/v1/buckets/{bucketId}/objects
```

**Request Headers**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `bucketId` | `string` | 필수 | 업로드할 버킷의 고유 ID |

**Request Body (multipart/form-data)**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `file` | `file` | 필수 | 업로드할 파일 바이너리 |
| `key` | `string` | 필수 | 저장될 경로 및 파일명 (예: `images/2026/photo.jpg`) |
| `contentType` | `string` | 선택 | 파일의 MIME 타입. 미입력 시 서버가 자동 감지 |
| `accessControl` | `string` | 선택 | 오브젝트 공개 여부 (`public`, `private`). 미입력 시 버킷 설정 상속 |

**Response Body (Success) - `201 Created`**

```json
{
  "key": "images/2026/photo.jpg",
  "name": "photo.jpg",
  "extension": "jpg",
  "size": 2097152,
  "sizeReadable": "2.0 MB",
  "contentType": "image/jpeg",
  "accessControl": "private",
  "lastModified": "2026-06-30T12:05:00Z",
  "etag": "5d41402abc4b2a76b9719d911017c592"
}
```

**Response Body (Error)**

```json
// 400 Bad Request - 파일 크기 초과
{
  "code": "INVALID_REQUEST",
  "message": "단일 업로드 파일 크기는 100MB를 초과할 수 없습니다. 멀티파트 업로드를 이용해 주세요.",
  "timestamp": "2026-06-30T12:00:00Z"
}

// 404 Not Found - 버킷이 존재하지 않음
{
  "code": "NOT_FOUND",
  "message": "해당 버킷을 찾을 수 없습니다.",
  "timestamp": "2026-06-30T12:00:00Z"
}
```

---

### 2.3 멀티파트 업로드 초기화

100MB 초과 대용량 파일 업로드를 시작합니다. 서버로부터 `uploadId`를 발급받아 이후 파트 업로드에 사용합니다.

**Method & URL**
```
POST /api/v1/buckets/{bucketId}/objects/multipart/init
```

**Request Headers**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `bucketId` | `string` | 필수 | 업로드할 버킷의 고유 ID |

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `key` | `string` | 필수 | 저장될 경로 및 파일명 |
| `contentType` | `string` | 필수 | 파일의 MIME 타입 |
| `totalSize` | `integer` | 필수 | 전체 파일 크기 (bytes) |

```json
{
  "key": "videos/2026/product-demo.mp4",
  "contentType": "video/mp4",
  "totalSize": 524288000
}
```

**Response Body (Success) - `200 OK`**

```json
{
  "uploadId": "upload-x1y2z3a4b5c6",
  "key": "videos/2026/product-demo.mp4",
  "expiresAt": "2026-07-01T12:00:00Z"
}
```

**Response Body (Error)**

```json
// 400 Bad Request - 필수 파라미터 누락
{
  "code": "INVALID_REQUEST",
  "message": "key, contentType, totalSize 필드는 필수입니다.",
  "timestamp": "2026-06-30T12:00:00Z"
}
```

---

### 2.4 멀티파트 업로드 파트 전송

초기화된 멀티파트 업로드에 각 파트(청크)를 순서대로 전송합니다. 파트 크기는 최소 5MB 이상이어야 합니다(마지막 파트 제외).

**Method & URL**
```
PUT /api/v1/buckets/{bucketId}/objects/multipart/{uploadId}/parts/{partNumber}
```

**Request Headers**
```
Authorization: Bearer <access_token>
Content-Type: application/octet-stream
Content-Length: <파트 바이트 크기>
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `bucketId` | `string` | 필수 | 버킷의 고유 ID |
| `uploadId` | `string` | 필수 | 초기화 시 발급받은 업로드 ID |
| `partNumber` | `integer` | 필수 | 파트 번호 (1부터 시작, 최대 10,000) |

**Request Body**

```
(파트 파일의 바이너리 데이터)
```

**Response Body (Success) - `200 OK`**

```json
{
  "partNumber": 1,
  "etag": "b026324c6904b2a9cb4b88d6d61c81d1"
}
```

**Response Body (Error)**

```json
// 400 Bad Request - 파트 크기 미달
{
  "code": "INVALID_REQUEST",
  "message": "마지막 파트를 제외한 각 파트의 크기는 최소 5MB 이상이어야 합니다.",
  "timestamp": "2026-06-30T12:00:00Z"
}
```

---

### 2.5 멀티파트 업로드 완료

모든 파트 전송 완료 후 업로드를 최종 완료합니다.

**Method & URL**
```
POST /api/v1/buckets/{bucketId}/objects/multipart/{uploadId}/complete
```

**Request Headers**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `bucketId` | `string` | 필수 | 버킷의 고유 ID |
| `uploadId` | `string` | 필수 | 초기화 시 발급받은 업로드 ID |

**Request Body**

```json
{
  "parts": [
    { "partNumber": 1, "etag": "b026324c6904b2a9cb4b88d6d61c81d1" },
    { "partNumber": 2, "etag": "26ab0db90d72e28ad0ba1e22ee510510" },
    { "partNumber": 3, "etag": "6d7fce9fee471194aa8b5b6e47267f03" }
  ]
}
```

**Response Body (Success) - `201 Created`**

```json
{
  "key": "videos/2026/product-demo.mp4",
  "name": "product-demo.mp4",
  "extension": "mp4",
  "size": 524288000,
  "sizeReadable": "500.0 MB",
  "contentType": "video/mp4",
  "lastModified": "2026-06-30T12:30:00Z",
  "etag": "d8e8fca2dc0f896fd7cb4cb0031ba249-3"
}
```

**Response Body (Error)**

```json
// 400 Bad Request - 파트 정보 불일치
{
  "code": "INVALID_REQUEST",
  "message": "전송된 파트 정보가 일치하지 않습니다. ETag 값을 확인해 주세요.",
  "timestamp": "2026-06-30T12:00:00Z"
}
```

---

### 2.6 오브젝트 다운로드 URL 생성 (Presigned URL)

지정된 오브젝트에 대한 임시 다운로드 URL(Presigned URL)을 생성합니다. 인증 없이 해당 URL로 직접 다운로드할 수 있습니다.

**Method & URL**
```
GET /api/v1/buckets/{bucketId}/objects/download-url
```

**Request Headers**
```
Authorization: Bearer <access_token>
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `bucketId` | `string` | 필수 | 버킷의 고유 ID |

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| `key` | `string` | 필수 | - | 다운로드할 오브젝트의 전체 경로 (예: `images/2026/banner.png`) |
| `expiresIn` | `integer` | 선택 | `3600` | URL 유효 시간(초). 최소 60, 최대 604800(7일) |

**Response Body (Success) - `200 OK`**

```json
{
  "key": "images/2026/banner.png",
  "presignedUrl": "https://storage.example.com/bkt-a1b2c3d4/images/2026/banner.png?X-Token=abc123&X-Expires=1751299200",
  "expiresAt": "2026-06-30T13:00:00Z"
}
```

**Response Body (Error)**

```json
// 404 Not Found - 오브젝트가 존재하지 않음
{
  "code": "NOT_FOUND",
  "message": "해당 오브젝트를 찾을 수 없습니다.",
  "timestamp": "2026-06-30T12:00:00Z"
}

// 400 Bad Request - 유효 시간 범위 초과
{
  "code": "INVALID_REQUEST",
  "message": "URL 유효 시간은 60초 이상 604800초(7일) 이하여야 합니다.",
  "timestamp": "2026-06-30T12:00:00Z"
}
```

---

### 2.7 오브젝트 삭제 (단일)

지정한 오브젝트 하나를 삭제합니다.

**Method & URL**
```
DELETE /api/v1/buckets/{bucketId}/objects
```

**Request Headers**
```
Authorization: Bearer <access_token>
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `bucketId` | `string` | 필수 | 버킷의 고유 ID |

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `key` | `string` | 필수 | 삭제할 오브젝트의 전체 경로 (예: `images/2026/banner.png`) |

**Response Body (Success) - `204 No Content`**

```
응답 본문 없음
```

**Response Body (Error)**

```json
// 404 Not Found - 오브젝트가 존재하지 않음
{
  "code": "NOT_FOUND",
  "message": "해당 오브젝트를 찾을 수 없습니다.",
  "timestamp": "2026-06-30T12:00:00Z"
}
```

---

### 2.8 오브젝트 다중 삭제

여러 오브젝트를 한 번의 요청으로 삭제합니다. 최대 1,000개까지 지원합니다.

**Method & URL**
```
POST /api/v1/buckets/{bucketId}/objects/batch-delete
```

**Request Headers**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `bucketId` | `string` | 필수 | 버킷의 고유 ID |

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `keys` | `string[]` | 필수 | 삭제할 오브젝트 경로 목록 (최대 1,000개) |

```json
{
  "keys": [
    "images/2026/old-banner.png",
    "images/2026/temp-file.jpg",
    "documents/draft-v1.pdf"
  ]
}
```

**Response Body (Success) - `200 OK`**

일부 실패가 있어도 `200 OK`를 반환하며, 성공/실패 결과를 각각 반환합니다.

```json
{
  "deleted": [
    { "key": "images/2026/old-banner.png" },
    { "key": "documents/draft-v1.pdf" }
  ],
  "failed": [
    {
      "key": "images/2026/temp-file.jpg",
      "code": "NOT_FOUND",
      "message": "해당 오브젝트를 찾을 수 없습니다."
    }
  ]
}
```

**Response Body (Error)**

```json
// 400 Bad Request - 삭제 목록이 비어 있거나 1,000개 초과
{
  "code": "INVALID_REQUEST",
  "message": "삭제 목록은 1개 이상 1000개 이하여야 합니다.",
  "timestamp": "2026-06-30T12:00:00Z"
}
```

---

## 부록: 리전 코드 목록

| 코드 | 리전명 |
|------|--------|
| `kr-1` | 한국 (서울) |
| `kr-2` | 한국 (부산) |
| `us-east-1` | 미국 동부 (버지니아) |
| `us-west-1` | 미국 서부 (오레곤) |
| `jp-1` | 일본 (도쿄) |
| `sg-1` | 싱가포르 |
