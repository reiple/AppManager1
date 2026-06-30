from __future__ import annotations

from abc import ABC, abstractmethod

from app.models.storage import StorageConnection


class StorageRepository(ABC):
    @abstractmethod
    def save(self, storage: StorageConnection) -> None:
        raise NotImplementedError

    @abstractmethod
    def get(self, storage_id: str) -> StorageConnection | None:
        raise NotImplementedError

    @abstractmethod
    def list(self) -> list[StorageConnection]:
        raise NotImplementedError

    @abstractmethod
    def delete(self, storage_id: str) -> None:
        raise NotImplementedError


class InMemoryStorageRepository(StorageRepository):
    def __init__(self) -> None:
        self._items: dict[str, StorageConnection] = {}

    def save(self, storage: StorageConnection) -> None:
        self._items[storage.storage_id] = storage

    def get(self, storage_id: str) -> StorageConnection | None:
        return self._items.get(storage_id)

    def list(self) -> list[StorageConnection]:
        return list(self._items.values())

    def delete(self, storage_id: str) -> None:
        self._items.pop(storage_id, None)
