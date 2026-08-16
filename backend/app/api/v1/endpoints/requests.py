from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.requests import OpsRequest, OpsTask, TemporaryAccessPass
from app.models.identity import User
from app.schemas.domain import RequestCreate, StatusUpdate, TaskUpdate
from app.core.security import get_current_user, require_roles
import uuid
from datetime import datetime

router = APIRouter()

@router.get("/")
def list_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Staff / Admins see all operational requests; residents see only their submitted requests
    if current_user.role in ["super_admin", "community_admin", "maintenance_manager", "caretaker", "security_officer", "property_manager"]:
        return db.query(OpsRequest).all()
    return db.query(OpsRequest).filter(OpsRequest.requester_id == current_user.id).all()

@router.post("/")
def create_request(
    data: RequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req_id = f"REQ-{uuid.uuid4().hex[:6].upper()}"
    
    # Department routing logic
    dept = "Caretaker Operations" if data.type in ["service", "caretaker"] else "Maintenance" if data.type == "maintenance" else "Security"
    role = "Caretaker" if data.type in ["service", "caretaker"] else "Maintenance Staff" if data.type == "maintenance" else "Security Officer"
    
    request_obj = OpsRequest(
        id=req_id,
        request_type=data.type,
        category=data.category or "General",
        title=data.title,
        description=data.description,
        priority=data.priority or "normal",
        status="assigned",
        requester_id=current_user.id,
        requester_name=current_user.name,
        flat_id=data.flatId,
        building_id=data.buildingId or "BLD-004",
        block=data.block or current_user.block,
        department=dept,
        assigned_role=role,
        assignee_name="Jamal Uddin" if role == "Caretaker" else "Imran Bhuiyan",
        handling_mode="caretaker_assisted",
        needs_access_pass=data.type in ["service", "delivery"],
        provider_name=data.providerName,
        amount=data.amount or 0.0,
        sla_minutes=30 if data.type == "service" else 120,
        timeline=[
            {"id": f"EVT-1", "at": datetime.utcnow().isoformat(), "actor": current_user.name, "actorRole": current_user.role, "label": "Request created", "detail": data.title, "tone": "neutral"},
            {"id": f"EVT-2", "at": datetime.utcnow().isoformat(), "actor": "Routing engine", "actorRole": "System", "label": f"Routed to {dept}", "detail": f"Assigned to {role}", "tone": "neutral"}
        ]
    )
    db.add(request_obj)
    
    # Auto-generate tasks
    task = OpsTask(
        id=f"TSK-{uuid.uuid4().hex[:6].upper()}",
        request_id=req_id,
        task_type="service_pickup" if data.type == "service" else "maintenance_check",
        title=f"Execute {data.title}",
        assigned_role=role,
        assignee_name="Jamal Uddin" if role == "Caretaker" else "Imran Bhuiyan",
        building_id=data.buildingId or "BLD-004",
        flat_id=data.flatId,
        priority=data.priority or "normal",
        status="assigned"
    )
    db.add(task)
    
    db.commit()
    db.refresh(request_obj)
    return request_obj

@router.put("/{request_id}/status")
def update_status(
    request_id: str,
    data: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(OpsRequest).filter(OpsRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Check permissions: Staff can update status, or requester can cancel
    if current_user.role == "resident" and req.requester_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to modify this request")
    
    req.status = data.status
    if data.status == "completed":
        req.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(req)
    return req

@router.get("/tasks")
def list_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["super_admin", "community_admin", "caretaker", "maintenance_staff", "security_officer"]))
):
    return db.query(OpsTask).all()

@router.put("/tasks/{task_id}")
def update_task(
    task_id: str,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["super_admin", "community_admin", "caretaker", "maintenance_staff", "security_officer"]))
):
    task = db.query(OpsTask).filter(OpsTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = data.status
    if data.status == "completed":
        task.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task
