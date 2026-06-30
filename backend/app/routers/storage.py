from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, Query, Request, UploadFile, status

from app.dependencies import require_bearer_token
from app.schemas.storage import (
    BatchDeleteRequest,
    BatchDeleteResponse,
    BucketCreateRequest,
    BucketListResponse,
    BucketObjectListResponse,
    BucketUploadResponse,
    BucketSummary,
    ConnectionTestResponse,
    DeleteObjectResponse,
    DownloadUrlResponse,
    MultipartUploadCompleteRequest,
    MultipartUploadCompleteResponse,
    MultipartUploadInitRequest,
    MultipartUploadInitResponse,
    MultipartUploadPartResponse,
    ObjectInfo,
    PresignedUrlRequest,
    PresignedUrlResponse,
    StorageCreate,
    StorageResponse,
)
from app.services.storage_manager import StorageManager

router = APIRouter()

storage_manager = StorageManager()


def get_storage_manager() -> StorageManager:
    return storage_manager


StorageManagerDep = Annotated[StorageManager, Depends(get_storage_manager)]
BearerTokenDep = Annotated[str, Depends(require_bearer_token)]


@router.get("/api/v1/buckets", response_model=BucketListResponse, tags=["buckets"])
def list_buckets(
    manager: StorageManagerDep,
    _: BearerTokenDep,
    page: Annotated[int, Query(ge=1)] = 1,
    size: Annotated[int, Query(ge=1, le=100)] = 20,
    region: Annotated[str | None, Query()] = None,
) -> BucketListResponse:
    return manager.list_buckets(page=page, size=size, region=region)


@router.post("/api/v1/buckets", response_model=BucketSummary, status_code=status.HTTP_201_CREATED, tags=["buckets"])
def create_bucket(
    request: BucketCreateRequest,
    manager: StorageManagerDep,
    _: BearerTokenDep,
) -> BucketSummary:
    return manager.create_bucket(request)


@router.delete("/api/v1/buckets/{bucket_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["buckets"])
def delete_bucket(bucket_id: str, manager: StorageManagerDep, _: BearerTokenDep) -> None:
    manager.delete_bucket(bucket_id)


@router.get("/api/v1/buckets/{bucket_id}/objects", response_model=BucketObjectListResponse, tags=["objects"])
def list_bucket_objects(
    bucket_id: str,
    manager: StorageManagerDep,
    _: BearerTokenDep,
    prefix: Annotated[str, Query()] = "",
    delimiter: Annotated[str, Query()] = "/",
    page: Annotated[int, Query(ge=1)] = 1,
    size: Annotated[int, Query(ge=1, le=200)] = 50,
    sort: Annotated[str, Query(pattern="^(name|size|lastModified)$")] = "name",
    order: Annotated[str, Query(pattern="^(asc|desc)$")] = "asc",
) -> BucketObjectListResponse:
    return manager.list_bucket_objects(
        bucket_id=bucket_id,
        prefix=prefix,
        delimiter=delimiter,
        page=page,
        size=size,
        sort=sort,
        order=order,
    )


@router.post(
    "/api/v1/buckets/{bucket_id}/objects",
    response_model=BucketUploadResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["objects"],
)
async def upload_bucket_object(
    bucket_id: str,
    manager: StorageManagerDep,
    _: BearerTokenDep,
    file: UploadFile = File(...),
    key: str = Form(...),
    contentType: str | None = Form(default=None),
    accessControl: str | None = Form(default=None),
) -> BucketUploadResponse:
    content = await file.read()
    return manager.upload_bucket_object(
        bucket_id=bucket_id,
        key=key,
        filename=file.filename or key.rsplit("/", 1)[-1],
        content=content,
        content_type=contentType or file.content_type,
        access_control=accessControl,
    )


@router.post(
    "/api/v1/buckets/{bucket_id}/objects/multipart/init",
    response_model=MultipartUploadInitResponse,
    tags=["objects"],
)
def init_multipart_upload(
    bucket_id: str,
    request: MultipartUploadInitRequest,
    manager: StorageManagerDep,
    _: BearerTokenDep,
) -> MultipartUploadInitResponse:
    return manager.init_multipart_upload(
        bucket_id=bucket_id,
        key=request.key,
        content_type=request.contentType,
        total_size=request.totalSize,
    )


@router.put(
    "/api/v1/buckets/{bucket_id}/objects/multipart/{upload_id}/parts/{part_number}",
    response_model=MultipartUploadPartResponse,
    tags=["objects"],
)
async def upload_multipart_part(
    bucket_id: str,
    upload_id: str,
    part_number: int,
    manager: StorageManagerDep,
    _: BearerTokenDep,
    request: Request,
) -> MultipartUploadPartResponse:
    content = await request.body()
    return manager.upload_multipart_part(
        bucket_id=bucket_id,
        upload_id=upload_id,
        part_number=part_number,
        content=content,
    )


@router.post(
    "/api/v1/buckets/{bucket_id}/objects/multipart/{upload_id}/complete",
    response_model=MultipartUploadCompleteResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["objects"],
)
def complete_multipart_upload(
    bucket_id: str,
    upload_id: str,
    request: MultipartUploadCompleteRequest,
    manager: StorageManagerDep,
    _: BearerTokenDep,
) -> MultipartUploadCompleteResponse:
    return manager.complete_multipart_upload(
        bucket_id=bucket_id,
        upload_id=upload_id,
        parts=[part.model_dump() for part in request.parts],
    )


@router.get(
    "/api/v1/buckets/{bucket_id}/objects/download-url",
    response_model=DownloadUrlResponse,
    tags=["objects"],
)
def generate_download_url(
    bucket_id: str,
    manager: StorageManagerDep,
    _: BearerTokenDep,
    key: Annotated[str, Query(min_length=1)],
    expiresIn: Annotated[int, Query(ge=60, le=604800)] = 3600,
) -> DownloadUrlResponse:
    return manager.generate_download_url(bucket_id=bucket_id, key=key, expires_in=expiresIn)


@router.delete("/api/v1/buckets/{bucket_id}/objects", status_code=status.HTTP_204_NO_CONTENT, tags=["objects"])
def delete_bucket_object(
    bucket_id: str,
    manager: StorageManagerDep,
    _: BearerTokenDep,
    key: Annotated[str, Query(min_length=1)],
) -> None:
    manager.delete_bucket_object(bucket_id=bucket_id, key=key)


@router.post(
    "/api/v1/buckets/{bucket_id}/objects/batch-delete",
    response_model=BatchDeleteResponse,
    tags=["objects"],
)
def batch_delete_bucket_objects(
    bucket_id: str,
    request: BatchDeleteRequest,
    manager: StorageManagerDep,
    _: BearerTokenDep,
) -> BatchDeleteResponse:
    return BatchDeleteResponse(
        **manager.batch_delete_bucket_objects(bucket_id=bucket_id, keys=request.keys)
    )


@router.post("/storages", response_model=StorageResponse, status_code=status.HTTP_201_CREATED, tags=["storages"])
def register_storage(request: StorageCreate, manager: StorageManagerDep) -> StorageResponse:
    return manager.register_storage(request)


@router.get("/storages", response_model=list[StorageResponse], tags=["storages"])
def list_storages(manager: StorageManagerDep) -> list[StorageResponse]:
    return manager.list_storages()


@router.get("/storages/{storage_id}", response_model=StorageResponse, tags=["storages"])
def get_storage(storage_id: str, manager: StorageManagerDep) -> StorageResponse:
    return manager.get_storage(storage_id)


@router.delete("/storages/{storage_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["storages"])
def delete_storage(storage_id: str, manager: StorageManagerDep) -> None:
    manager.delete_storage(storage_id)


@router.post("/storages/{storage_id}/test", response_model=ConnectionTestResponse, tags=["storages"])
def test_connection(storage_id: str, manager: StorageManagerDep) -> ConnectionTestResponse:
    return manager.test_connection(storage_id)


@router.post("/storages/{storage_id}/presigned-url", response_model=PresignedUrlResponse, tags=["storages"])
def create_presigned_url(
    storage_id: str,
    request: PresignedUrlRequest,
    manager: StorageManagerDep,
) -> PresignedUrlResponse:
    return manager.create_presigned_url(storage_id, request)


@router.get("/storages/{storage_id}/objects", response_model=list[ObjectInfo], tags=["storages"])
def list_objects(
    storage_id: str,
    manager: StorageManagerDep,
    prefix: Annotated[str | None, Query(description="Object key prefix filter")] = None,
) -> list[ObjectInfo]:
    return manager.list_objects(storage_id, prefix=prefix)


@router.delete(
    "/storages/{storage_id}/objects/{object_key:path}",
    response_model=DeleteObjectResponse,
    tags=["storages"],
)
def delete_object(storage_id: str, object_key: str, manager: StorageManagerDep) -> DeleteObjectResponse:
    return manager.delete_object(storage_id, object_key)
