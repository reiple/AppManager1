# Multi Storage Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a FastAPI backend that can register and manage multiple S3-compatible object storage connections.

**Architecture:** Keep API routing thin and place storage lifecycle plus boto3 client caching in `StorageManager`. Use an in-memory repository behind a small interface so SQLAlchemy/SQLite can replace it later without changing routers.

**Tech Stack:** FastAPI, Pydantic v2, boto3/botocore, pytest, httpx TestClient.

---

### Task 1: API Contract Tests

**Files:**
- Create: `tests/test_storage_api.py`

- [x] **Step 1: Write failing tests for registration, listing, presigned URL, listing objects, and deletion**

Run: `pytest tests/test_storage_api.py -q`
Expected: FAIL because `app.main` does not exist yet.

### Task 2: Core Application Files

**Files:**
- Create: `app/main.py`
- Create: `app/routers/storage.py`
- Create: `app/schemas/storage.py`
- Create: `app/models/storage.py`
- Create: `app/services/storage_repository.py`
- Create: `app/services/storage_manager.py`
- Create: package `__init__.py` files
- Create: `requirements.txt`

- [ ] **Step 1: Implement schemas and model**
- [ ] **Step 2: Implement in-memory repository**
- [ ] **Step 3: Implement `StorageManager` with boto3 client caching and HTTPException conversion**
- [ ] **Step 4: Implement FastAPI router**
- [ ] **Step 5: Wire router in `app/main.py`**

### Task 3: Verification

**Files:**
- Test: `tests/test_storage_api.py`

- [ ] **Step 1: Run tests**

Run: `pytest tests/test_storage_api.py -q`
Expected: PASS.

- [ ] **Step 2: Run import smoke check**

Run: `python -m compileall app tests`
Expected: PASS.
