import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    avatar_url = Column(String(512), nullable=True)
    neighborhood = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    listings = relationship("Listing", back_populates="seller", foreign_keys="Listing.seller_id")

    def __repr__(self):
        return f"<User {self.email}>"
