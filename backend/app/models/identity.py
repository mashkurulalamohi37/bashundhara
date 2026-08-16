from sqlalchemy import Column, String, Boolean, DateTime, Integer, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    name_bn = Column(String, nullable=True)
    role = Column(String, nullable=False, index=True)
    phone = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    block = Column(String, nullable=False, default="Block A")
    property_id = Column(String, nullable=True)
    avatar_initials = Column(String, nullable=False, default="BR")
    created_at = Column(DateTime, default=datetime.utcnow)

class Person(Base):
    __tablename__ = "persons"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    name_bn = Column(String, nullable=True)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=True)
    nid = Column(String, nullable=True)
    emergency_contact = Column(String, nullable=True)
    language = Column(String, default="en")

class PropertyClaim(Base):
    __tablename__ = "property_claims"

    id = Column(String, primary_key=True, index=True)
    person_id = Column(String, nullable=False)
    applicant = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    property_id = Column(String, nullable=False)
    property_label = Column(String, nullable=False)
    block = Column(String, nullable=False)
    road = Column(String, nullable=False)
    building = Column(String, nullable=False)
    flat = Column(String, nullable=False)
    relationship_type = Column(String, nullable=False)
    documents = Column(JSON, default=[])
    submitted_on = Column(String, nullable=False)
    reviewer = Column(String, nullable=True)
    review_notes = Column(String, default="")
    status = Column(String, default="pending_verification", index=True)
