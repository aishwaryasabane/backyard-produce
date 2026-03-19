import uuid
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSON, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


# Match frontend PRODUCE_TYPES
PRODUCE_TYPES = [
    "Apples", "Oranges", "Lemons", "Tomatoes", "Zucchini", "Herbs",
    "Peppers", "Berries", "Stone fruit", "Leafy greens", "Other",
]

PRICE_TYPES = ("free", "per_lb", "per_item", "per_bunch")
PAYMENT_METHODS = ("cash", "card", "barter")


class Listing(Base):
    __tablename__ = "listings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    produce_type = Column(String(64), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    quantity = Column(String(128), nullable=True)  # e.g. "~20 lbs", "Several plants"

    price = Column(Float, nullable=False, default=0)
    price_type = Column(String(32), nullable=False, default="free")  # free, per_lb, per_item, per_bunch

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address_approximate = Column(String(255), nullable=True)  # "Oak St & 3rd Ave" for display

    image_url = Column(String(512), nullable=True)
    payment_methods = Column(ARRAY(String), nullable=False, default=lambda: [])  # ["cash", "barter"]

    rating = Column(Float, nullable=True)  # optional, from reviews later
    review_count = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    seller = relationship("User", back_populates="listings", foreign_keys=[seller_id])
    pickups = relationship("Pickup", back_populates="listing", foreign_keys="Pickup.listing_id")
    reviews = relationship("Review", back_populates="listing", foreign_keys="Review.listing_id")
    conversations = relationship("Conversation", back_populates="listing", foreign_keys="Conversation.listing_id")

    def __repr__(self):
        return f"<Listing {self.title}>"
