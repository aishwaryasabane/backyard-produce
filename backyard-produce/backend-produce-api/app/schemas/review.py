from uuid import UUID
from pydantic import BaseModel, Field
from datetime import datetime


class ReviewCreate(BaseModel):
    listing_id: UUID
    rating: int = Field(..., ge=1, le=5, description="1-5 stars")
    text: str | None = None


class ReviewResponse(BaseModel):
    id: UUID
    listing_id: UUID
    listing_title: str | None
    reviewer_id: UUID
    author: str  # reviewer name
    reviewee_id: UUID
    rating: int
    text: str | None
    created_at: datetime

    model_config = {"from_attributes": False}
