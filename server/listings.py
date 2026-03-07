from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/api/listings", tags=["listings"])

@router.get("/", response_model=List[schemas.ListingOut])
def get_listings(
    city: Optional[str] = None,
    bhk_type: Optional[str] = None,
    gender_preference: Optional[str] = None,
    min_rent: Optional[float] = None,
    max_rent: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Listing).options(joinedload(models.Listing.owner)).filter(
        models.Listing.is_active == True
    )
    if city:
        query = query.filter(models.Listing.city.ilike(f"%{city}%"))
    if bhk_type:
        query = query.filter(models.Listing.bhk_type == bhk_type)
    if gender_preference:
        query = query.filter(models.Listing.gender_preference == gender_preference)
    if min_rent:
        query = query.filter(models.Listing.rent >= min_rent)
    if max_rent:
        query = query.filter(models.Listing.rent <= max_rent)

    return query.order_by(models.Listing.created_at.desc()).all()

@router.get("/{listing_id}", response_model=schemas.ListingOut)
def get_listing(listing_id: str, db: Session = Depends(get_db)):
    listing = db.query(models.Listing).options(joinedload(models.Listing.owner)).filter(
        models.Listing.id == listing_id
    ).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@router.post("/", response_model=schemas.ListingOut, status_code=201)
def create_listing(
    body: schemas.CreateListingRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    listing = models.Listing(**body.dict(), posted_by=current_user.id)
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing

@router.put("/{listing_id}", response_model=schemas.ListingOut)
def update_listing(
    listing_id: str,
    body: schemas.UpdateListingRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    listing = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.posted_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    for key, value in body.dict(exclude_none=True).items():
        setattr(listing, key, value)

    db.commit()
    db.refresh(listing)
    return listing

@router.delete("/{listing_id}")
def delete_listing(
    listing_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    listing = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.posted_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(listing)
    db.commit()
    return {"message": "Listing deleted"}
