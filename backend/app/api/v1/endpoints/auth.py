from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import os
from app.db.session import get_db
from app.models.identity import User
from app.schemas.domain import LoginRequest, LoginAsRequest, Token
from app.core.security import verify_password, create_access_token, require_roles

router = APIRouter()

MOCK_USERS = {
  "super_admin": {"id": "USR-001", "name": "Golam Rabbani", "nameBn": "গোলাম রব্বানী", "role": "super_admin", "phone": "+8801711000001", "email": "admin@bashundhara.com", "block": "Block A", "avatarInitials": "GR"},
  "community_admin": {"id": "USR-002", "name": "Kazi Nazrul Islam", "nameBn": "কাজী নজরুল ইসলাম", "role": "community_admin", "phone": "+8801711000002", "email": "community@bashundhara.com", "block": "Block A", "avatarInitials": "KN"},
  "resident": {"id": "USR-008", "name": "Tanvir Hasan", "nameBn": "তানভীর হাসান", "role": "resident", "phone": "+8801711000008", "email": "resident@bashundhara.com", "block": "Block A", "propertyId": "PRP-A3", "avatarInitials": "TH"},
  "caretaker": {"id": "USR-014", "name": "Jamal Uddin", "nameBn": "জামাল উদ্দিন", "role": "caretaker", "phone": "+8801711000014", "email": "caretaker@bashundhara.com", "block": "Block A", "avatarInitials": "JU"},
  "security_officer": {"id": "USR-004", "name": "Rakib Sarker", "nameBn": "রাকিব সরকার", "role": "security_officer", "phone": "+8801711000004", "email": "security@bashundhara.com", "block": "Block A", "avatarInitials": "RS"},
}

@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user_row = db.query(User).filter((User.email == data.identifier) | (User.phone == data.identifier)).first()
    
    if user_row:
        if not verify_password(data.password, user_row.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email/phone or password")
        
        token = create_access_token(data={"sub": user_row.id, "role": user_row.role})
        user_dict = {
            "id": user_row.id,
            "name": user_row.name,
            "nameBn": user_row.name_bn,
            "role": user_row.role,
            "phone": user_row.phone,
            "email": user_row.email,
            "block": user_row.block,
            "propertyId": user_row.property_id,
            "avatarInitials": user_row.avatar_initials,
        }
        return {"access_token": token, "token_type": "bearer", "user": user_dict}

    # Fallback check for demo environment accounts with password validation
    matched_user = None
    for u in MOCK_USERS.values():
        if u["email"] == data.identifier or u["phone"] == data.identifier:
            matched_user = u
            break

    if not matched_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account not found. Please register or verify credentials.")

    if not verify_password(data.password, "bcrypt-hashed-pw"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password. Please try again.")

    token = create_access_token(data={"sub": matched_user["id"], "role": matched_user["role"]})
    return {"access_token": token, "token_type": "bearer", "user": matched_user}

@router.post("/login-as", response_model=Token)
def login_as(data: LoginAsRequest):
    # Only allow demo role-switching in development mode
    if os.getenv("ENVIRONMENT", "development") == "production":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Role impersonation is disabled in production environment.")
    
    user_dict = MOCK_USERS.get(data.role, MOCK_USERS["resident"])
    token = create_access_token(data={"sub": user_dict["id"], "role": user_dict["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_dict,
    }
