from __future__ import annotations

from typing import Any

from fastapi.testclient import TestClient

from app.errors import ApiError
from app.main import app
from app.schemas.storage import BucketCreateRequest
from app.routers import storage as storage_router
from app.services.storage_manager import StorageManager


class FakeStorageManager:
    def __init__(self) -> None:
        self.created_payloads: list[dict[str, Any]] = []
        self.deleted_bucket_ids: list[str] = []
        self.upload_calls: list[dict[str, Any]] = []
        self.multipart_init_calls: list[dict[str, Any]] = []
        self.multipart_part_calls: list[dict[str, Any]] = []
        self.multipart_complete_calls: list[dict[str, Any]] = []
        self.download_url_calls: list[dict[str, Any]] = []
        self.deleted_object_calls: list[dict[str, Any]] = []
        self.batch_delete_calls: list[dict[str, Any]] = []

    def list_buckets(
        self,
        *,
        page: int,
        size: int,
        region: str | None,
    ) -> dict[str, Any]:
        buckets = [
            {
                "id": "bkt-a1b2c3d4",
                "name": "my-app-assets",
                "region": "kr-1",
                "accessControl": "private",
                "objectCount": 1523,
                "totalSize": 10737418240,
                "totalSizeReadable": "10.0 GB",
                "createdAt": "2026-01-15T09:30:00Z",
            },
            {
                "id": "bkt-e5f6g7h8",
                "name": "public-static-files",
                "region": "kr-2",
                "accessControl": "public",
                "objectCount": 342,
                "totalSize": 524288000,
                "totalSizeReadable": "500.0 MB",
                "createdAt": "2026-03-22T14:10:00Z",
            },
        ]
        filtered = [bucket for bucket in buckets if region is None or bucket["region"] == region]
        start = (page - 1) * size
        end = start + size
        return {
            "total": len(filtered),
            "page": page,
            "size": size,
            "buckets": filtered[start:end],
        }

    def create_bucket(self, request: Any) -> dict[str, Any]:
        payload = request.model_dump()
        self.created_payloads.append(payload)
        return {
            "id": "bkt-m3n4o5p6",
            "name": payload["name"],
            "region": payload["region"],
            "accessControl": payload["accessControl"],
            "objectCount": 0,
            "totalSize": 0,
            "totalSizeReadable": "0 B",
            "createdAt": "2026-06-30T12:00:00Z",
        }

    def delete_bucket(self, bucket_id: str) -> None:
        if bucket_id == "missing-bucket":
            raise ApiError(
                status_code=404,
                code="NOT_FOUND",
                message="해당 버킷을 찾을 수 없습니다.",
            )
        if bucket_id == "non-empty-bucket":
            raise ApiError(
                status_code=409,
                code="CONFLICT",
                message="버킷에 오브젝트가 존재합니다. 모든 오브젝트를 삭제한 후 다시 시도해 주세요.",
            )
        self.deleted_bucket_ids.append(bucket_id)

    def list_bucket_objects(
        self,
        *,
        bucket_id: str,
        prefix: str,
        delimiter: str,
        page: int,
        size: int,
        sort: str,
        order: str,
    ) -> dict[str, Any]:
        if bucket_id == "missing-bucket":
            raise ApiError(
                status_code=404,
                code="NOT_FOUND",
                message="해당 버킷을 찾을 수 없습니다.",
            )
        return {
            "bucketId": bucket_id,
            "prefix": prefix,
            "delimiter": delimiter,
            "total": 4,
            "page": page,
            "size": size,
            "folders": [
                {"type": "folder", "prefix": "images/2026/february/"},
                {"type": "folder", "prefix": "images/2026/january/"},
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
                    "etag": "d41d8cd98f00b204e9800998ecf8427e",
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
                    "etag": "a87ff679a2f3e71d9181a67b7542122c",
                },
            ],
        }

    def upload_bucket_object(
        self,
        *,
        bucket_id: str,
        key: str,
        filename: str,
        content: bytes,
        content_type: str | None,
        access_control: str | None,
    ) -> dict[str, Any]:
        if bucket_id == "missing-bucket":
            raise ApiError(
                status_code=404,
                code="NOT_FOUND",
                message="해당 버킷을 찾을 수 없습니다.",
            )
        if len(content) > 100 * 1024 * 1024:
            raise ApiError(
                status_code=400,
                code="INVALID_REQUEST",
                message="단일 업로드 파일 크기는 100MB를 초과할 수 없습니다. 멀티파트 업로드를 이용해 주세요.",
            )
        self.upload_calls.append(
            {
                "bucket_id": bucket_id,
                "key": key,
                "filename": filename,
                "content": content,
                "content_type": content_type,
                "access_control": access_control,
            }
        )
        return {
            "key": key,
            "name": "photo.jpg",
            "extension": "jpg",
            "size": len(content),
            "sizeReadable": "2.0 KB",
            "contentType": content_type or "image/jpeg",
            "accessControl": access_control or "private",
            "lastModified": "2026-06-30T12:05:00Z",
            "etag": "5d41402abc4b2a76b9719d911017c592",
        }

    def init_multipart_upload(self, *, bucket_id: str, key: str, content_type: str, total_size: int) -> dict[str, Any]:
        self.multipart_init_calls.append(
            {
                "bucket_id": bucket_id,
                "key": key,
                "content_type": content_type,
                "total_size": total_size,
            }
        )
        return {
            "uploadId": "upload-x1y2z3a4b5c6",
            "key": key,
            "expiresAt": "2026-07-01T12:00:00Z",
        }

    def upload_multipart_part(
        self,
        *,
        bucket_id: str,
        upload_id: str,
        part_number: int,
        content: bytes,
    ) -> dict[str, Any]:
        self.multipart_part_calls.append(
            {
                "bucket_id": bucket_id,
                "upload_id": upload_id,
                "part_number": part_number,
                "content": content,
            }
        )
        return {
            "partNumber": part_number,
            "etag": "b026324c6904b2a9cb4b88d6d61c81d1",
        }

    def complete_multipart_upload(
        self,
        *,
        bucket_id: str,
        upload_id: str,
        parts: list[dict[str, Any]],
    ) -> dict[str, Any]:
        self.multipart_complete_calls.append(
            {
                "bucket_id": bucket_id,
                "upload_id": upload_id,
                "parts": parts,
            }
        )
        return {
            "key": "videos/2026/product-demo.mp4",
            "name": "product-demo.mp4",
            "extension": "mp4",
            "size": 524288000,
            "sizeReadable": "500.0 MB",
            "contentType": "video/mp4",
            "lastModified": "2026-06-30T12:30:00Z",
            "etag": "d8e8fca2dc0f896fd7cb4cb0031ba249-3",
        }

    def generate_download_url(self, *, bucket_id: str, key: str, expires_in: int) -> dict[str, Any]:
        self.download_url_calls.append(
            {"bucket_id": bucket_id, "key": key, "expires_in": expires_in}
        )
        return {
            "key": key,
            "presignedUrl": "https://storage.example.com/bkt-a1b2c3d4/images/2026/banner.png?X-Token=abc123",
            "expiresAt": "2026-06-30T13:00:00Z",
        }

    def delete_bucket_object(self, *, bucket_id: str, key: str) -> None:
        self.deleted_object_calls.append({"bucket_id": bucket_id, "key": key})

    def batch_delete_bucket_objects(self, *, bucket_id: str, keys: list[str]) -> dict[str, Any]:
        self.batch_delete_calls.append({"bucket_id": bucket_id, "keys": keys})
        return {
            "deleted": [
                {"key": "images/2026/old-banner.png"},
                {"key": "documents/draft-v1.pdf"},
            ],
            "failed": [
                {
                    "key": "images/2026/temp-file.jpg",
                    "code": "NOT_FOUND",
                    "message": "해당 오브젝트를 찾을 수 없습니다.",
                }
            ],
        }


def test_list_buckets_returns_paginated_response() -> None:
    app.dependency_overrides[storage_router.get_storage_manager] = lambda: FakeStorageManager()
    client = TestClient(app)

    try:
        response = client.get(
            "/api/v1/buckets",
            params={"page": 1, "size": 1, "region": "kr-1"},
            headers={"Authorization": "Bearer test-token"},
        )

        assert response.status_code == 200
        assert response.json() == {
            "total": 1,
            "page": 1,
            "size": 1,
            "buckets": [
                {
                    "id": "bkt-a1b2c3d4",
                    "name": "my-app-assets",
                    "region": "kr-1",
                    "accessControl": "private",
                    "objectCount": 1523,
                    "totalSize": 10737418240,
                    "totalSizeReadable": "10.0 GB",
                    "createdAt": "2026-01-15T09:30:00Z",
                }
            ],
        }
    finally:
        app.dependency_overrides.clear()


def test_list_buckets_requires_bearer_token() -> None:
    client = TestClient(app)

    response = client.get("/api/v1/buckets")

    assert response.status_code == 401
    assert response.json()["code"] == "UNAUTHORIZED"
    assert "timestamp" in response.json()


def test_create_bucket_returns_created_bucket() -> None:
    fake_manager = FakeStorageManager()
    app.dependency_overrides[storage_router.get_storage_manager] = lambda: fake_manager
    client = TestClient(app)

    try:
        response = client.post(
            "/api/v1/buckets",
            headers={"Authorization": "Bearer test-token"},
            json={
                "name": "my-new-bucket",
                "region": "kr-1",
                "accessControl": "private",
            },
        )

        assert response.status_code == 201
        assert response.json() == {
            "id": "bkt-m3n4o5p6",
            "name": "my-new-bucket",
            "region": "kr-1",
            "accessControl": "private",
            "objectCount": 0,
            "totalSize": 0,
            "totalSizeReadable": "0 B",
            "createdAt": "2026-06-30T12:00:00Z",
        }
        assert fake_manager.created_payloads == [
            {
                "name": "my-new-bucket",
                "region": "kr-1",
                "accessControl": "private",
            }
        ]
    finally:
        app.dependency_overrides.clear()


def test_create_bucket_rejects_invalid_bucket_name() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/v1/buckets",
        headers={"Authorization": "Bearer test-token"},
        json={
            "name": "Invalid_Bucket_Name",
            "region": "kr-1",
            "accessControl": "private",
        },
    )

    assert response.status_code == 400
    assert response.json()["code"] == "INVALID_REQUEST"
    assert "timestamp" in response.json()


def test_delete_bucket_returns_no_content() -> None:
    fake_manager = FakeStorageManager()
    app.dependency_overrides[storage_router.get_storage_manager] = lambda: fake_manager
    client = TestClient(app)

    try:
        response = client.delete(
            "/api/v1/buckets/bkt-a1b2c3d4",
            headers={"Authorization": "Bearer test-token"},
        )

        assert response.status_code == 204
        assert response.content == b""
        assert fake_manager.deleted_bucket_ids == ["bkt-a1b2c3d4"]
    finally:
        app.dependency_overrides.clear()


def test_delete_bucket_returns_not_found_for_missing_bucket() -> None:
    fake_manager = FakeStorageManager()
    app.dependency_overrides[storage_router.get_storage_manager] = lambda: fake_manager
    client = TestClient(app)

    try:
        response = client.delete(
            "/api/v1/buckets/missing-bucket",
            headers={"Authorization": "Bearer test-token"},
        )

        assert response.status_code == 404
        assert response.json()["code"] == "NOT_FOUND"
        assert response.json()["message"] == "해당 버킷을 찾을 수 없습니다."
    finally:
        app.dependency_overrides.clear()


def test_delete_bucket_returns_conflict_for_non_empty_bucket() -> None:
    fake_manager = FakeStorageManager()
    app.dependency_overrides[storage_router.get_storage_manager] = lambda: fake_manager
    client = TestClient(app)

    try:
        response = client.delete(
            "/api/v1/buckets/non-empty-bucket",
            headers={"Authorization": "Bearer test-token"},
        )

        assert response.status_code == 409
        assert response.json()["code"] == "CONFLICT"
        assert response.json()["message"] == "버킷에 오브젝트가 존재합니다. 모든 오브젝트를 삭제한 후 다시 시도해 주세요."
    finally:
        app.dependency_overrides.clear()


def test_storage_manager_rejects_deleting_non_empty_bucket() -> None:
    manager = StorageManager()
    bucket = manager.create_bucket(
        BucketCreateRequest(
            name="bucket-with-objects",
            region="kr-1",
            accessControl="private",
        )
    )
    manager._bucket_objects[bucket.id] = {"images/banner.png"}  # type: ignore[attr-defined]

    try:
        manager.delete_bucket(bucket.id)
    except ApiError as exc:
        assert exc.status_code == 409
        assert exc.code == "CONFLICT"
        assert exc.message == "버킷에 오브젝트가 존재합니다. 모든 오브젝트를 삭제한 후 다시 시도해 주세요."
    else:
        raise AssertionError("Expected ApiError for non-empty bucket")


def test_storage_manager_lists_bucket_objects_with_prefix_and_delimiter() -> None:
    manager = StorageManager()
    bucket = manager.create_bucket(
        BucketCreateRequest(
            name="assets-bucket",
            region="kr-1",
            accessControl="private",
        )
    )
    manager._bucket_object_details[bucket.id] = {  # type: ignore[attr-defined]
        "images/2026/banner.png": {
            "name": "banner.png",
            "extension": "png",
            "size": 204800,
            "contentType": "image/png",
            "lastModified": "2026-06-28T08:15:00Z",
            "etag": "etag-banner",
        },
        "images/2026/logo.svg": {
            "name": "logo.svg",
            "extension": "svg",
            "size": 4096,
            "contentType": "image/svg+xml",
            "lastModified": "2026-05-10T11:00:00Z",
            "etag": "etag-logo",
        },
        "images/2026/january/photo.jpg": {
            "name": "photo.jpg",
            "extension": "jpg",
            "size": 1024,
            "contentType": "image/jpeg",
            "lastModified": "2026-01-10T00:00:00Z",
            "etag": "etag-photo",
        },
        "images/2026/february/poster.jpg": {
            "name": "poster.jpg",
            "extension": "jpg",
            "size": 2048,
            "contentType": "image/jpeg",
            "lastModified": "2026-02-10T00:00:00Z",
            "etag": "etag-poster",
        },
    }

    response = manager.list_bucket_objects(
        bucket_id=bucket.id,
        prefix="images/2026/",
        delimiter="/",
        page=1,
        size=50,
        sort="name",
        order="asc",
    )

    assert response.bucketId == bucket.id
    assert response.total == 4
    assert [folder.prefix for folder in response.folders] == [
        "images/2026/february/",
        "images/2026/january/",
    ]
    assert [item.key for item in response.objects] == [
        "images/2026/banner.png",
        "images/2026/logo.svg",
    ]


def test_list_bucket_objects_returns_folders_and_objects() -> None:
    fake_manager = FakeStorageManager()
    app.dependency_overrides[storage_router.get_storage_manager] = lambda: fake_manager
    client = TestClient(app)

    try:
        response = client.get(
            "/api/v1/buckets/bkt-a1b2c3d4/objects",
            headers={"Authorization": "Bearer test-token"},
            params={
                "prefix": "images/2026/",
                "delimiter": "/",
                "page": 1,
                "size": 50,
                "sort": "name",
                "order": "asc",
            },
        )

        assert response.status_code == 200
        assert response.json() == {
            "bucketId": "bkt-a1b2c3d4",
            "prefix": "images/2026/",
            "delimiter": "/",
            "total": 4,
            "page": 1,
            "size": 50,
            "folders": [
                {"type": "folder", "prefix": "images/2026/february/"},
                {"type": "folder", "prefix": "images/2026/january/"},
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
                    "etag": "d41d8cd98f00b204e9800998ecf8427e",
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
                    "etag": "a87ff679a2f3e71d9181a67b7542122c",
                },
            ],
        }
    finally:
        app.dependency_overrides.clear()


def test_list_bucket_objects_returns_not_found_for_missing_bucket() -> None:
    fake_manager = FakeStorageManager()
    app.dependency_overrides[storage_router.get_storage_manager] = lambda: fake_manager
    client = TestClient(app)

    try:
        response = client.get(
            "/api/v1/buckets/missing-bucket/objects",
            headers={"Authorization": "Bearer test-token"},
        )

        assert response.status_code == 404
        assert response.json()["code"] == "NOT_FOUND"
        assert response.json()["message"] == "해당 버킷을 찾을 수 없습니다."
    finally:
        app.dependency_overrides.clear()


def test_upload_bucket_object_returns_created_object() -> None:
    fake_manager = FakeStorageManager()
    app.dependency_overrides[storage_router.get_storage_manager] = lambda: fake_manager
    client = TestClient(app)

    try:
        response = client.post(
            "/api/v1/buckets/bkt-a1b2c3d4/objects",
            headers={"Authorization": "Bearer test-token"},
            files={"file": ("photo.jpg", b"x" * 2048, "image/jpeg")},
            data={
                "key": "images/2026/photo.jpg",
                "contentType": "image/jpeg",
                "accessControl": "private",
            },
        )

        assert response.status_code == 201
        assert response.json() == {
            "key": "images/2026/photo.jpg",
            "name": "photo.jpg",
            "extension": "jpg",
            "size": 2048,
            "sizeReadable": "2.0 KB",
            "contentType": "image/jpeg",
            "accessControl": "private",
            "lastModified": "2026-06-30T12:05:00Z",
            "etag": "5d41402abc4b2a76b9719d911017c592",
        }
        assert fake_manager.upload_calls[0]["bucket_id"] == "bkt-a1b2c3d4"
        assert fake_manager.upload_calls[0]["key"] == "images/2026/photo.jpg"
        assert fake_manager.upload_calls[0]["filename"] == "photo.jpg"
    finally:
        app.dependency_overrides.clear()


def test_upload_bucket_object_returns_not_found_for_missing_bucket() -> None:
    fake_manager = FakeStorageManager()
    app.dependency_overrides[storage_router.get_storage_manager] = lambda: fake_manager
    client = TestClient(app)

    try:
        response = client.post(
            "/api/v1/buckets/missing-bucket/objects",
            headers={"Authorization": "Bearer test-token"},
            files={"file": ("photo.jpg", b"abc", "image/jpeg")},
            data={"key": "images/2026/photo.jpg"},
        )

        assert response.status_code == 404
        assert response.json()["code"] == "NOT_FOUND"
        assert response.json()["message"] == "해당 버킷을 찾을 수 없습니다."
    finally:
        app.dependency_overrides.clear()


def test_storage_manager_uploads_bucket_object_and_updates_bucket_stats() -> None:
    manager = StorageManager()
    bucket = manager.create_bucket(
        BucketCreateRequest(
            name="upload-bucket",
            region="kr-1",
            accessControl="private",
        )
    )

    response = manager.upload_bucket_object(
        bucket_id=bucket.id,
        key="images/2026/photo.jpg",
        filename="photo.jpg",
        content=b"x" * 2048,
        content_type="image/jpeg",
        access_control=None,
    )

    assert response.key == "images/2026/photo.jpg"
    assert response.name == "photo.jpg"
    assert response.size == 2048
    assert response.sizeReadable == "2.0 KB"
    assert response.contentType == "image/jpeg"
    assert response.accessControl == "private"
    assert manager._buckets[bucket.id].object_count == 1  # type: ignore[attr-defined]
    assert manager._buckets[bucket.id].total_size == 2048  # type: ignore[attr-defined]


def test_init_multipart_upload_returns_upload_id() -> None:
    fake_manager = FakeStorageManager()
    app.dependency_overrides[storage_router.get_storage_manager] = lambda: fake_manager
    client = TestClient(app)

    try:
        response = client.post(
            "/api/v1/buckets/bkt-a1b2c3d4/objects/multipart/init",
            headers={"Authorization": "Bearer test-token"},
            json={
                "key": "videos/2026/product-demo.mp4",
                "contentType": "video/mp4",
                "totalSize": 524288000,
            },
        )
        assert response.status_code == 200
        assert response.json()["uploadId"] == "upload-x1y2z3a4b5c6"
    finally:
        app.dependency_overrides.clear()


def test_upload_multipart_part_returns_etag() -> None:
    fake_manager = FakeStorageManager()
    app.dependency_overrides[storage_router.get_storage_manager] = lambda: fake_manager
    client = TestClient(app)

    try:
        response = client.put(
            "/api/v1/buckets/bkt-a1b2c3d4/objects/multipart/upload-x1y2z3a4b5c6/parts/1",
            headers={"Authorization": "Bearer test-token", "Content-Type": "application/octet-stream"},
            content=b"x" * (5 * 1024 * 1024),
        )
        assert response.status_code == 200
        assert response.json() == {
            "partNumber": 1,
            "etag": "b026324c6904b2a9cb4b88d6d61c81d1",
        }
    finally:
        app.dependency_overrides.clear()


def test_complete_multipart_upload_returns_created_object() -> None:
    fake_manager = FakeStorageManager()
    app.dependency_overrides[storage_router.get_storage_manager] = lambda: fake_manager
    client = TestClient(app)

    try:
        response = client.post(
            "/api/v1/buckets/bkt-a1b2c3d4/objects/multipart/upload-x1y2z3a4b5c6/complete",
            headers={"Authorization": "Bearer test-token"},
            json={
                "parts": [
                    {"partNumber": 1, "etag": "etag-1"},
                    {"partNumber": 2, "etag": "etag-2"},
                ]
            },
        )
        assert response.status_code == 201
        assert response.json()["key"] == "videos/2026/product-demo.mp4"
    finally:
        app.dependency_overrides.clear()


def test_generate_download_url_returns_presigned_url() -> None:
    fake_manager = FakeStorageManager()
    app.dependency_overrides[storage_router.get_storage_manager] = lambda: fake_manager
    client = TestClient(app)

    try:
        response = client.get(
            "/api/v1/buckets/bkt-a1b2c3d4/objects/download-url",
            headers={"Authorization": "Bearer test-token"},
            params={"key": "images/2026/banner.png", "expiresIn": 3600},
        )
        assert response.status_code == 200
        assert response.json()["key"] == "images/2026/banner.png"
        assert "presignedUrl" in response.json()
    finally:
        app.dependency_overrides.clear()


def test_delete_bucket_object_returns_no_content() -> None:
    fake_manager = FakeStorageManager()
    app.dependency_overrides[storage_router.get_storage_manager] = lambda: fake_manager
    client = TestClient(app)

    try:
        response = client.delete(
            "/api/v1/buckets/bkt-a1b2c3d4/objects",
            headers={"Authorization": "Bearer test-token"},
            params={"key": "images/2026/banner.png"},
        )
        assert response.status_code == 204
        assert fake_manager.deleted_object_calls == [
            {"bucket_id": "bkt-a1b2c3d4", "key": "images/2026/banner.png"}
        ]
    finally:
        app.dependency_overrides.clear()


def test_batch_delete_bucket_objects_returns_deleted_and_failed() -> None:
    fake_manager = FakeStorageManager()
    app.dependency_overrides[storage_router.get_storage_manager] = lambda: fake_manager
    client = TestClient(app)

    try:
        response = client.post(
            "/api/v1/buckets/bkt-a1b2c3d4/objects/batch-delete",
            headers={"Authorization": "Bearer test-token"},
            json={
                "keys": [
                    "images/2026/old-banner.png",
                    "images/2026/temp-file.jpg",
                    "documents/draft-v1.pdf",
                ]
            },
        )
        assert response.status_code == 200
        assert response.json()["deleted"][0]["key"] == "images/2026/old-banner.png"
        assert response.json()["failed"][0]["code"] == "NOT_FOUND"
    finally:
        app.dependency_overrides.clear()


def test_storage_manager_multipart_flow_download_and_deletes() -> None:
    manager = StorageManager()
    bucket = manager.create_bucket(
        BucketCreateRequest(name="multipart-bucket", region="kr-1", accessControl="private")
    )

    init_response = manager.init_multipart_upload(
        bucket_id=bucket.id,
        key="videos/2026/product-demo.mp4",
        content_type="video/mp4",
        total_size=(6 * 1024 * 1024) + 1024,
    )
    manager.upload_multipart_part(
        bucket_id=bucket.id,
        upload_id=init_response.uploadId,
        part_number=1,
        content=b"a" * (5 * 1024 * 1024),
    )
    etag2 = manager.upload_multipart_part(
        bucket_id=bucket.id,
        upload_id=init_response.uploadId,
        part_number=2,
        content=b"b" * (1024 * 1024 + 1024),
    )
    complete_response = manager.complete_multipart_upload(
        bucket_id=bucket.id,
        upload_id=init_response.uploadId,
        parts=[
            {"partNumber": 1, "etag": manager._multipart_uploads[init_response.uploadId]["parts"][1]["etag"]},  # type: ignore[attr-defined]
            {"partNumber": 2, "etag": etag2.etag},
        ],
    )

    assert complete_response.key == "videos/2026/product-demo.mp4"
    download_response = manager.generate_download_url(
        bucket_id=bucket.id,
        key="videos/2026/product-demo.mp4",
        expires_in=3600,
    )
    assert download_response.key == "videos/2026/product-demo.mp4"

    delete_response = manager.batch_delete_bucket_objects(
        bucket_id=bucket.id,
        keys=["videos/2026/product-demo.mp4", "missing.mp4"],
    )
    assert delete_response["deleted"] == [{"key": "videos/2026/product-demo.mp4"}]
    assert delete_response["failed"][0]["code"] == "NOT_FOUND"

    try:
        manager.delete_bucket_object(bucket_id=bucket.id, key="missing.mp4")
    except ApiError as exc:
        assert exc.status_code == 404
        assert exc.code == "NOT_FOUND"
    else:
        raise AssertionError("Expected ApiError for missing object")
