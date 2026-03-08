from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, 
    ForeignKey, Table, Text, Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func
import uuid
from database import Base

def gen_uuid():
    return str(uuid.uuid4())

# Many-to-many: users <-> saved listings
saved_listings_table = Table(
    "saved_listings",
    Base.metadata,
    Column("user_id", String, ForeignKey("users.id"), primary_key=True),
    Column("listing_id", String, ForeignKey("listings.id"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    avatar = Column(String, default="")
    bio = Column(String(300), default="")
    age = Column(Integer, nullable=True)
    gender = Column(Enum("Male", "Female", "Other", name="gender_enum"), nullable=True)
    phone = Column(String, default="")
    city = Column(String, default="")

    # Lifestyle preferences (flattened — no nested objects in SQL)
    lifestyle = Column(Enum("Student", "Working Professional", "Other", name="lifestyle_enum"), default="Other")
    sleep_time = Column(Enum("Early Bird", "Night Owl", "Flexible", name="sleep_enum"), default="Flexible")
    smoking = Column(Boolean, default=False)
    pets = Column(Boolean, default=False)
    drinking = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    listings = relationship("Listing", back_populates="owner", cascade="all, delete")
    saved = relationship("Listing", secondary=saved_listings_table, back_populates="saved_by")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")


class Listing(Base):
    __tablename__ = "listings"

    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    rent = Column(Float, nullable=False)
    city = Column(String, nullable=False, index=True)
    locality = Column(String, nullable=False)
    bhk_type = Column(Enum("1BHK", "2BHK", "3BHK", "Studio", "PG", name="bhk_enum"), nullable=False)
    available_from = Column(String, nullable=False)  # ISO date string
    gender_preference = Column(Enum("Male", "Female", "Any", name="gender_pref_enum"), default="Any")
    images = Column(ARRAY(String), default=[])
    amenities = Column(ARRAY(String), default=[])
    is_active = Column(Boolean, default=True)

    posted_by = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="listings")
    saved_by = relationship("User", secondary=saved_listings_table, back_populates="saved")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=gen_uuid)
    conversation_id = Column(String, nullable=False, index=True)
    sender_id = Column(String, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(String, ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")
