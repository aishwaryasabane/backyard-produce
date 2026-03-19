import hashlib
from datetime import datetime, timezone, timedelta
from uuid import UUID

import bcrypt
from jose import JWTError, jwt

from app.config import settings

# Bcrypt accepts at most 72 bytes. Longer passwords are hashed with SHA256 first (64 chars).
def _prepare_password(password: str) -> bytes:
    p = password.encode("utf-8")
    if len(p) > 72:
        p = hashlib.sha256(p).hexdigest().encode("utf-8")
    return p


def hash_password(password: str) -> str:
    p = _prepare_password(password)
    return bcrypt.hashpw(p, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    p = _prepare_password(plain)
    return bcrypt.checkpw(p, hashed.encode("utf-8"))


def create_access_token(user_id: UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "access":
            return None
        return payload.get("sub")
    except JWTError:
        return None
