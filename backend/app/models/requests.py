from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON
from datetime import datetime
from app.db.session import Base

class OpsRequest(Base):
    __tablename__ = "ops_requests"

    id = Column(String, primary_key=True, index=True)
    request_type = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    priority = Column(String, default="normal", index=True)
    status = Column(String, default="new", index=True)
    requester_id = Column(String, nullable=False)
    requester_name = Column(String, nullable=False)
    flat_id = Column(String, nullable=False)
    building_id = Column(String, nullable=False)
    block = Column(String, nullable=False)
    department = Column(String, nullable=False)
    assigned_role = Column(String, nullable=False)
    assignee_name = Column(String, nullable=True)
    handling_mode = Column(String, default="caretaker_assisted")
    needs_access_pass = Column(Boolean, default=False)
    access_pass_id = Column(String, nullable=True)
    provider_name = Column(String, nullable=True)
    amount = Column(Float, default=0.0)
    payment_status = Column(String, default="not_applicable")
    sla_minutes = Column(Integer, default=60)
    created_at = Column(DateTime, default=datetime.utcnow)
    due_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    escalation_level = Column(Integer, default=0)
    timeline = Column(JSON, default=[])

class OpsTask(Base):
    __tablename__ = "ops_tasks"

    id = Column(String, primary_key=True, index=True)
    request_id = Column(String, nullable=False, index=True)
    task_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    assigned_role = Column(String, nullable=False)
    assignee_name = Column(String, nullable=False)
    building_id = Column(String, nullable=False)
    flat_id = Column(String, nullable=False)
    priority = Column(String, default="normal")
    sla_minutes = Column(Integer, default=60)
    created_at = Column(DateTime, default=datetime.utcnow)
    due_at = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    requires_photo = Column(Boolean, default=False)
    requires_otp = Column(Boolean, default=False)
    notes = Column(String, default="")
    status = Column(String, default="new", index=True)

class TemporaryAccessPass(Base):
    __tablename__ = "access_passes"

    id = Column(String, primary_key=True, index=True)
    person_name = Column(String, nullable=False)
    person_type = Column(String, nullable=False)
    purpose = Column(String, nullable=False)
    property_id = Column(String, nullable=False)
    property_label = Column(String, nullable=False)
    zone = Column(String, nullable=False)
    gate = Column(String, nullable=False)
    valid_from = Column(String, nullable=False)
    valid_to = Column(String, nullable=False)
    host = Column(String, nullable=False)
    qr_code = Column(String, nullable=False)
    otp = Column(String, nullable=False)
    request_id = Column(String, nullable=True)
    status = Column(String, default="active", index=True)
