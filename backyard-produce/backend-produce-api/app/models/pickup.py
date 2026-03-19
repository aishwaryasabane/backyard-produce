import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Pickup(Base):
    __tablename__ = "pickups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    listing_id = Column(UUID(as_uuid=True), ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    scheduled_day = Column(String(64), nullable=False)   # e.g. "Today", "Saturday"
    scheduled_time = Column(String(32), nullable=False)  # e.g. "10:00 AM"
    status = Column(String(32), nullable=False, default="pending")  # pending, confirmed, cancelled

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    listing = relationship("Listing", back_populates="pickups", foreign_keys=[listing_id])
    buyer = relationship("User", foreign_keys=[buyer_id])
    seller = relationship("User", foreign_keys=[seller_id])

    def __repr__(self):
        return f"<Pickup {self.id} {self.status}>"
