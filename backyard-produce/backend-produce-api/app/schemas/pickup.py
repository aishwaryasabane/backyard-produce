from uuid import UUID
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal


class PickupCreate(BaseModel):
    listing_id: UUID
    scheduled_day: str = Field(..., description="e.g. Today, Saturday")
    scheduled_time: str = Field(..., description="e.g. 10:00 AM")


class PickupUpdate(BaseModel):
    status: Literal["pending", "confirmed", "cancelled"] | None = None


class PickupResponse(BaseModel):
    id: UUID
    listing_id: UUID
    listing_title: str
    seller_id: UUID
    seller_name: str
    location: str | None  # address_approximate from listing
    scheduled_day: str
    scheduled_time: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": False}
