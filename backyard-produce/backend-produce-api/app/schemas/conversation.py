from uuid import UUID
from pydantic import BaseModel
from datetime import datetime


class ConversationCreate(BaseModel):
    listing_id: UUID


class MessageCreate(BaseModel):
    text: str


class MessageResponse(BaseModel):
    id: UUID
    sender_id: UUID
    sender_name: str
    body: str
    created_at: datetime
    from_me: bool

    model_config = {"from_attributes": False}


class ConversationListItem(BaseModel):
    id: UUID
    listing_id: UUID
    listing_title: str
    other_user: dict  # { id, name }
    last_message: dict | None  # { text, time, from_me }
    updated_at: datetime

    model_config = {"from_attributes": False}
