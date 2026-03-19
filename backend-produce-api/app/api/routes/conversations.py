from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database import get_db
from app.models import User, Listing, Conversation, Message
from app.api.deps import get_current_user
from app.schemas.conversation import ConversationCreate, MessageCreate

router = APIRouter(prefix="/conversations", tags=["conversations"])


def _other_user_and_listing(conv: Conversation, current_user_id: UUID):
    if conv.buyer_id == current_user_id:
        other = conv.seller
        other_id = conv.seller_id
    else:
        other = conv.buyer
        other_id = conv.buyer_id
    listing_title = conv.listing.title if conv.listing else ""
    return {"id": str(other_id), "name": other.name if other else "?"}, listing_title


def _format_time(dt):
    if not dt:
        return ""
    if not hasattr(dt, "strftime"):
        return str(dt)
    h, m = dt.hour, dt.minute
    suffix = "AM" if h < 12 else "PM"
    h = h % 12 or 12
    return f"{h}:{m:02d} {suffix}"


@router.get("", response_model=list)
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List my conversations (where I'm buyer or seller), with last message preview."""
    rows = (
        db.query(Conversation)
        .filter((Conversation.buyer_id == current_user.id) | (Conversation.seller_id == current_user.id))
        .order_by(desc(Conversation.updated_at))
        .all()
    )
    out = []
    for c in rows:
        other_user, listing_title = _other_user_and_listing(c, current_user.id)
        last_msg = None
        if c.messages:
            m = c.messages[-1]
            last_msg = {
                "text": m.body,
                "time": _format_time(m.created_at),
                "from_me": m.sender_id == current_user.id,
            }
        out.append({
            "id": str(c.id),
            "listing_id": str(c.listing_id),
            "listing_title": listing_title,
            "other_user": other_user,
            "last_message": last_msg,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        })
    return out


@router.post("", response_model=dict)
def create_or_get_conversation(
    data: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a conversation for a listing (buyer = current user, seller = listing owner), or return existing."""
    listing = db.query(Listing).filter(Listing.id == data.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot message yourself")
    existing = (
        db.query(Conversation)
        .filter(Conversation.listing_id == data.listing_id, Conversation.buyer_id == current_user.id)
        .first()
    )
    if existing:
        other_user, listing_title = _other_user_and_listing(existing, current_user.id)
        last_msg = None
        if existing.messages:
            m = existing.messages[-1]
            last_msg = {"text": m.body, "time": _format_time(m.created_at), "from_me": m.sender_id == current_user.id}
        return {
            "id": str(existing.id),
            "listing_id": str(existing.listing_id),
            "listing_title": listing_title,
            "other_user": other_user,
            "last_message": last_msg,
            "updated_at": existing.updated_at.isoformat() if existing.updated_at else None,
        }
    conv = Conversation(
        listing_id=data.listing_id,
        buyer_id=current_user.id,
        seller_id=listing.seller_id,
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    other_user, listing_title = _other_user_and_listing(conv, current_user.id)
    return {
        "id": str(conv.id),
        "listing_id": str(conv.listing_id),
        "listing_title": listing_title,
        "other_user": other_user,
        "last_message": None,
        "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
    }


@router.get("/{conversation_id}/messages", response_model=list)
def get_messages(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get messages for a conversation (must be participant)."""
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv.buyer_id != current_user.id and conv.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not in this conversation")
    messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at).all()
    return [
        {
            "id": str(m.id),
            "sender_id": str(m.sender_id),
            "sender_name": m.sender.name if m.sender else "",
            "body": m.body,
            "text": m.body,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "time": _format_time(m.created_at),
            "from_me": m.sender_id == current_user.id,
        }
        for m in messages
    ]


@router.post("/{conversation_id}/messages", response_model=dict)
def send_message(
    conversation_id: UUID,
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a message in a conversation."""
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv.buyer_id != current_user.id and conv.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not in this conversation")
    msg = Message(conversation_id=conversation_id, sender_id=current_user.id, body=data.text.strip())
    db.add(msg)
    conv.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(msg)
    return {
        "id": str(msg.id),
        "sender_id": str(msg.sender_id),
        "sender_name": current_user.name,
        "body": msg.body,
        "text": msg.body,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
        "time": _format_time(msg.created_at),
        "from_me": True,
    }
