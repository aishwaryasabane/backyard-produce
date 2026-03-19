from uuid import UUID
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal


PRODUCE_TYPES = [
    "Apples", "Oranges", "Lemons", "Tomatoes", "Zucchini", "Herbs",
    "Peppers", "Berries", "Stone fruit", "Leafy greens", "Other",
]
PRICE_TYPES = ("free", "per_lb", "per_item", "per_bunch")
PAYMENT_OPTIONS = ("cash", "card", "barter")


class ListingCreate(BaseModel):
    produce_type: str = Field(..., description="One of PRODUCE_TYPES")
    title: str
    description: str | None = None
    quantity: str | None = None
    price: float = 0
    price_type: Literal["free", "per_lb", "per_item", "per_bunch"] = "free"
    latitude: float | None = None
    longitude: float | None = None
    address_approximate: str | None = None
    image_url: str | None = None
    payment_methods: list[str] = Field(default_factory=list, description="e.g. ['cash','barter']")


class ListingUpdate(BaseModel):
    """All fields optional for PATCH-style updates."""
    produce_type: str | None = None
    title: str | None = None
    description: str | None = None
    quantity: str | None = None
    price: float | None = None
    price_type: Literal["free", "per_lb", "per_item", "per_bunch"] | None = None
    latitude: float | None = None
    longitude: float | None = None
    address_approximate: str | None = None
    image_url: str | None = None
    payment_methods: list[str] | None = None


class LocationOut(BaseModel):
    approximate: str | None
    distance: float | None = None  # km, filled for nearby


class ListingResponse(BaseModel):
    id: UUID
    seller_id: UUID
    seller_name: str
    seller_avatar: str | None
    produce_type: str
    title: str
    description: str | None
    quantity: str | None
    price: float
    price_type: str
    location: LocationOut
    image: str | None
    payment_methods: list[str]
    rating: float | None
    review_count: int
    created_at: datetime

    model_config = {"from_attributes": False}


class ListingResponseWithDistance(ListingResponse):
    """Same as ListingResponse; location.distance is set for nearby listings."""
