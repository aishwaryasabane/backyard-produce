from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Load from environment; create .env from .env.example."""

    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/backyard_produce"

    # JWT
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Uploads (relative to project root or absolute path)
    UPLOAD_DIR: str = "uploads"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
