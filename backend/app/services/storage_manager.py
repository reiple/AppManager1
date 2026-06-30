from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

import boto3
from botocore.client import BaseClient
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException, status

from app.errors import ApiError
from app.models.storage import Bucket, StorageConnection
from app.schemas.storage import (
    BatchDeleteResponse,
    BucketCreateRequest,
    BucketListResponse,
    BucketObjectFolder,
    BucketObjectItem,
    BucketObjectListResponse,
    DownloadUrlResponse,
    MultipartUploadCompleteResponse,
    MultipartUploadInitResponse,
    MultipartUploadPartResponse,
    BucketUploadResponse,
    BucketSummary,
    ConnectionTestResponse,
    DeleteObjectResponse,
    ObjectInfo,
    PresignedUrlRequest,
    PresignedUrlResponse,
    StorageCreate,
    StorageResponse,
)
from app.services.storage_repository import InMemoryStorageRepository, StorageRepository


class StorageManager:
    def __init__(self, repository: StorageRepository | None = None) -> None:
        self._repository = repository or InMemoryStorageRepository()
        self._clients: dict[str, BaseClient] = {}
        self._buckets: dict[str, Bucket] = {}
        self._bucket_objects: dict[str, set[str]] = {}
        self._bucket_object_details: dict[str, dict[str, dict[str, Any]]] = {}
        self._multipart_uploads: dict[str, dict[str, Any]] = {}

    def register_storage(self, request: StorageCreate) -> StorageResponse:
        storage_id = str(uuid4())
        storage = StorageConnection(
            storage_id=storage_id,
            name=request.name,
            access_key=request.access_key,
            secret_key=request.secret_key.get_secret_value(),
            endpoint_url=str(request.endpoint_url) if request.endpoint_url is not None else None,
            bucket_name=request.bucket_name,
            region_name=request.region_name,
        )
        self._repository.save(storage)
        return self._to_response(storage)

    def list_storages(self) -> list[StorageResponse]:
        return [self._to_response(storage) for storage in self._repository.list()]

    def list_buckets(self, *, page: int, size: int, region: str | None) -> BucketListResponse:
        buckets = [
            self._to_bucket_summary(bucket)
            for bucket in self._buckets.values()
            if region is None or bucket.region == region
        ]
        start = (page - 1) * size
        end = start + size
        return BucketListResponse(
            total=len(buckets),
            page=page,
            size=size,
            buckets=buckets[start:end],
        )

    def create_bucket(self, request: BucketCreateRequest) -> BucketSummary:
        if any(bucket.name == request.name for bucket in self._buckets.values()):
            raise ApiError(
                status_code=409,
                code="CONFLICT",
                message="이미 사용 중인 버킷 이름입니다. 다른 이름을 입력해 주세요.",
            )

        bucket = Bucket(
            id=f"bkt-{uuid4().hex[:8]}",
            name=request.name,
            region=request.region,
            access_control=request.accessControl,
            object_count=0,
            total_size=0,
            created_at=datetime.now(timezone.utc),
        )
        self._buckets[bucket.id] = bucket
        self._bucket_objects[bucket.id] = set()
        self._bucket_object_details[bucket.id] = {}
        return self._to_bucket_summary(bucket)

    def delete_bucket(self, bucket_id: str) -> None:
        if bucket_id not in self._buckets:
            raise ApiError(
                status_code=404,
                code="NOT_FOUND",
                message="해당 버킷을 찾을 수 없습니다.",
            )
        if self._bucket_objects.get(bucket_id):
            raise ApiError(
                status_code=409,
                code="CONFLICT",
                message="버킷에 오브젝트가 존재합니다. 모든 오브젝트를 삭제한 후 다시 시도해 주세요.",
            )
        self._buckets.pop(bucket_id)
        self._bucket_objects.pop(bucket_id, None)
        self._bucket_object_details.pop(bucket_id, None)

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
    ) -> BucketObjectListResponse:
        bucket = self._buckets.get(bucket_id)
        if bucket is None:
            raise ApiError(
                status_code=404,
                code="NOT_FOUND",
                message="해당 버킷을 찾을 수 없습니다.",
            )

        object_details = self._bucket_object_details.get(bucket_id, {})
        matching_keys = [key for key in object_details if key.startswith(prefix)]

        folder_prefixes: set[str] = set()
        object_items: list[BucketObjectItem] = []
        for key in matching_keys:
            remainder = key[len(prefix) :]
            if delimiter and delimiter in remainder:
                folder_name = remainder.split(delimiter, 1)[0]
                folder_prefixes.add(f"{prefix}{folder_name}{delimiter}")
                continue

            details = object_details[key]
            object_items.append(
                BucketObjectItem(
                    type="object",
                    key=key,
                    name=details["name"],
                    extension=details["extension"],
                    size=details["size"],
                    sizeReadable=self._format_bytes(details["size"]),
                    contentType=details["contentType"],
                    lastModified=details["lastModified"],
                    etag=details["etag"],
                )
            )

        reverse = order == "desc"
        folders = [
            BucketObjectFolder(type="folder", prefix=folder_prefix)
            for folder_prefix in sorted(folder_prefixes, reverse=reverse)
        ]
        object_items.sort(key=lambda item: self._object_sort_value(item, sort), reverse=reverse)

        start = (page - 1) * size
        end = start + size
        paged_objects = object_items[start:end]
        total = len(folders) + len(object_items)

        return BucketObjectListResponse(
            bucketId=bucket.id,
            prefix=prefix,
            delimiter=delimiter,
            total=total,
            page=page,
            size=size,
            folders=folders,
            objects=paged_objects,
        )

    def upload_bucket_object(
        self,
        *,
        bucket_id: str,
        key: str,
        filename: str,
        content: bytes,
        content_type: str | None,
        access_control: str | None,
    ) -> BucketUploadResponse:
        bucket = self._buckets.get(bucket_id)
        if bucket is None:
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

        resolved_content_type = content_type or "application/octet-stream"
        resolved_access_control = access_control or bucket.access_control
        now = datetime.now(timezone.utc)
        extension = filename.rsplit(".", 1)[-1] if "." in filename else ""
        etag = uuid4().hex

        self._bucket_objects[bucket_id].add(key)
        self._bucket_object_details[bucket_id][key] = {
            "name": filename,
            "extension": extension,
            "size": len(content),
            "contentType": resolved_content_type,
            "lastModified": now,
            "etag": etag,
            "accessControl": resolved_access_control,
        }

        updated_bucket = Bucket(
            id=bucket.id,
            name=bucket.name,
            region=bucket.region,
            access_control=bucket.access_control,
            object_count=len(self._bucket_objects[bucket_id]),
            total_size=sum(details["size"] for details in self._bucket_object_details[bucket_id].values()),
            created_at=bucket.created_at,
        )
        self._buckets[bucket_id] = updated_bucket

        return BucketUploadResponse(
            key=key,
            name=filename,
            extension=extension,
            size=len(content),
            sizeReadable=self._format_bytes(len(content)),
            contentType=resolved_content_type,
            accessControl=resolved_access_control,  # type: ignore[arg-type]
            lastModified=now,
            etag=etag,
        )

    def init_multipart_upload(
        self,
        *,
        bucket_id: str,
        key: str,
        content_type: str,
        total_size: int,
    ) -> MultipartUploadInitResponse:
        bucket = self._buckets.get(bucket_id)
        if bucket is None:
            raise ApiError(status_code=404, code="NOT_FOUND", message="해당 버킷을 찾을 수 없습니다.")

        upload_id = f"upload-{uuid4().hex[:12]}"
        expires_at = datetime.now(timezone.utc).replace(microsecond=0)
        expires_at = expires_at.replace(hour=expires_at.hour)  # no-op for clarity retention
        self._multipart_uploads[upload_id] = {
            "bucket_id": bucket_id,
            "key": key,
            "content_type": content_type,
            "total_size": total_size,
            "expires_at": expires_at,
            "parts": {},
        }
        return MultipartUploadInitResponse(
            uploadId=upload_id,
            key=key,
            expiresAt=expires_at,
        )

    def upload_multipart_part(
        self,
        *,
        bucket_id: str,
        upload_id: str,
        part_number: int,
        content: bytes,
    ) -> MultipartUploadPartResponse:
        session = self._get_multipart_upload(bucket_id=bucket_id, upload_id=upload_id)
        uploaded_before = sum(part["size"] for part in session["parts"].values())
        remaining_after = session["total_size"] - uploaded_before - len(content)
        if remaining_after > 0 and len(content) < 5 * 1024 * 1024:
            raise ApiError(
                status_code=400,
                code="INVALID_REQUEST",
                message="마지막 파트를 제외한 각 파트의 크기는 최소 5MB 이상이어야 합니다.",
            )
        etag = uuid4().hex
        session["parts"][part_number] = {"etag": etag, "size": len(content), "content": content}
        return MultipartUploadPartResponse(partNumber=part_number, etag=etag)

    def complete_multipart_upload(
        self,
        *,
        bucket_id: str,
        upload_id: str,
        parts: list[dict[str, Any]],
    ) -> MultipartUploadCompleteResponse:
        session = self._get_multipart_upload(bucket_id=bucket_id, upload_id=upload_id)
        stored_parts = session["parts"]
        for part in parts:
            stored = stored_parts.get(part["partNumber"])
            if stored is None or stored["etag"] != part["etag"]:
                raise ApiError(
                    status_code=400,
                    code="INVALID_REQUEST",
                    message="전송된 파트 정보가 일치하지 않습니다. ETag 값을 확인해 주세요.",
                )

        size = sum(stored_parts[part["partNumber"]]["size"] for part in parts)
        now = datetime.now(timezone.utc)
        key = session["key"]
        name = key.rsplit("/", 1)[-1]
        extension = name.rsplit(".", 1)[-1] if "." in name else ""
        etag = f"{uuid4().hex}-{len(parts)}"
        self._bucket_objects[bucket_id].add(key)
        self._bucket_object_details[bucket_id][key] = {
            "name": name,
            "extension": extension,
            "size": size,
            "contentType": session["content_type"],
            "lastModified": now,
            "etag": etag,
            "accessControl": self._buckets[bucket_id].access_control,
        }
        self._recalculate_bucket_stats(bucket_id)
        self._multipart_uploads.pop(upload_id, None)
        return MultipartUploadCompleteResponse(
            key=key,
            name=name,
            extension=extension,
            size=size,
            sizeReadable=self._format_bytes(size),
            contentType=session["content_type"],
            lastModified=now,
            etag=etag,
        )

    def generate_download_url(self, *, bucket_id: str, key: str, expires_in: int) -> DownloadUrlResponse:
        if not 60 <= expires_in <= 604800:
            raise ApiError(
                status_code=400,
                code="INVALID_REQUEST",
                message="URL 유효 시간은 60초 이상 604800초(7일) 이하여야 합니다.",
            )
        bucket = self._buckets.get(bucket_id)
        if bucket is None or key not in self._bucket_object_details.get(bucket_id, {}):
            raise ApiError(status_code=404, code="NOT_FOUND", message="해당 오브젝트를 찾을 수 없습니다.")
        expires_at = datetime.now(timezone.utc)
        return DownloadUrlResponse(
            key=key,
            presignedUrl=f"https://storage.example.com/{bucket_id}/{key}?X-Expires={expires_in}",
            expiresAt=expires_at,
        )

    def delete_bucket_object(self, *, bucket_id: str, key: str) -> None:
        if bucket_id not in self._buckets or key not in self._bucket_object_details.get(bucket_id, {}):
            raise ApiError(status_code=404, code="NOT_FOUND", message="해당 오브젝트를 찾을 수 없습니다.")
        self._bucket_object_details[bucket_id].pop(key, None)
        self._bucket_objects[bucket_id].discard(key)
        self._recalculate_bucket_stats(bucket_id)

    def batch_delete_bucket_objects(self, *, bucket_id: str, keys: list[str]) -> dict[str, Any]:
        if bucket_id not in self._buckets:
            raise ApiError(status_code=404, code="NOT_FOUND", message="해당 버킷을 찾을 수 없습니다.")
        deleted: list[dict[str, str]] = []
        failed: list[dict[str, str]] = []
        for key in keys:
            if key in self._bucket_object_details.get(bucket_id, {}):
                self._bucket_object_details[bucket_id].pop(key, None)
                self._bucket_objects[bucket_id].discard(key)
                deleted.append({"key": key})
            else:
                failed.append(
                    {
                        "key": key,
                        "code": "NOT_FOUND",
                        "message": "해당 오브젝트를 찾을 수 없습니다.",
                    }
                )
        self._recalculate_bucket_stats(bucket_id)
        return BatchDeleteResponse(deleted=deleted, failed=failed).model_dump()

    def get_storage(self, storage_id: str) -> StorageResponse:
        return self._to_response(self._get_storage_or_404(storage_id))

    def delete_storage(self, storage_id: str) -> None:
        self._get_storage_or_404(storage_id)
        self._repository.delete(storage_id)
        self._clients.pop(storage_id, None)

    def test_connection(self, storage_id: str) -> ConnectionTestResponse:
        storage = self._get_storage_or_404(storage_id)
        client = self._get_client(storage)
        try:
            client.head_bucket(Bucket=storage.bucket_name)
        except (ClientError, BotoCoreError) as exc:
            self._raise_storage_error(exc)
        return ConnectionTestResponse(storage_id=storage_id, ok=True, message="Connection succeeded")

    def create_presigned_url(self, storage_id: str, request: PresignedUrlRequest) -> PresignedUrlResponse:
        storage = self._get_storage_or_404(storage_id)
        client = self._get_client(storage)
        params: dict[str, Any] = {"Bucket": storage.bucket_name, "Key": request.object_key}
        if request.method == "put_object" and request.content_type is not None:
            params["ContentType"] = request.content_type

        try:
            url = client.generate_presigned_url(
                ClientMethod=request.method,
                Params=params,
                ExpiresIn=request.expires_in,
            )
        except (ClientError, BotoCoreError) as exc:
            self._raise_storage_error(exc)

        return PresignedUrlResponse(
            storage_id=storage_id,
            url=url,
            method=request.method,
            expires_in=request.expires_in,
        )

    def list_objects(self, storage_id: str, prefix: str | None = None) -> list[ObjectInfo]:
        storage = self._get_storage_or_404(storage_id)
        client = self._get_client(storage)
        params: dict[str, Any] = {"Bucket": storage.bucket_name}
        if prefix:
            params["Prefix"] = prefix

        try:
            response = client.list_objects_v2(**params)
        except (ClientError, BotoCoreError) as exc:
            self._raise_storage_error(exc)

        return [
            ObjectInfo(
                key=item["Key"],
                size=item.get("Size", 0),
                last_modified=item.get("LastModified"),
                etag=item.get("ETag"),
            )
            for item in response.get("Contents", [])
        ]

    def delete_object(self, storage_id: str, object_key: str) -> DeleteObjectResponse:
        storage = self._get_storage_or_404(storage_id)
        client = self._get_client(storage)
        try:
            client.delete_object(Bucket=storage.bucket_name, Key=object_key)
        except (ClientError, BotoCoreError) as exc:
            self._raise_storage_error(exc)

        return DeleteObjectResponse(storage_id=storage_id, object_key=object_key, status="deleted")

    def _get_client(self, storage: StorageConnection) -> BaseClient:
        cached_client = self._clients.get(storage.storage_id)
        if cached_client is not None:
            return cached_client

        client = boto3.client(
            "s3",
            aws_access_key_id=storage.access_key,
            aws_secret_access_key=storage.secret_key,
            endpoint_url=storage.endpoint_url,
            region_name=storage.region_name,
        )
        self._clients[storage.storage_id] = client
        return client

    def _get_storage_or_404(self, storage_id: str) -> StorageConnection:
        storage = self._repository.get(storage_id)
        if storage is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Storage '{storage_id}' was not found",
            )
        return storage

    def _to_response(self, storage: StorageConnection) -> StorageResponse:
        return StorageResponse(
            storage_id=storage.storage_id,
            name=storage.name,
            endpoint_url=storage.endpoint_url,
            bucket_name=storage.bucket_name,
            region_name=storage.region_name,
        )

    def _raise_storage_error(self, exc: ClientError | BotoCoreError) -> None:
        if isinstance(exc, ClientError):
            error = exc.response.get("Error", {})
            message = error.get("Message") or str(exc)
            code = error.get("Code")
            if code in {"403", "AccessDenied"}:
                http_status = status.HTTP_403_FORBIDDEN
            elif code in {"404", "NoSuchBucket", "NoSuchKey", "NotFound"}:
                http_status = status.HTTP_404_NOT_FOUND
            else:
                http_status = status.HTTP_502_BAD_GATEWAY
            raise HTTPException(status_code=http_status, detail=message) from exc

        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    def _to_bucket_summary(self, bucket: Bucket) -> BucketSummary:
        return BucketSummary(
            id=bucket.id,
            name=bucket.name,
            region=bucket.region,
            accessControl=bucket.access_control,  # type: ignore[arg-type]
            objectCount=bucket.object_count,
            totalSize=bucket.total_size,
            totalSizeReadable="0 B",
            createdAt=bucket.created_at,
        )

    def _object_sort_value(self, item: BucketObjectItem, sort: str) -> str | int | datetime:
        if sort == "size":
            return item.size
        if sort == "lastModified":
            if isinstance(item.lastModified, datetime):
                return item.lastModified
            return datetime.fromisoformat(item.lastModified.replace("Z", "+00:00"))
        return item.name

    def _format_bytes(self, size: int) -> str:
        if size == 0:
            return "0 B"

        units = ["B", "KB", "MB", "GB", "TB"]
        value = float(size)
        unit_index = 0
        while value >= 1024 and unit_index < len(units) - 1:
            value /= 1024
            unit_index += 1
        return f"{value:.1f} {units[unit_index]}"

    def _recalculate_bucket_stats(self, bucket_id: str) -> None:
        bucket = self._buckets[bucket_id]
        details = self._bucket_object_details[bucket_id]
        self._buckets[bucket_id] = Bucket(
            id=bucket.id,
            name=bucket.name,
            region=bucket.region,
            access_control=bucket.access_control,
            object_count=len(details),
            total_size=sum(item["size"] for item in details.values()),
            created_at=bucket.created_at,
        )

    def _get_multipart_upload(self, *, bucket_id: str, upload_id: str) -> dict[str, Any]:
        session = self._multipart_uploads.get(upload_id)
        if session is None or session["bucket_id"] != bucket_id:
            raise ApiError(status_code=404, code="NOT_FOUND", message="해당 버킷을 찾을 수 없습니다.")
        return session
