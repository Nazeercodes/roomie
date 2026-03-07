from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/api/messages", tags=["messages"])

@router.get("/conversations/list")
def get_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Get the latest message per conversation
    messages = db.query(models.Message).filter(
        (models.Message.sender_id == current_user.id) |
        (models.Message.receiver_id == current_user.id)
    ).order_by(models.Message.created_at.desc()).all()

    seen = set()
    conversations = []
    for msg in messages:
        if msg.conversation_id not in seen:
            seen.add(msg.conversation_id)
            conversations.append(schemas.MessageOut.from_orm(msg))
    return conversations

@router.get("/{user_id}", response_model=List[schemas.MessageOut])
def get_conversation(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    conversation_id = "_".join(sorted([current_user.id, user_id]))
    return db.query(models.Message).filter(
        models.Message.conversation_id == conversation_id
    ).order_by(models.Message.created_at.asc()).all()

@router.post("/", response_model=schemas.MessageOut, status_code=201)
def send_message(
    body: schemas.SendMessageRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    conversation_id = "_".join(sorted([current_user.id, body.receiver_id]))
    message = models.Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        receiver_id=body.receiver_id,
        text=body.text,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
