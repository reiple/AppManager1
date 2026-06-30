from __future__ import annotations

from datetime import datetime
from typing import Literal

import re

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, SecretStr, field_serializer, field_validator


class StorageCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    access_key: str = Field(min_length=1, max_length=256)
    secret_key: SecretStr = Field(min_length=1, max_length=256)
    endpoint_url: HttpUrl | None = None
    bucket_name: str = Field(min_length=1, max_length=255)
    region_name: str | None = Field(default=None, max_length=64)

    @field_serializer("endpoint_url")
    def serialize_endpoint_url(self, value: HttpUrl | None) -> str | None:
        return str(value) if value is not None else None


class StorageResponse(BaseModel):
    storage_id: str
    name: str
    endpoint_url: str | None
    bucket_name: str
    region_name: str | None

    model_config = ConfigDict(from_attributes=True)


class PresignedUrlRequest(BaseModel):
    object_key: str = Field(min_length=1, max_length=1024)
    method: Literal["get_object", "put_object"] = "put_object"
    expires_in: int = Field(default=3600, ge=60, le=86_400)
    content_type: str | None = Field(default=None, max_length=255)


class PresignedUrlResponse(BaseModel):
    storage_id: str
    url: str
    method: Literal["get_object", "put_object"]
    expires_in: int


class ObjectInfo(BaseModel):
    key: str
    size: int
    last_modified: datetime | str | None = None
    etag: str | None = None


class DeleteObjectResponse(BaseModel):
    storage_id: str
    object_key: str
    status: Literal["deleted"]


class ConnectionTestResponse(BaseModel):
    storage_id: str
    ok: bool
    message: str


class BucketSummary(BaseModel):
    id: str
    name: str
    region: str
    accessControl: Literal["public", "private"]
    objectCount: int = Field(ge=0)
    totalSize: int = Field(ge=0)
    totalSizeReadable: str
    createdAt: datetime | str


class BucketListResponse(BaseModel):
    total: int = Field(ge=0)
    page: int = Field(ge=1)
    size: int = Field(ge=1, le=100)
    buckets: list[BucketSummary]


class BucketCreateRequest(BaseModel):
    name: str
    region: str = Field(min_length=1, max_length=64)
    accessControl: Literal["public", "private"]

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        if not re.fullmatch(r"[a-z0-9-]{3,63}", value):
            raise ValueError(
                "버킷 이름은 소문자, 숫자, 하이픈(-)만 사용할 수 있으며, 3자 이상 63자 이하여야 합니다."
            )
        return value


class BucketObjectFolder(BaseModel):
    type: Literal["folder"]
    prefix: str


class BucketObjectItem(BaseModel):
    type: Literal["object"]
    key: str
    name: str
    extension: str
    size: int = Field(ge=0)
    sizeReadable: str
    contentType: str
    lastModified: datetime | str
    etag: str


class BucketObjectListResponse(BaseModel):
    bucketId: str
    prefix: str
    delimiter: str
    total: int = Field(ge=0)
    page: int = Field(ge=1)
    size: int = Field(ge=1, le=200)
    folders: list[BucketObjectFolder]
    objects: list[BucketObjectItem]


class BucketUploadResponse(BaseModel):
    key: str
    name: str
    extension: str
    size: int = Field(ge=0)
    sizeReadable: str
    contentType: str
    accessControl: Literal["public", "private"]
    lastModified: datetime | str
    etag: str


class MultipartUploadInitRequest(BaseModel):
    key: str = Field(min_length=1, max_length=1024)
    contentType: str = Field(min_length=1, max_length=255)
    totalSize: int = Field(gt=0)


class MultipartUploadInitResponse(BaseModel):
    uploadId: str
    key: str
    expiresAt: datetime | str


class MultipartUploadPartResponse(BaseModel):
    partNumber: int = Field(ge=1, le=10_000)
    etag: str


class MultipartUploadPartItem(BaseModel):
    partNumber: int = Field(ge=1, le=10_000)
    etag: str = Field(min_length=1)


class MultipartUploadCompleteRequest(BaseModel):
    parts: list[MultipartUploadPartItem] = Field(min_length=1)


class MultipartUploadCompleteResponse(BaseModel):
    key: str
    name: str
    extension: str
    size: int = Field(ge=0)
    sizeReadable: str
    contentType: str
    lastModified: datetime | str
    etag: str


class DownloadUrlResponse(BaseModel):
    key: str
    presignedUrl: str
    expiresAt: datetime | str


class BatchDeleteRequest(BaseModel):
    keys: list[str]

    @field_validator("keys")
    @classmethod
    def validate_keys(cls, value: list[str]) -> list[str]:
        if not 1 <= len(value) <= 1000:
            raise ValueError("삭제 목록은 1개 이상 1000개 이하여야 합니다.")
        return value


class BatchDeleteSuccessItem(BaseModel):
    key: str


class BatchDeleteFailedItem(BaseModel):
    key: str
    code: str
    message: str


class BatchDeleteResponse(BaseModel):
    deleted: list[BatchDeleteSuccessItem]
    failed: list[BatchDeleteFailedItem]
