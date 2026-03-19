import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from app.api.deps import get_current_user
from app.models import User
from app.config import settings

router = APIRouter(prefix="/upload", tags=["upload"])

# Resolve upload dir relative to project root (parent of app/)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = PROJECT_ROOT / settings.UPLOAD_DIR
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_SIZE_MB = 5


def ensure_upload_dir():
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Upload an image for a listing. Returns { "url": "/uploads/..." } for use as listing image_url."""
    ensure_upload_dir()
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, detail=f"Allowed types: {', '.join(ALLOWED_EXTENSIONS)}")
    content = await file.read()
    if len(content) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, detail=f"File too large (max {MAX_SIZE_MB} MB)")
    name = f"{uuid.uuid4().hex}{ext}"
    path = UPLOAD_DIR / name
    with open(path, "wb") as f:
        f.write(content)
    return {"url": f"/uploads/{name}"}
