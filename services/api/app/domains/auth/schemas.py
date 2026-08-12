"""
auth — Pydantic request/response schemas — API Layer.

Domain purpose: Admin identity and session control — login, token
issuance/refresh/revocation, password verification.
"""

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str
