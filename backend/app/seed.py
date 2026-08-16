from app.db.session import SessionLocal
from app.models.identity import User
from app.models.facility import FacilityAsset, FacilityWorkOrder, UtilityMeter
from app.models.requests import OpsRequest, OpsTask

def seed_database():
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            db.add_all([
                User(id="USR-001", name="Golam Rabbani", name_bn="গোলাম রব্বানী", role="super_admin", phone="+8801711000001", email="admin@bashundhara.com", password_hash="bcrypt-hashed-pw", block="Block A", avatar_initials="GR"),
                User(id="USR-002", name="Kazi Nazrul Islam", name_bn="কাজী নজরুল ইসলাম", role="community_admin", phone="+8801711000002", email="community@bashundhara.com", password_hash="bcrypt-hashed-pw", block="Block A", avatar_initials="KN"),
                User(id="USR-008", name="Tanvir Hasan", name_bn="তানভীর হাসান", role="resident", phone="+8801711000008", email="resident@bashundhara.com", password_hash="bcrypt-hashed-pw", block="Block A", property_id="PRP-A3", avatar_initials="TH"),
                User(id="USR-014", name="Jamal Uddin", name_bn="জামাল উদ্দিন", role="caretaker", phone="+8801711000014", email="caretaker@bashundhara.com", password_hash="bcrypt-hashed-pw", block="Block A", avatar_initials="JU"),
            ])
        
        if db.query(FacilityAsset).count() == 0:
            db.add_all([
                FacilityAsset(
                    id="AST-GEN-01", asset_code="GEN-A-001", name="Primary Diesel Generator 500kVA",
                    category="Generator", subcategory="Diesel Generator", manufacturer="Cummins Power", brand="Cummins",
                    model="C500D5e", serial_number="CUM-2023-88912", purchase_date="2023-01-15", installation_date="2023-02-01",
                    purchase_cost=4500000, current_value=3800000, warranty_expiry="2026-02-01", community="Bashundhara R/A",
                    block="Block A", road="Road 5", building_id="BLD-004", building_name="Meghna Tower", floor="Basement 1",
                    room="Substation Room B101", facility_area="Generator Room", responsible_department="Electrical & Power",
                    responsible_person="Engineer Jamal Hossain", vendor_name="Energypac Engineering", amc_name="Energypac Cummins AMC",
                    status="Operational", condition="Excellent", expected_life_years=15, last_maintenance_date="2026-08-01",
                    next_maintenance_date="2026-09-01", qr_code_url="/qr-placeholder/GEN-A-001", notes="Primary backup power."
                ),
                FacilityAsset(
                    id="AST-LFT-01", asset_code="LFT-A-001", name="Passenger Elevator #1 (High-Speed)",
                    category="Lift", subcategory="Traction Elevator", manufacturer="KONE Elevators", brand="KONE",
                    model="MonoSpace 500", serial_number="KNE-883190", purchase_date="2022-06-10", installation_date="2022-08-15",
                    purchase_cost=3200000, current_value=2700000, warranty_expiry="2025-08-15", community="Bashundhara R/A",
                    block="Block A", road="Road 5", building_id="BLD-004", building_name="Meghna Tower", floor="Floor 1-12",
                    room="Lift Shaft A", facility_area="Elevator Lobby", responsible_department="Mechanical",
                    responsible_person="Technician Imran Bhuiyan", vendor_name="KONE Bangladesh Ltd", amc_name="KONE Comprehensive Lift AMC",
                    status="Operational", condition="Good", expected_life_years=20, last_maintenance_date="2026-07-20",
                    next_maintenance_date="2026-08-20", qr_code_url="/qr-placeholder/LFT-A-001", notes="13-person passenger lift."
                ),
            ])

        if db.query(UtilityMeter).count() == 0:
            db.add_all([
                UtilityMeter(
                    id="MTR-ELEC-01", meter_code="MTR-ELEC-BLD4", utility_type="Electricity", location="Substation Room",
                    building_id="BLD-004", building_name="Meghna Tower", serial_number="DESCO-SM-99120", previous_reading=142500,
                    current_reading=148900, unit="kWh", status="Active", rate_per_unit=11.5
                ),
                UtilityMeter(
                    id="MTR-WAT-01", meter_code="MTR-WAT-BLD4", utility_type="Water", location="Underground Reservoir",
                    building_id="BLD-004", building_name="Meghna Tower", serial_number="WASA-M-55102", previous_reading=32400,
                    current_reading=35100, unit="m³", status="Active", rate_per_unit=42.0
                )
            ])

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error seeding DB: {e}")
    finally:
        db.close()
