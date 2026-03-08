from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import os
from database import get_db
import models, schemas

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()

JWT_SECRET = os.getenv("JWT_SECRET", "change_this_secret")
JWT_EXPIRE_DAYS = int(os.getenv("JWT_EXPIRE_DAYS", 7))
ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS)
    return jwt.encode({"sub": user_id, "exp": expire}, JWT_SECRET, algorithm=ALGORITHM)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalid or expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise credentials_exception
    return user

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
