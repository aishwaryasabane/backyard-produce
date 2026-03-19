from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    neighborhood: str | None = None


class TokenPayload(BaseModel):
    sub: str  # user id
    exp: int
    type: str = "access"


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
