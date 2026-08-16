from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

# Token & Auth
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Any

class LoginRequest(BaseModel):
    identifier: str
    password: str

class LoginAsRequest(BaseModel):
    role: str

# Identity
class UserSchema(BaseModel):
    id: str
    name: str
    nameBn: Optional[str] = None
    role: str
    phone: str
    email: str
    block: str
    propertyId: Optional[str] = None
    avatarInitials: str

    class Config:
        from_attributes = True

# Property Claims
class PropertyClaimCreate(BaseModel):
    applicant: str
    phone: str
    block: str
    road: str
    building: str
    flat: str
    relationship: str
    documents: List[str] = []

# Request Engine
class RequestCreate(BaseModel):
    type: str
    category: Optional[str] = "General"
    title: str
    description: str
    priority: Optional[str] = "normal"
    requesterName: str
    flatId: str
    buildingId: Optional[str] = "BLD-004"
    block: Optional[str] = "Block A"
    providerName: Optional[str] = None
    amount: Optional[float] = 0.0

class StatusUpdate(BaseModel):
    status: str
    comment: Optional[str] = ""

class TaskUpdate(BaseModel):
    status: str
    note: Optional[str] = ""
    photo: Optional[bool] = False

# Facility Assets & Work Orders
class AssetCreate(BaseModel):
    name: str
    category: str
    subcategory: str
    buildingName: str
    room: str
    purchaseCost: float = Field(default=100000.0, ge=0)

class WorkOrderCreate(BaseModel):
    assetId: str
    issue: str
    description: str
    priority: str = "normal"
    maintenanceType: str = "Corrective"
    assignedTechnician: str
    vendorName: Optional[str] = None
    estimatedCost: Optional[float] = 0.0

class UtilityReadingCreate(BaseModel):
    meterId: str
    currentReading: float
    readerName: str
