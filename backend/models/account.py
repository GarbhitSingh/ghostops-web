from pydantic import BaseModel
from typing import Optional


class CreateStep1Request(BaseModel):
    email: str


class CreateStep2Request(BaseModel):
    session_id: str
    otp: str


class IGAccountOut(BaseModel):
    id: int
    owner_id: int
    ig_username: str
    ig_password: str
    cookies: str
    pro_converted: bool
    bio_updated: bool
    created_at: str
