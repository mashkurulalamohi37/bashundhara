from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.facility import FacilityAsset, FacilityWorkOrder, UtilityMeter, UtilityReading
from app.schemas.domain import AssetCreate, WorkOrderCreate, UtilityReadingCreate
import uuid

router = APIRouter()

# Assets
@router.get("/assets")
def list_assets(db: Session = Depends(get_db)):
    return db.query(FacilityAsset).all()

@router.post("/assets")
def create_asset(data: AssetCreate, db: Session = Depends(get_db)):
    asset_id = f"AST-{uuid.uuid4().hex[:6].upper()}"
    code = f"{data.category[:3].upper()}-A-{uuid.uuid4().hex[:4].upper()}"
    asset = FacilityAsset(
        id=asset_id,
        asset_code=code,
        name=data.name,
        category=data.category,
        subcategory=data.subcategory,
        manufacturer="Enterprise Manufacturer",
        brand="Standard",
        model="V-2026",
        serial_number=f"SN-{uuid.uuid4().hex[:6].upper()}",
        purchase_date="2024-01-15",
        installation_date="2024-02-01",
        purchase_cost=data.purchaseCost,
        current_value=data.purchaseCost,
        warranty_expiry="2027-12-31",
        community="Bashundhara R/A",
        block="Block A",
        road="Road 5",
        building_id="BLD-004",
        building_name=data.buildingName,
        floor="Ground Floor",
        room=data.room,
        facility_area="Common Area",
        responsible_department="Facility Operations",
        responsible_person="Facility Manager",
        status="Operational",
        condition="Excellent",
        expected_life_years=15,
        last_maintenance_date="2026-08-01",
        next_maintenance_date="2026-09-01",
        qr_code_url=f"/qr-placeholder/{code}",
        notes="Created via API."
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset

# Work Orders
@router.get("/work-orders")
def list_work_orders(db: Session = Depends(get_db)):
    return db.query(FacilityWorkOrder).all()

@router.post("/work-orders")
def create_work_order(data: WorkOrderCreate, db: Session = Depends(get_db)):
    wo_id = f"WO-{uuid.uuid4().hex[:6].upper()}"
    code = f"WO-FAC-{uuid.uuid4().hex[:4].upper()}"
    asset = db.query(FacilityAsset).filter(FacilityAsset.id == data.assetId).first()
    
    wo = FacilityWorkOrder(
        id=wo_id,
        work_order_code=code,
        asset_id=data.assetId,
        asset_name=asset.name if asset else "Facility Asset",
        asset_code=asset.asset_code if asset else "AST-000",
        location=f"{asset.room if asset else 'Common Area'}, Meghna Tower",
        building_id="BLD-004",
        issue=data.issue,
        description=data.description,
        priority=data.priority,
        maintenance_type=data.maintenanceType,
        requested_by="Facility Control Center",
        assigned_department="Facility Maintenance",
        assigned_technician=data.assignedTechnician,
        vendor_name=data.vendorName,
        scheduled_date="2026-08-17",
        due_date="2026-08-18",
        sla_minutes=240,
        status="Assigned",
        estimated_cost=data.estimatedCost or 5000.0,
    )
    db.add(wo)
    db.commit()
    db.refresh(wo)
    return wo

# Utility Meters & Readings
@router.get("/utilities/meters")
def list_meters(db: Session = Depends(get_db)):
    return db.query(UtilityMeter).all()

@router.post("/utilities/readings")
def record_reading(data: UtilityReadingCreate, db: Session = Depends(get_db)):
    meter = db.query(UtilityMeter).filter(UtilityMeter.id == data.meterId).first()
    if not meter:
        raise HTTPException(status_code=404, detail="Meter not found")
    
    consumption = max(0.0, data.currentReading - meter.current_reading)
    cost = consumption * meter.rate_per_unit
    
    reading = UtilityReading(
        id=f"RDG-{uuid.uuid4().hex[:6].upper()}",
        meter_id=data.meterId,
        meter_code=meter.meter_code,
        utility_type=meter.utility_type,
        building_name=meter.building_name,
        previous_reading=meter.current_reading,
        current_reading=data.currentReading,
        consumption=consumption,
        unit=meter.unit,
        reading_date="2026-08-17",
        reader_name=data.readerName,
        reading_source="Manual",
        cost_bdt=cost,
        is_anomaly=consumption > 5000
    )
    meter.previous_reading = meter.current_reading
    meter.current_reading = data.currentReading
    
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading
