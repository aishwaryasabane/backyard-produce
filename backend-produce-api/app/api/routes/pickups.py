from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.models import User, Listing, Pickup
from app.api.deps import get_current_user
from app.schemas.pickup import PickupCreate, PickupResponse
from sqlalchemy.orm import Session

router = APIRouter(prefix="/pickups", tags=["pickups"])


def pickup_to_response(pickup: Pickup) -> dict:
    return {
        "id": str(pickup.id),
        "listing_id": str(pickup.listing_id),
        "listing_title": pickup.listing.title if pickup.listing else "",
        "seller_id": str(pickup.seller_id),
        "seller_name": pickup.seller.name if pickup.seller else "",
        "location": pickup.listing.address_approximate if pickup.listing else None,
        "scheduled_day": pickup.scheduled_day,
        "scheduled_time": pickup.scheduled_time,
        "status": pickup.status,
        "created_at": pickup.created_at,
    }


@router.post("", response_model=dict)
def create_pickup(
    data: PickupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Schedule a pickup for a listing. Buyer is the current user."""
    listing = db.query(Listing).filter(Listing.id == data.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot schedule a pickup for your own listing")

    pickup = Pickup(
        listing_id=data.listing_id,
        buyer_id=current_user.id,
        seller_id=listing.seller_id,
        scheduled_day=data.scheduled_day,
        scheduled_time=data.scheduled_time,
        status="pending",
    )
    db.add(pickup)
    db.commit()
    db.refresh(pickup)
    return pickup_to_response(pickup)


@router.get("", response_model=list)
def get_my_pickups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List pickups where the current user is the buyer or the seller."""
    rows = (
        db.query(Pickup)
        .filter((Pickup.buyer_id == current_user.id) | (Pickup.seller_id == current_user.id))
        .order_by(Pickup.created_at.desc())
        .all()
    )
    return [pickup_to_response(p) for p in rows]
