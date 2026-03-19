from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import User, Listing, Review
from app.api.deps import get_current_user, get_current_user_optional
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["reviews"])


def review_to_response(review: Review) -> dict:
    return {
        "id": str(review.id),
        "listing_id": str(review.listing_id),
        "listing_title": review.listing.title if review.listing else None,
        "reviewer_id": str(review.reviewer_id),
        "author": review.reviewer.name if review.reviewer else "",
        "reviewee_id": str(review.reviewee_id),
        "rating": review.rating,
        "text": review.text,
        "created_at": review.created_at,
    }


def _update_listing_rating_count(db: Session, listing_id: UUID) -> None:
    """Recalc listing.rating (avg) and listing.review_count from reviews."""
    row = db.query(func.avg(Review.rating), func.count(Review.id)).filter(Review.listing_id == listing_id).first()
    avg_rating, count = row[0], row[1] or 0
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if listing:
        listing.rating = round(float(avg_rating), 1) if avg_rating is not None else None
        listing.review_count = count
        db.commit()


@router.post("", response_model=dict)
def create_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a review for a listing (reviewer = current user, reviewee = listing seller). One review per user per listing."""
    listing = db.query(Listing).filter(Listing.id == data.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot review your own listing")
    existing = db.query(Review).filter(Review.listing_id == data.listing_id, Review.reviewer_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this listing")

    review = Review(
        listing_id=data.listing_id,
        reviewer_id=current_user.id,
        reviewee_id=listing.seller_id,
        rating=data.rating,
        text=data.text,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    _update_listing_rating_count(db, data.listing_id)
    return review_to_response(review)


@router.get("", response_model=list)
def get_reviews_for_listing(
    listing_id: UUID = Query(..., description="Listing to get reviews for"),
    db: Session = Depends(get_db),
):
    """View reviews for a listing (no auth required)."""
    rows = (
        db.query(Review)
        .filter(Review.listing_id == listing_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return [review_to_response(r) for r in rows]


@router.get("/me", response_model=list)
def get_my_reviews_received(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reviews you received (as seller). For 'My Reviews' screen."""
    rows = (
        db.query(Review)
        .filter(Review.reviewee_id == current_user.id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return [review_to_response(r) for r in rows]
