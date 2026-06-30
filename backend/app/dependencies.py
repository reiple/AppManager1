from __future__ import annotations

from typing import Annotated

from fastapi import Header

from app.errors import ApiError


def require_bearer_token(
    authorization: Annotated[str | None, Header(alias="Authorization")] = None,
) -> str:
    if authorization is None:
        raise ApiError(
            status_code=401,
            code="UNAUTHORIZED",
            message="인증 토큰이 유효하지 않거나 만료되었습니다.",
        )

    scheme, _, token = authorization.partition(" ")
    if scheme != "Bearer" or not token:
        raise ApiError(
            status_code=401,
            code="UNAUTHORIZED",
            message="인증 토큰이 유효하지 않거나 만료되었습니다.",
        )

    return token
