from uuid import UUID
from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    neighborhood: str | None = None


class UserResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    avatar: str | None = None
    neighborhood: str | None = None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}

    @classmethod
    def from_user(cls, user):
        return cls(
            id=user.id,
            name=user.name,
            email=user.email,
            avatar=user.avatar_url,
            neighborhood=user.neighborhood,
            created_at=user.created_at,
        )
