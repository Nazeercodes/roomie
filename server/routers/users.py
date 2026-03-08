from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from database import get_db
import models, schemas
from routers.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/saved/listings", response_model=List[schemas.ListingOut])
def get_saved_listings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    user = db.query(models.User).options(
        joinedload(models.User.saved).joinedload(models.Listing.owner)
    ).filter(models.User.id == current_user.id).first()
    return user.saved

@router.get("/my/listings", response_model=List[schemas.ListingOut])
def get_my_listings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.Listing).filter(
        models.Listing.posted_by == current_user.id
    ).order_by(models.Listing.created_at.desc()).all()

@router.put("/profile", response_model=schemas.UserPublic)
def update_profile(
    body: schemas.UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    for key, value in body.dict(exclude_none=True).items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/{user_id}")
def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    listings = db.query(models.Listing).filter(
        models.Listing.posted_by == user_id,
        models.Listing.is_active == True
    ).order_by(models.Listing.created_at.desc()).all()

    return {
        "user": schemas.UserPublic.from_orm(user),
        "listings": [schemas.ListingOut.from_orm(l) for l in listings]
    }

@router.post("/save/{listing_id}")
def toggle_save_listing(
    listing_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    listing = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    user = db.query(models.User).options(joinedload(models.User.saved)).filter(
        models.User.id == current_user.id
    ).first()

    is_saved = any(l.id == listing_id for l in user.saved)
    if is_saved:
        user.saved = [l for l in user.saved if l.id != listing_id]
    else:
        user.saved.append(listing)

    db.commit()
    return {"saved": not is_saved}
