from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON
from datetime import datetime
from app.db.session import Base

class FacilityAsset(Base):
    __tablename__ = "facility_assets"

    id = Column(String, primary_key=True, index=True)
    asset_code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False, index=True)
    subcategory = Column(String, nullable=False)
    manufacturer = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    serial_number = Column(String, nullable=False)
    purchase_date = Column(String, nullable=False)
    installation_date = Column(String, nullable=False)
    purchase_cost = Column(Float, default=0.0)
    current_value = Column(Float, default=0.0)
    warranty_expiry = Column(String, nullable=False)
    
    community = Column(String, default="Bashundhara R/A")
    block = Column(String, nullable=False)
    road = Column(String, nullable=False)
    building_id = Column(String, nullable=False)
    building_name = Column(String, nullable=False)
    floor = Column(String, nullable=False)
    room = Column(String, nullable=False)
    facility_area = Column(String, nullable=False)
    
    responsible_department = Column(String, nullable=False)
    responsible_person = Column(String, nullable=False)
    vendor_name = Column(String, nullable=True)
    amc_name = Column(String, nullable=True)
    
    status = Column(String, default="Operational", index=True)
    condition = Column(String, default="Excellent")
    expected_life_years = Column(Integer, default=15)
    last_maintenance_date = Column(String, nullable=False)
    next_maintenance_date = Column(String, nullable=False)
    qr_code_url = Column(String, nullable=False)
    notes = Column(String, default="")

class FacilityWorkOrder(Base):
    __tablename__ = "facility_work_orders"

    id = Column(String, primary_key=True, index=True)
    work_order_code = Column(String, unique=True, index=True, nullable=False)
    asset_id = Column(String, nullable=False)
    asset_name = Column(String, nullable=False)
    asset_code = Column(String, nullable=False)
    location = Column(String, nullable=False)
    building_id = Column(String, nullable=False)
    issue = Column(String, nullable=False)
    description = Column(String, nullable=False)
    priority = Column(String, default="normal")
    maintenance_type = Column(String, default="Corrective")
    requested_by = Column(String, nullable=False)
    assigned_department = Column(String, nullable=False)
    assigned_technician = Column(String, nullable=False)
    vendor_name = Column(String, nullable=True)
    scheduled_date = Column(String, nullable=False)
    due_date = Column(String, nullable=False)
    sla_minutes = Column(Integer, default=240)
    status = Column(String, default="Assigned", index=True)
    estimated_cost = Column(Float, default=0.0)
    actual_cost = Column(Float, default=0.0)
    labor_cost = Column(Float, default=0.0)
    parts_cost = Column(Float, default=0.0)
    vendor_cost = Column(Float, default=0.0)
    parts_used = Column(JSON, default=[])
    notes = Column(String, default="")

class UtilityMeter(Base):
    __tablename__ = "utility_meters"

    id = Column(String, primary_key=True, index=True)
    meter_code = Column(String, unique=True, index=True, nullable=False)
    utility_type = Column(String, nullable=False, index=True)
    location = Column(String, nullable=False)
    building_id = Column(String, nullable=False)
    building_name = Column(String, nullable=False)
    serial_number = Column(String, nullable=False)
    previous_reading = Column(Float, default=0.0)
    current_reading = Column(Float, default=0.0)
    unit = Column(String, nullable=False)
    status = Column(String, default="Active")
    rate_per_unit = Column(Float, default=10.0)

class UtilityReading(Base):
    __tablename__ = "utility_readings"

    id = Column(String, primary_key=True, index=True)
    meter_id = Column(String, nullable=False)
    meter_code = Column(String, nullable=False)
    utility_type = Column(String, nullable=False)
    building_name = Column(String, nullable=False)
    previous_reading = Column(Float, default=0.0)
    current_reading = Column(Float, default=0.0)
    consumption = Column(Float, default=0.0)
    unit = Column(String, nullable=False)
    reading_date = Column(String, nullable=False)
    reader_name = Column(String, nullable=False)
    reading_source = Column(String, default="Manual")
    cost_bdt = Column(Float, default=0.0)
    is_anomaly = Column(Boolean, default=False)
