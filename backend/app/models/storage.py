from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class StorageConnection:
    storage_id: str
    name: str
    access_key: str
    secret_key: str
    endpoint_url: str | None
    bucket_name: str
    region_name: str | None


@dataclass(frozen=True)
class Bucket:
    id: str
    name: str
    region: str
    access_control: str
    object_count: int
    total_size: int
    created_at: datetime
