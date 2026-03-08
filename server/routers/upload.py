from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
import cloudinary
import cloudinary.uploader
import os
from routers.auth import get_current_user
import models

router = APIRouter(prefix="/api/upload", tags=["upload"])

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

@router.post("/")
async def upload_image(
    image: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user)
):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    if image.size and image.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB.")

    contents = await image.read()

    result = cloudinary.uploader.upload(
        contents,
        folder="roomie/listings",
        transformation=[{"width": 1200, "crop": "limit"}, {"quality": "auto"}]
    )

    return {"url": result["secure_url"], "public_id": result["public_id"]}
