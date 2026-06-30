# AppManager Backend

`API.md`를 기준으로 Object Storage API를 순차 구현 중입니다.

## Run

개발 서버 실행:

```bash
uv run uvicorn app.main:app --reload
```

기본 주소:

```text
http://127.0.0.1:8000
```

헬스 체크:

```bash
curl http://127.0.0.1:8000/health
```

## Implemented API

현재 실행 가능한 문서 기준 API:

- `GET /api/v1/buckets`
- `POST /api/v1/buckets`
- `DELETE /api/v1/buckets/{bucketId}`
- `GET /api/v1/buckets/{bucketId}/objects`
- `POST /api/v1/buckets/{bucketId}/objects`
- `POST /api/v1/buckets/{bucketId}/objects/multipart/init`
- `PUT /api/v1/buckets/{bucketId}/objects/multipart/{uploadId}/parts/{partNumber}`
- `POST /api/v1/buckets/{bucketId}/objects/multipart/{uploadId}/complete`
- `GET /api/v1/buckets/{bucketId}/objects/download-url`
- `DELETE /api/v1/buckets/{bucketId}/objects`
- `POST /api/v1/buckets/{bucketId}/objects/batch-delete`

요청 예시:

```bash
curl \
  -H "Authorization: Bearer test-token" \
  "http://127.0.0.1:8000/api/v1/buckets?page=1&size=20&region=kr-1"
```

성공 응답 예시:

```json
{
  "total": 0,
  "page": 1,
  "size": 20,
  "buckets": []
}
```

인증 헤더가 없거나 `Bearer <token>` 형식이 아니면 `401` 에러가 반환됩니다.

버킷 생성 예시:

```bash
curl \
  -X POST \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-new-bucket","region":"kr-1","accessControl":"private"}' \
  "http://127.0.0.1:8000/api/v1/buckets"
```

버킷 이름이 문서 규칙을 벗어나면 `400`, 이미 존재하는 이름이면 `409`가 반환됩니다.

버킷 삭제 예시:

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer test-token" \
  "http://127.0.0.1:8000/api/v1/buckets/bkt-a1b2c3d4"
```

버킷이 없으면 `404`, 버킷에 오브젝트가 남아 있으면 `409`가 반환됩니다.

오브젝트 목록 조회 예시:

```bash
curl \
  -H "Authorization: Bearer test-token" \
  "http://127.0.0.1:8000/api/v1/buckets/bkt-a1b2c3d4/objects?prefix=images/2026/&delimiter=/&page=1&size=50&sort=name&order=asc"
```

응답에는 `folders`와 `objects`가 함께 포함되며, 버킷이 없으면 `404`가 반환됩니다.

단일 오브젝트 업로드 예시:

```bash
curl \
  -X POST \
  -H "Authorization: Bearer test-token" \
  -F "file=@./photo.jpg" \
  -F "key=images/2026/photo.jpg" \
  -F "contentType=image/jpeg" \
  -F "accessControl=private" \
  "http://127.0.0.1:8000/api/v1/buckets/bkt-a1b2c3d4/objects"
```

단일 업로드는 100MB를 초과할 수 없고, 초과 시 `400`이 반환됩니다. 버킷이 없으면 `404`가 반환됩니다.

멀티파트 업로드 초기화 예시:

```bash
curl \
  -X POST \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{"key":"videos/2026/product-demo.mp4","contentType":"video/mp4","totalSize":524288000}' \
  "http://127.0.0.1:8000/api/v1/buckets/bkt-a1b2c3d4/objects/multipart/init"
```

멀티파트 파트 업로드 예시:

```bash
curl \
  -X PUT \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @./part-1.bin \
  "http://127.0.0.1:8000/api/v1/buckets/bkt-a1b2c3d4/objects/multipart/upload-x1y2z3a4b5c6/parts/1"
```

멀티파트 업로드 완료 예시:

```bash
curl \
  -X POST \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{"parts":[{"partNumber":1,"etag":"etag-1"},{"partNumber":2,"etag":"etag-2"}]}' \
  "http://127.0.0.1:8000/api/v1/buckets/bkt-a1b2c3d4/objects/multipart/upload-x1y2z3a4b5c6/complete"
```

다운로드 URL 생성 예시:

```bash
curl \
  -H "Authorization: Bearer test-token" \
  "http://127.0.0.1:8000/api/v1/buckets/bkt-a1b2c3d4/objects/download-url?key=images/2026/banner.png&expiresIn=3600"
```

단일 오브젝트 삭제 예시:

```bash
curl \
  -X DELETE \
  -H "Authorization: Bearer test-token" \
  "http://127.0.0.1:8000/api/v1/buckets/bkt-a1b2c3d4/objects?key=images/2026/banner.png"
```

다중 오브젝트 삭제 예시:

```bash
curl \
  -X POST \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{"keys":["images/2026/old-banner.png","images/2026/temp-file.jpg","documents/draft-v1.pdf"]}' \
  "http://127.0.0.1:8000/api/v1/buckets/bkt-a1b2c3d4/objects/batch-delete"
```

## Test

현재 API 테스트 실행:

```bash
uv run pytest tests/test_storage_api.py -q
```
