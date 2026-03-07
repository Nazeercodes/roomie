from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from auth import hash_password, verify_password, create_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=schemas.AuthResponse, status_code=201)
def register(body: schemas.RegisterRequest, db: Session = Depends(get_db)):
    if not body.name or not body.email or not body.password:
        raise HTTPException(status_code=400, detail="All fields are required")

    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    existing = db.query(models.User).filter(models.User.email == body.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        name=body.name,
        email=body.email.lower(),
        password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return schemas.AuthResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        avatar=user.avatar,
        token=create_token(user.id),
    )

@router.post("/login", response_model=schemas.AuthResponse)
def login(body: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email.lower()).first()
    if not user or not verify_password(body.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    return schemas.AuthResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        avatar=user.avatar,
        token=create_token(user.id),
    )
