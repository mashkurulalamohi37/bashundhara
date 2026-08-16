from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.identity import PropertyClaim, Person, User
from app.schemas.domain import PropertyClaimCreate
from app.core.security import get_current_user, require_roles
import uuid

router = APIRouter()

@router.get("/claims")
def get_claims(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Admins see all claims; residents see only their own claims
    if current_user.role in ["super_admin", "community_admin", "property_manager"]:
        return db.query(PropertyClaim).all()
    return db.query(PropertyClaim).filter(PropertyClaim.person_id == current_user.id).all()

@router.post("/claims")
def create_claim(
    data: PropertyClaimCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    claim_id = f"CLM-{uuid.uuid4().hex[:6].upper()}"
    claim = PropertyClaim(
        id=claim_id,
        person_id=current_user.id,
        applicant=data.applicant,
        phone=data.phone,
        property_id=f"PRP-{data.flat}",
        property_label=f"Flat {data.flat}, {data.building}",
        block=data.block,
        road=data.road,
        building=data.building,
        flat=data.flat,
        relationship_type=data.relationship,
        documents=data.documents,
        submitted_on=db.scalar("SELECT NOW()::text") or "2026-08-17",
        status="pending_verification",
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim

@router.post("/claims/{claim_id}/review")
def review_claim(
    claim_id: str,
    status: str,
    reviewer: str = "Community Admin",
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_roles(["super_admin", "community_admin"]))
):
    claim = db.query(PropertyClaim).filter(PropertyClaim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    claim.status = status
    claim.reviewer = current_admin.name
    db.commit()
    db.refresh(claim)
    return claim
