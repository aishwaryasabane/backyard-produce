import math
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Listing
from app.api.deps import get_current_user, get_current_user_optional
from app.schemas.listing import ListingCreate, ListingUpdate, ListingResponse, LocationOut

router = APIRouter(prefix="/listings", tags=["listings"])


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Distance in km between two (lat, lon) points."""
    R = 6371  # Earth radius km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def listing_to_response(
    row: Listing,
    seller: User,
    distance_km: float | None = None,
    include_seller_contact: bool = False,
) -> dict:
    loc = LocationOut(approximate=row.address_approximate, distance=round(distance_km, 2) if distance_km is not None else None)
    out = {
        "id": str(row.id),
        "seller_id": str(row.seller_id),
        "seller_name": seller.name,
        "seller_avatar": seller.avatar_url,
        "produce_type": row.produce_type,
        "title": row.title,
        "description": row.description,
        "quantity": row.quantity,
        "price": row.price,
        "price_type": row.price_type,
        "location": loc.model_dump(),
        "image": row.image_url,
        "payment_methods": list(row.payment_methods or []),
        "rating": row.rating,
        "review_count": row.review_count or 0,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }
    if include_seller_contact:
        out["seller_contact"] = {"name": seller.name, "email": seller.email}
    return out


@router.post("", response_model=dict)
def create_listing(
    data: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new produce listing (authenticated)."""
    listing = Listing(
        seller_id=current_user.id,
        produce_type=data.produce_type,
        title=data.title,
        description=data.description,
        quantity=data.quantity,
        price=data.price,
        price_type=data.price_type,
        latitude=data.latitude,
        longitude=data.longitude,
        address_approximate=data.address_approximate,
        image_url=data.image_url,
        payment_methods=data.payment_methods or [],
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing_to_response(listing, current_user)


@router.get("", response_model=list)
def get_all_listings(
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List all listings (e.g. for feed when location unknown). No distance; location.distance is null."""
    rows = db.query(Listing).order_by(Listing.created_at.desc()).limit(limit).all()
    out = []
    for row in rows:
        seller = db.query(User).filter(User.id == row.seller_id).first()
        if seller:
            out.append(listing_to_response(row, seller))
    return out


@router.get("/me", response_model=list)
def get_my_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List the current user's listings."""
    rows = db.query(Listing).filter(Listing.seller_id == current_user.id).order_by(Listing.created_at.desc()).all()
    return [listing_to_response(row, current_user) for row in rows]


@router.get("/nearby", response_model=list)
def get_nearby_listings(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    radius_km: float = Query(50, ge=0.1, le=500, description="Max distance in km"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Listings with lat/lng, sorted by distance. Each item includes location.distance in km."""
    rows = db.query(Listing).filter(
        Listing.latitude.isnot(None),
        Listing.longitude.isnot(None),
    ).all()
    out = []
    for row in rows:
        km = haversine_km(lat, lng, row.latitude, row.longitude)
        if km > radius_km:
            continue
        seller = db.query(User).filter(User.id == row.seller_id).first()
        if not seller:
            continue
        out.append((km, row, seller))
    out.sort(key=lambda x: x[0])
    out = out[:limit]
    return [listing_to_response(row, seller, distance_km=km) for km, row, seller in out]


@router.get("/{listing_id}", response_model=dict)
def get_listing(
    listing_id: UUID,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    """Get a single listing by id. If authenticated, response includes seller_contact (name, email) for reaching out."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    seller = db.query(User).filter(User.id == listing.seller_id).first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")
    distance_km = None
    if listing.latitude is not None and listing.longitude is not None and current_user:
        # Optional: compute distance if we had user location
        pass
    return listing_to_response(listing, seller, include_seller_contact=current_user is not None)


@router.put("/{listing_id}", response_model=dict)
def update_listing(
    listing_id: UUID,
    data: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a listing (owner only). Only provided fields are updated."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your listing")
    payload = data.model_dump(exclude_unset=True)
    if "payment_methods" in payload and payload["payment_methods"] is None:
        del payload["payment_methods"]
    for key, value in payload.items():
        setattr(listing, key, value)
    db.commit()
    db.refresh(listing)
    return listing_to_response(listing, current_user)


@router.delete("/{listing_id}", status_code=204)
def delete_listing(
    listing_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a listing (owner only)."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your listing")
    db.delete(listing)
    db.commit()
    return None
