/**
 * Facility Core Service — Reactive In-Memory Store & Operations Engine
 * 
 * Centralized state management for Facility Core Service using `useSyncExternalStore`.
 * Integrates with opsStore (requests/tasks), accounts, vendors, security passes, and audit log.
 */
import type {
  AMCContract, AMCVisit, AssetCategory, AssetLifecycleEvent, AssetMetric, BiomedicalEquipment,
  CalibrationRecord, ChecklistItem, ComplianceInspection, ComplianceRequirement, FacilityAsset,
  FacilityBudget, FacilityCostRecord, FacilityDashboardSummary, FacilityInspection, FacilityInventoryItem,
  FacilityWorkOrder, HousekeepingSchedule, HousekeepingTask, MaintenanceType, PreventiveSchedule,
  UtilityAlert, UtilityMeter, UtilityReading, WasteCollection, WorkOrderPriority, WorkOrderStatus,
  FacilityVendor,
} from "@/types/facility";
import { opsStore } from "./opsStore";

const now = () => new Date();
const iso = (d: Date) => d.toISOString();
const daysAgo = (d: number) => iso(new Date(Date.now() - d * 86400_000));
const daysAhead = (d: number) => iso(new Date(Date.now() + d * 86400_000));

let seq = 3000;
const nextId = (prefix: string) => `${prefix}-${++seq}`;

/* ----------------------------------------------------------- Initial Mock Data */

const INITIAL_ASSETS: FacilityAsset[] = [
  {
    id: "AST-GEN-01",
    assetCode: "GEN-A-001",
    name: "Primary Diesel Generator 500kVA",
    category: "Generator",
    subcategory: "Diesel Generator",
    manufacturer: "Cummins Power",
    brand: "Cummins",
    model: "C500D5e",
    serialNumber: "CUM-2023-88912",
    purchaseDate: "2023-01-15",
    installationDate: "2023-02-01",
    purchaseCost: 4500000,
    currentValue: 3800000,
    warrantyExpiry: "2026-02-01",
    community: "Bashundhara R/A",
    block: "Block A",
    road: "Road 5",
    buildingId: "BLD-004",
    buildingName: "Meghna Tower",
    floor: "Basement 1",
    room: "Substation Room B101",
    facilityArea: "Generator Room",
    responsibleDepartment: "Electrical & Power",
    responsiblePerson: "Engineer Jamal Hossain",
    vendorId: "VND-ENG-01",
    vendorName: "Energypac Engineering",
    amcId: "AMC-GEN-01",
    amcName: "Energypac Cummins AMC",
    status: "Operational",
    condition: "Excellent",
    expectedLifeYears: 15,
    lastMaintenanceDate: daysAgo(12),
    nextMaintenanceDate: daysAhead(18),
    qrCodeUrl: "/qr-placeholder/GEN-A-001",
    documentsCount: 4,
    photosCount: 3,
    notes: "Primary backup power source for Meghna Tower. Operates on automatic transfer switch.",
  },
  {
    id: "AST-LFT-01",
    assetCode: "LFT-A-001",
    name: "Passenger Elevator #1 (High-Speed)",
    category: "Lift",
    subcategory: "Traction Elevator",
    manufacturer: "KONE Elevators",
    brand: "KONE",
    model: "MonoSpace 500",
    serialNumber: "KNE-883190",
    purchaseDate: "2022-06-10",
    installationDate: "2022-08-15",
    purchaseCost: 3200000,
    currentValue: 2700000,
    warrantyExpiry: "2025-08-15",
    community: "Bashundhara R/A",
    block: "Block A",
    road: "Road 5",
    buildingId: "BLD-004",
    buildingName: "Meghna Tower",
    floor: "Floor 1-12",
    room: "Lift Shaft A",
    facilityArea: "Elevator Lobby",
    responsibleDepartment: "Mechanical",
    responsiblePerson: "Technician Imran Bhuiyan",
    vendorId: "VND-KNE-01",
    vendorName: "KONE Bangladesh Ltd",
    amcId: "AMC-LFT-01",
    amcName: "KONE Comprehensive Lift AMC",
    status: "Operational",
    condition: "Good",
    expectedLifeYears: 20,
    lastMaintenanceDate: daysAgo(25),
    nextMaintenanceDate: daysAhead(5),
    qrCodeUrl: "/qr-placeholder/LFT-A-001",
    documentsCount: 6,
    photosCount: 2,
    notes: "13-person passenger lift. Annual safety load test passed.",
  },
  {
    id: "AST-PMP-01",
    assetCode: "PMP-A-002",
    name: "Main Water Hydro-Pneumatic Pump System",
    category: "Water Pump",
    subcategory: "Centrifugal Pump",
    manufacturer: "Grundfos Pumps",
    brand: "Grundfos",
    model: "CRN 15-7",
    serialNumber: "GF-992104",
    purchaseDate: "2023-04-12",
    installationDate: "2023-05-01",
    purchaseCost: 850000,
    currentValue: 720000,
    warrantyExpiry: "2026-05-01",
    community: "Bashundhara R/A",
    block: "Block A",
    road: "Road 5",
    buildingId: "BLD-004",
    buildingName: "Meghna Tower",
    floor: "Basement 2",
    room: "Pump Room B204",
    facilityArea: "Pump Room",
    responsibleDepartment: "Plumbing & Water Supply",
    responsiblePerson: "Ripon Sheikh",
    vendorId: "VND-PLM-01",
    vendorName: "Aqua Solutions BD",
    amcId: "AMC-PMP-01",
    amcName: "Grundfos Pump AMC",
    status: "Under Maintenance",
    condition: "Fair",
    expectedLifeYears: 10,
    lastMaintenanceDate: daysAgo(40),
    nextMaintenanceDate: daysAgo(2), // Overdue
    qrCodeUrl: "/qr-placeholder/PMP-A-002",
    documentsCount: 2,
    photosCount: 4,
    notes: "Bearing noise reported during regular inspection. Work Order assigned.",
  },
  {
    id: "AST-SOL-01",
    assetCode: "SOL-C-001",
    name: "Rooftop Solar PV Array 45kWp",
    category: "Solar Equipment",
    subcategory: "Grid-Tied Solar System",
    manufacturer: "Huawei Solar / Trina",
    brand: "Huawei",
    model: "SUN2000-50KTL",
    serialNumber: "HW-SOL-2024-001",
    purchaseDate: "2024-02-10",
    installationDate: "2024-03-01",
    purchaseCost: 2800000,
    currentValue: 2650000,
    warrantyExpiry: "2029-03-01",
    community: "Bashundhara R/A",
    block: "Block C",
    road: "Road 11",
    buildingId: "BLD-019",
    buildingName: "Jamuna Heights",
    floor: "Rooftop",
    room: "Solar Inverter Bay",
    facilityArea: "Rooftop",
    responsibleDepartment: "Green Energy & Utilities",
    responsiblePerson: "Engineer Jamal Hossain",
    vendorId: "VND-SOL-01",
    vendorName: "Solarland Bangladesh",
    status: "Operational",
    condition: "Excellent",
    expectedLifeYears: 25,
    lastMaintenanceDate: daysAgo(15),
    nextMaintenanceDate: daysAhead(75),
    qrCodeUrl: "/qr-placeholder/SOL-C-001",
    documentsCount: 5,
    photosCount: 5,
    notes: "Generates ~180 kWh daily for common area lighting and elevator standby.",
  },
  {
    id: "AST-BIO-01",
    assetCode: "BIO-CLN-001",
    name: "Multi-Parameter Patient Monitor & ECG",
    category: "Medical Equipment",
    subcategory: "Diagnostic Monitor",
    manufacturer: "Mindray Medical",
    brand: "Mindray",
    model: "uMEC12",
    serialNumber: "MDR-BIO-7712",
    purchaseDate: "2023-11-01",
    installationDate: "2023-11-15",
    purchaseCost: 450000,
    currentValue: 390000,
    warrantyExpiry: "2026-11-15",
    community: "Bashundhara R/A",
    block: "Block C",
    road: "Road 10",
    buildingId: "BLD-CLN-01",
    buildingName: "Bashundhara Welfare Clinic",
    floor: "Floor 1",
    room: "Emergency Ward Room 102",
    facilityArea: "Medical Facility",
    responsibleDepartment: "Healthcare & Biomedical",
    responsiblePerson: "Dr. Farhana Rahman / Tech Nazmul",
    vendorId: "VND-MED-01",
    vendorName: "MediTech Bangladesh",
    status: "Operational",
    condition: "Excellent",
    expectedLifeYears: 8,
    lastMaintenanceDate: daysAgo(60),
    nextMaintenanceDate: daysAhead(30),
    qrCodeUrl: "/qr-placeholder/BIO-CLN-001",
    documentsCount: 3,
    photosCount: 2,
    notes: "Located at Community First-Aid Center. Annual calibration required.",
  },
];

const INITIAL_WORK_ORDERS: FacilityWorkOrder[] = [
  {
    id: "WO-FAC-1001",
    workOrderCode: "WO-FAC-1001",
    assetId: "AST-PMP-01",
    assetName: "Main Water Hydro-Pneumatic Pump System",
    assetCode: "PMP-A-002",
    location: "Basement 2, Meghna Tower, Block A",
    buildingId: "BLD-004",
    issue: "Bearing noise & mechanical seal leakage",
    description: "Vibration level high, mechanical seal leaking 5L/day. Requires bearing replacement.",
    priority: "high",
    maintenanceType: "Corrective",
    requestedBy: "Caretaker Jamal Uddin",
    assignedDepartment: "Plumbing & Mechanical",
    assignedTechnician: "Imran Bhuiyan",
    vendorId: "VND-PLM-01",
    vendorName: "Aqua Solutions BD",
    scheduledDate: daysAgo(1).slice(0, 10),
    dueDate: daysAhead(1).slice(0, 10),
    slaMinutes: 240,
    status: "In Progress",
    estimatedCost: 18500,
    actualCost: 0,
    laborCost: 3500,
    partsCost: 15000,
    vendorCost: 0,
    partsUsed: [
      { id: "PART-01", partName: "Grundfos Mechanical Seal Kit", partCode: "PRT-PMP-102", quantity: 1, unitCost: 12000, totalCost: 12000 },
      { id: "PART-02", partName: "SKF Heavy Duty Bearing 6205", partCode: "PRT-BRG-205", quantity: 2, unitCost: 1500, totalCost: 3000 },
    ],
    photosCount: 3,
    notes: "Technician on site. Water bypass active.",
  },
  {
    id: "WO-FAC-1002",
    workOrderCode: "WO-FAC-1002",
    assetId: "AST-LFT-01",
    assetName: "Passenger Elevator #1",
    assetCode: "LFT-A-001",
    location: "Meghna Tower, Block A",
    buildingId: "BLD-004",
    issue: "Monthly Preventive Inspection & Door Sensor Check",
    description: "Scheduled monthly AMC preventive maintenance by KONE engineer.",
    priority: "normal",
    maintenanceType: "Preventive",
    requestedBy: "SLA Engine (Automated)",
    assignedDepartment: "Elevator Services",
    assignedTechnician: "KONE Service Tech - Subir Das",
    vendorId: "VND-KNE-01",
    vendorName: "KONE Bangladesh Ltd",
    scheduledDate: daysAhead(2).slice(0, 10),
    dueDate: daysAhead(3).slice(0, 10),
    slaMinutes: 720,
    status: "Scheduled",
    estimatedCost: 4500,
    actualCost: 4500,
    laborCost: 0,
    partsCost: 0,
    vendorCost: 4500,
    partsUsed: [],
    photosCount: 0,
    notes: "Covered under AMC contract AMC-LFT-01.",
  },
];

const INITIAL_PREVENTIVE: PreventiveSchedule[] = [
  {
    id: "PM-SCH-01",
    scheduleCode: "PM-GEN-30D",
    assetId: "AST-GEN-01",
    assetName: "Primary Diesel Generator 500kVA",
    assetCode: "GEN-A-001",
    maintenanceType: "Preventive",
    frequencyDays: 30,
    frequencyLabel: "Monthly (30 Days)",
    lastCompletedDate: daysAgo(12).slice(0, 10),
    nextDueDate: daysAhead(18).slice(0, 10),
    responsiblePerson: "Engineer Jamal Hossain",
    vendorName: "Energypac Engineering",
    estimatedCost: 8500,
    slaMinutes: 1440,
    status: "Active",
    checklist: [
      { id: "CHK-01", task: "Check engine oil level & quality", result: "Pass" },
      { id: "CHK-02", task: "Test battery voltage & electrolyte level", result: "Pass" },
      { id: "CHK-03", task: "Check diesel fuel level & water separator", result: "Pass" },
      { id: "CHK-04", task: "Coolant level & radiator fan belt tension", result: "Pass" },
      { id: "CHK-05", task: "Run load test on ATS for 15 minutes", result: "Pending" },
      { id: "CHK-06", task: "Inspect for exhaust smoke & noise anomaly", result: "Pending" },
    ],
  },
  {
    id: "PM-SCH-02",
    scheduleCode: "PM-LFT-30D",
    assetId: "AST-LFT-01",
    assetName: "Passenger Elevator #1",
    assetCode: "LFT-A-001",
    maintenanceType: "Preventive",
    frequencyDays: 30,
    frequencyLabel: "Monthly (30 Days)",
    lastCompletedDate: daysAgo(25).slice(0, 10),
    nextDueDate: daysAhead(5).slice(0, 10),
    responsiblePerson: "Technician Imran Bhuiyan",
    vendorName: "KONE Bangladesh Ltd",
    estimatedCost: 4500,
    slaMinutes: 720,
    status: "Active",
    checklist: [
      { id: "CHK-07", task: "Inspect brake mechanism & lining wear", result: "Pass" },
      { id: "CHK-08", task: "Door safety curtain sensor calibration", result: "Pass" },
      { id: "CHK-09", task: "Emergency alarm & intercom verification", result: "Pass" },
      { id: "CHK-10", task: "Guide shoe lubrication & cable tension", result: "Pending" },
    ],
  },
];

const INITIAL_METERS: UtilityMeter[] = [
  {
    id: "MTR-ELEC-01",
    meterCode: "MTR-ELEC-BLD4",
    utilityType: "Electricity",
    location: "Substation Room, Meghna Tower",
    buildingId: "BLD-004",
    buildingName: "Meghna Tower",
    commonAreaName: "Common Area & Lifts",
    serialNumber: "DESCO-SM-99120",
    installationDate: "2022-01-01",
    previousReading: 142500,
    currentReading: 148900,
    lastReadingDate: daysAgo(1).slice(0, 10),
    unit: "kWh",
    status: "Active",
    ratePerUnit: 11.5,
  },
  {
    id: "MTR-WAT-01",
    meterCode: "MTR-WAT-BLD4",
    utilityType: "Water",
    location: "Underground Reservoir, Meghna Tower",
    buildingId: "BLD-004",
    buildingName: "Meghna Tower",
    commonAreaName: "Building Water Inlet",
    serialNumber: "WASA-M-55102",
    installationDate: "2022-01-01",
    previousReading: 32400,
    currentReading: 35100,
    lastReadingDate: daysAgo(1).slice(0, 10),
    unit: "m³",
    status: "Active",
    ratePerUnit: 42.0,
  },
];

const INITIAL_READINGS: UtilityReading[] = [
  {
    id: "RDG-001",
    meterId: "MTR-ELEC-01",
    meterCode: "MTR-ELEC-BLD4",
    utilityType: "Electricity",
    buildingName: "Meghna Tower",
    previousReading: 142500,
    currentReading: 148900,
    consumption: 6400,
    unit: "kWh",
    readingDate: daysAgo(1).slice(0, 10),
    readerName: "Caretaker Jamal Uddin",
    readingSource: "Manual",
    costBDT: 73600,
    isAnomaly: false,
  },
  {
    id: "RDG-002",
    meterId: "MTR-WAT-01",
    meterCode: "MTR-WAT-BLD4",
    utilityType: "Water",
    buildingName: "Meghna Tower",
    previousReading: 32400,
    currentReading: 35100,
    consumption: 2700,
    unit: "m³",
    readingDate: daysAgo(1).slice(0, 10),
    readerName: "Caretaker Jamal Uddin",
    readingSource: "Manual",
    costBDT: 113400,
    isAnomaly: true, // Spike
  },
];

const INITIAL_HOUSEKEEPING: HousekeepingTask[] = [
  {
    id: "HK-TSK-01",
    taskCode: "HK-LBY-01",
    location: "Main Entrance Lobby & Reception",
    buildingName: "Meghna Tower",
    taskName: "Morning Deep Cleaning & Marble Polishing",
    frequency: "Daily",
    assignedStaff: "Salma Begum",
    startTime: "07:00",
    dueTime: "09:00",
    status: "Completed",
    checklist: [
      { id: "HKC-01", task: "Floor vacuumed & wet mopped with disinfectant", result: "Pass" },
      { id: "HKC-02", task: "Glass entrance doors polished", result: "Pass" },
      { id: "HKC-03", task: "Reception counter & seating sanitized", result: "Pass" },
      { id: "HKC-04", task: "Dustbins emptied & fresh liners installed", result: "Pass" },
    ],
    photosCount: 2,
    supervisorScore: "Excellent",
    supervisorNotes: "Lobby shining and spotless. Verified at 09:15.",
  },
  {
    id: "HK-TSK-02",
    taskCode: "HK-PRK-01",
    location: "Basement 1 & 2 Parking Area",
    buildingName: "Meghna Tower",
    taskName: "Parking Sweeping & Spill Cleanup",
    frequency: "Daily",
    assignedStaff: "Rafiqul Islam",
    startTime: "09:30",
    dueTime: "11:30",
    status: "In Progress",
    checklist: [
      { id: "HKC-05", task: "Oil spills degreased", result: "Pass" },
      { id: "HKC-06", task: "Driveways swept", result: "Pending" },
      { id: "HKC-07", task: "Drain grates cleared", result: "Pending" },
    ],
    photosCount: 1,
  },
];

const INITIAL_AMCS: AMCContract[] = [
  {
    id: "AMC-LFT-01",
    contractCode: "AMC-2025-KNE-01",
    vendorId: "VND-KNE-01",
    vendorName: "KONE Bangladesh Ltd",
    assetId: "AST-LFT-01",
    assetName: "Passenger Elevator #1",
    serviceType: "Comprehensive Lift Maintenance",
    startDate: "2025-01-01",
    endDate: daysAhead(45).slice(0, 10), // Expiring soon
    contractValueBDT: 180000,
    paymentTerms: "Quarterly advance BDT 45,000",
    slaResponseHours: 2,
    visitFrequency: "Monthly",
    includedServices: "24/7 breakdown support, monthly lubrication, brake adjustment, door sensor replacement.",
    excludedServices: "Major traction motor replacement due to flood damage.",
    renewalDate: daysAhead(30).slice(0, 10),
    status: "Expiring Soon",
    documentsCount: 3,
  },
  {
    id: "AMC-GEN-01",
    contractCode: "AMC-2025-EPAC-02",
    vendorId: "VND-ENG-01",
    vendorName: "Energypac Engineering",
    assetId: "AST-GEN-01",
    assetName: "Primary Diesel Generator 500kVA",
    serviceType: "Annual Generator PM & Oil Change",
    startDate: "2025-06-01",
    endDate: "2026-06-01",
    contractValueBDT: 120000,
    paymentTerms: "Bi-annual payment",
    slaResponseHours: 4,
    visitFrequency: "Quarterly",
    includedServices: "Filter change, oil testing, ATS calibration, load bank testing.",
    excludedServices: "Fuel supply.",
    renewalDate: "2026-05-01",
    status: "Active",
    documentsCount: 2,
  },
];

const INITIAL_COMPLIANCE: ComplianceRequirement[] = [
  {
    id: "CMP-FIR-01",
    requirementCode: "CMP-FIRE-2026",
    requirementName: "Fire Safety License & Hydrant Clearance",
    assetId: "AST-GEN-01",
    assetName: "Meghna Tower Fire Suppression System",
    authorityStandard: "Bangladesh Fire Service & Civil Defence",
    responsibleDepartment: "Fire & Life Safety",
    inspectionFrequencyDays: 365,
    lastInspectionDate: "2025-03-10",
    nextInspectionDate: daysAhead(20).slice(0, 10),
    certificateNumber: "FSCD-DH-99210-A",
    issueDate: "2025-03-15",
    expiryDate: daysAhead(25).slice(0, 10), // Expiring soon
    status: "Due Soon",
    documentsCount: 4,
  },
  {
    id: "CMP-LFT-01",
    requirementCode: "CMP-LIFT-2025",
    requirementName: "Annual Elevator Fitness Certification",
    assetId: "AST-LFT-01",
    assetName: "Passenger Elevator #1",
    authorityStandard: "Department of Inspection for Factories and Establishments (DIFE)",
    responsibleDepartment: "Mechanical Safety",
    inspectionFrequencyDays: 365,
    lastInspectionDate: "2025-01-10",
    nextInspectionDate: "2026-01-10",
    certificateNumber: "DIFE-LIFT-2025-88",
    issueDate: "2025-01-15",
    expiryDate: "2026-01-15",
    status: "Compliant",
    documentsCount: 2,
  },
];

const INITIAL_BIOMEDICAL: BiomedicalEquipment[] = [
  {
    id: "BIO-001",
    equipmentCode: "BIO-CLN-001",
    name: "Multi-Parameter Patient Monitor & ECG",
    manufacturer: "Mindray Medical",
    model: "uMEC12",
    serialNumber: "MDR-BIO-7712",
    clinicLocation: "Bashundhara Welfare Clinic - Room 102",
    purchaseDate: "2023-11-01",
    warrantyExpiry: "2026-11-15",
    calibrationFrequencyDays: 180,
    lastCalibrationDate: daysAgo(160).slice(0, 10),
    nextCalibrationDate: daysAhead(20).slice(0, 10),
    certificationStatus: "Certified",
    responsiblePerson: "Dr. Farhana Rahman",
    vendorName: "MediTech Bangladesh",
  },
];

const INITIAL_INVENTORY: FacilityInventoryItem[] = [
  {
    id: "INV-FAC-01",
    itemCode: "PRT-PMP-102",
    itemName: "Grundfos Mechanical Seal Kit",
    category: "Spare Parts",
    quantityInStock: 2,
    unit: "Pcs",
    reorderLevel: 3,
    unitCostBDT: 12000,
    supplierName: "Aqua Solutions BD",
    storageLocation: "Main Store A - Shelf 3",
    status: "Low Stock",
  },
  {
    id: "INV-FAC-02",
    itemCode: "CHM-CLN-500",
    itemName: "Industrial Disinfectant Floor Cleaner 20L",
    category: "Cleaning Chemicals",
    quantityInStock: 15,
    unit: "Cans",
    reorderLevel: 5,
    unitCostBDT: 2200,
    supplierName: "CleanChem BD",
    storageLocation: "Chemical Locker B1",
    status: "In Stock",
  },
  {
    id: "INV-FAC-03",
    itemCode: "ELC-LED-018",
    itemName: "18W LED Commercial Downlight (6000K)",
    category: "Electrical",
    quantityInStock: 45,
    unit: "Pcs",
    reorderLevel: 15,
    unitCostBDT: 450,
    supplierName: "Super Star Electrical",
    storageLocation: "Main Store B - Rack 2",
    status: "In Stock",
  },
];

const INITIAL_BUDGET: FacilityBudget[] = [
  { id: "BDG-01", category: "Maintenance", allocatedBDT: 2400000, actualSpentBDT: 1850000, committedBDT: 250000, remainingBDT: 300000, fiscalYear: "2025-2026" },
  { id: "BDG-02", category: "Utilities", allocatedBDT: 8500000, actualSpentBDT: 6200000, committedBDT: 800000, remainingBDT: 1500000, fiscalYear: "2025-2026" },
  { id: "BDG-03", category: "Housekeeping", allocatedBDT: 1800000, actualSpentBDT: 1350000, committedBDT: 150000, remainingBDT: 300000, fiscalYear: "2025-2026" },
  { id: "BDG-04", category: "AMC", allocatedBDT: 1500000, actualSpentBDT: 1100000, committedBDT: 200000, remainingBDT: 200000, fiscalYear: "2025-2026" },
];

/* ------------------------------------------------------------- State Store */

interface FacilityStoreState {
  assets: FacilityAsset[];
  workOrders: FacilityWorkOrder[];
  preventiveSchedules: PreventiveSchedule[];
  meters: UtilityMeter[];
  readings: UtilityReading[];
  utilityAlerts: UtilityAlert[];
  housekeepingTasks: HousekeepingTask[];
  wasteCollections: WasteCollection[];
  amcContracts: AMCContract[];
  amcVisits: AMCVisit[];
  complianceRequirements: ComplianceRequirement[];
  inspections: FacilityInspection[];
  biomedicalEquipment: BiomedicalEquipment[];
  calibrationRecords: CalibrationRecord[];
  inventoryItems: FacilityInventoryItem[];
  budgets: FacilityBudget[];
  costRecords: FacilityCostRecord[];
  lifecycleEvents: AssetLifecycleEvent[];
  assetMetrics: Record<string, AssetMetric>;
}

const state: FacilityStoreState = {
  assets: INITIAL_ASSETS,
  workOrders: INITIAL_WORK_ORDERS,
  preventiveSchedules: INITIAL_PREVENTIVE,
  meters: INITIAL_METERS,
  readings: INITIAL_READINGS,
  utilityAlerts: [
    {
      id: "ALT-UTL-01",
      meterId: "MTR-WAT-01",
      utilityType: "Water",
      buildingName: "Meghna Tower",
      alertType: "Sudden Spike",
      severity: "high",
      description: "Water consumption spiked by 45% compared to 7-day average.",
      timestamp: daysAgo(1),
      resolved: false,
    },
  ],
  housekeepingTasks: INITIAL_HOUSEKEEPING,
  wasteCollections: [
    {
      id: "WST-01",
      zone: "Block A & B Common Area",
      buildingName: "Meghna Tower",
      collectionSchedule: "Daily 06:00 & 18:00",
      collectionStaff: "Bashundhara Sanitation Crew A",
      wasteType: "General Organic",
      pickupStatus: "Collected",
      pickupTime: "06:30",
    },
  ],
  amcContracts: INITIAL_AMCS,
  amcVisits: [
    {
      id: "VST-01",
      amcId: "AMC-LFT-01",
      contractCode: "AMC-2025-KNE-01",
      vendorName: "KONE Bangladesh Ltd",
      assetName: "Passenger Elevator #1",
      scheduledDate: daysAhead(2).slice(0, 10),
      technicianName: "Subir Das",
      technicianPhone: "+8801711998822",
      gateArrivalStatus: "Expected",
      serviceReportNotes: "Routine 30-day inspection scheduled.",
    },
  ],
  complianceRequirements: INITIAL_COMPLIANCE,
  inspections: [
    {
      id: "INS-01",
      inspectionCode: "INS-FIR-01",
      type: "Fire",
      targetName: "Meghna Tower Fire Hydrants & Alarm System",
      assignedInspector: "Inspector Rakib Sarker",
      scheduledDate: daysAgo(3).slice(0, 10),
      status: "Passed",
      findings: "All 12 hydrant points pressurized at 6.5 bar. Alarm panel normal.",
      completedDate: daysAgo(3).slice(0, 10),
    },
  ],
  biomedicalEquipment: INITIAL_BIOMEDICAL,
  calibrationRecords: [
    {
      id: "CAL-01",
      equipmentId: "BIO-CLN-001",
      equipmentName: "Multi-Parameter Patient Monitor & ECG",
      calibrationDate: daysAgo(160).slice(0, 10),
      calibratedBy: "National Metrology Institute BD",
      certificateNumber: "NMI-ECG-2025-441",
      result: "Pass",
      costBDT: 15000,
      nextDue: daysAhead(20).slice(0, 10),
    },
  ],
  inventoryItems: INITIAL_INVENTORY,
  budgets: INITIAL_BUDGET,
  costRecords: [
    {
      id: "CST-01",
      date: daysAgo(5).slice(0, 10),
      category: "Maintenance Parts",
      description: "SKF Bearings & Grundfos Seal for Pump PMP-A-002",
      amountBDT: 15000,
      buildingName: "Meghna Tower",
      assetName: "Main Water Hydro-Pneumatic Pump System",
      workOrderRef: "WO-FAC-1001",
      accountLedgerRef: "5210 · Repairs & Maintenance",
      status: "Posted",
    },
  ],
  lifecycleEvents: [
    {
      id: "LFC-01",
      assetId: "AST-GEN-01",
      date: "2023-01-15",
      eventType: "PROCUREMENT",
      title: "Asset Purchased",
      description: "Purchased 500kVA Cummins Generator from Energypac Engineering.",
      performedBy: "Procurement Dept",
      cost: 4500000,
    },
    {
      id: "LFC-02",
      assetId: "AST-GEN-01",
      date: "2023-02-01",
      eventType: "INSTALLED",
      title: "Installed & Commissioned",
      description: "Installed in Substation Room B101 with Automatic Transfer Switch.",
      performedBy: "Energypac Tech Team",
    },
    {
      id: "LFC-03",
      assetId: "AST-GEN-01",
      date: daysAgo(12).slice(0, 10),
      eventType: "MAINTENANCE",
      title: "30-Day Preventive Maintenance",
      description: "Oil filter change, load test, battery voltage check completed.",
      performedBy: "Engineer Jamal Hossain",
      cost: 8500,
    },
  ],
  assetMetrics: {
    "AST-GEN-01": {
      assetId: "AST-GEN-01",
      runtimeHours: 428.5,
      temperatureC: 78.2,
      vibrationMmS: 2.1,
      pressureBar: 4.8,
      voltageV: 415.0,
      currentA: 210.4,
      waterFlowLpm: 0,
      lastUpdated: iso(now()),
      healthScore: 96,
      isAnomaly: false,
    },
    "AST-LFT-01": {
      assetId: "AST-LFT-01",
      runtimeHours: 1840.0,
      temperatureC: 42.0,
      vibrationMmS: 1.4,
      pressureBar: 0,
      voltageV: 400.0,
      currentA: 28.5,
      waterFlowLpm: 0,
      lastUpdated: iso(now()),
      healthScore: 92,
      isAnomaly: false,
    },
    "AST-PMP-01": {
      assetId: "AST-PMP-01",
      runtimeHours: 940.2,
      temperatureC: 68.5,
      vibrationMmS: 5.8, // High vibration anomaly
      pressureBar: 3.2,
      voltageV: 395.0,
      currentA: 34.2,
      waterFlowLpm: 120,
      lastUpdated: iso(now()),
      healthScore: 64,
      isAnomaly: true,
    },
  },
};

/* -------------------------------------------------- Reactive Store Binding */

const listeners = new Set<() => void>();
let snapshot = { ...state };

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFacilitySnapshot() {
  return snapshot;
}

function commit() {
  snapshot = { ...state };
  listeners.forEach((l) => l());
}

/* ------------------------------------------------------------- Mutations API */

export const facilityStore = {
  getSummary(): FacilityDashboardSummary {
    const totalAssets = state.assets.length;
    const activeAssets = state.assets.filter((a) => a.status === "Active" || a.status === "Operational").length;
    const underMaintenanceAssets = state.assets.filter((a) => a.status === "Under Maintenance").length;
    
    const overdueMaintenanceCount = state.preventiveSchedules.filter((s) => new Date(s.nextDueDate) < now()).length;
    const openWorkOrders = state.workOrders.filter((w) => w.status !== "Completed" && w.status !== "Verified" && w.status !== "Cancelled").length;
    const criticalIssuesCount = state.workOrders.filter((w) => w.priority === "critical" && w.status !== "Completed").length;
    
    const activeAMCContracts = state.amcContracts.filter((a) => a.status === "Active").length;
    const amcExpiringSoonCount = state.amcContracts.filter((a) => a.status === "Expiring Soon" || (new Date(a.endDate).getTime() - Date.now() < 60 * 86400_000)).length;
    
    const monthlyUtilityCostBDT = state.readings.reduce((sum, r) => sum + r.costBDT, 0);
    const housekeepingPendingCount = state.housekeepingTasks.filter((h) => h.status !== "Completed" && h.status !== "Inspected").length;
    
    const complianceAlertsCount = state.complianceRequirements.filter((c) => c.status !== "Compliant").length;
    const expiredCertificatesCount = state.complianceRequirements.filter((c) => c.status === "Expired" || c.status === "Overdue").length;
    
    const monthlyExpenseBDT = state.costRecords.reduce((sum, c) => sum + c.amountBDT, 0);
    const pendingVendorPaymentsBDT = state.workOrders.reduce((sum, w) => sum + (w.status === "Completed" ? w.vendorCost : 0), 0);
    
    const stockValueBDT = state.inventoryItems.reduce((sum, i) => sum + (i.quantityInStock * i.unitCostBDT), 0);

    return {
      totalAssets,
      activeAssets,
      underMaintenanceAssets,
      overdueMaintenanceCount,
      openWorkOrders,
      criticalIssuesCount,
      activeAMCContracts,
      amcExpiringSoonCount,
      monthlyUtilityCostBDT,
      housekeepingPendingCount,
      complianceAlertsCount,
      expiredCertificatesCount,
      monthlyExpenseBDT,
      pendingVendorPaymentsBDT,
      stockValueBDT,
    };
  },

  // 1. Asset Management
  addAsset(input: Omit<FacilityAsset, "id" | "assetCode" | "qrCodeUrl" | "documentsCount" | "photosCount">) {
    const id = nextId("AST");
    const code = `${input.category.substring(0, 3).toUpperCase()}-${input.block.substring(6, 7)}-${Math.floor(100 + Math.random() * 900)}`;
    const newAsset: FacilityAsset = {
      ...input,
      id,
      assetCode: code,
      qrCodeUrl: `/qr-placeholder/${code}`,
      documentsCount: 0,
      photosCount: 1,
    };
    state.assets = [newAsset, ...state.assets];
    
    // Log lifecycle event
    state.lifecycleEvents = [
      {
        id: nextId("LFC"),
        assetId: id,
        date: iso(now()).slice(0, 10),
        eventType: "PROCUREMENT",
        title: "Asset Registered",
        description: `Registered new ${input.name} in ${input.buildingName}`,
        performedBy: "Facility Manager",
        cost: input.purchaseCost,
      },
      ...state.lifecycleEvents,
    ];
    
    commit();
    return newAsset;
  },

  updateAssetStatus(assetId: string, status: FacilityAsset["status"], notes?: string) {
    state.assets = state.assets.map((a) => (a.id === assetId ? { ...a, status, notes: notes ?? a.notes } : a));
    
    state.lifecycleEvents = [
      {
        id: nextId("LFC"),
        assetId,
        date: iso(now()).slice(0, 10),
        eventType: status === "Under Maintenance" ? "MAINTENANCE" : status === "Retired" ? "RETIRED" : "OPERATIONAL",
        title: `Status set to ${status}`,
        description: notes ?? `Asset status changed to ${status}`,
        performedBy: "Facility Operations",
      },
      ...state.lifecycleEvents,
    ];
    commit();
  },

  // 2. Work Orders (Integrated with Universal Request & Accounts)
  createWorkOrder(input: {
    assetId: string;
    issue: string;
    description: string;
    priority: WorkOrderPriority;
    maintenanceType: MaintenanceType;
    assignedTechnician: string;
    vendorName?: string;
    estimatedCost?: number;
    partsUsed?: { partName: string; partCode: string; quantity: number; unitCost: number }[];
  }) {
    const asset = state.assets.find((a) => a.id === input.assetId);
    const id = nextId("WO");
    const code = `WO-FAC-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const parts = (input.partsUsed ?? []).map((p) => ({
      id: nextId("PRT"),
      ...p,
      totalCost: p.quantity * p.unitCost,
    }));
    
    const partsCost = parts.reduce((s, p) => s + p.totalCost, 0);

    const workOrder: FacilityWorkOrder = {
      id,
      workOrderCode: code,
      assetId: input.assetId,
      assetName: asset?.name ?? "Facility Asset",
      assetCode: asset?.assetCode ?? "AST-000",
      location: asset ? `${asset.room}, ${asset.buildingName}` : "Bashundhara R/A",
      buildingId: asset?.buildingId ?? "BLD-004",
      issue: input.issue,
      description: input.description,
      priority: input.priority,
      maintenanceType: input.maintenanceType,
      requestedBy: "Facility Control Center",
      assignedDepartment: asset?.responsibleDepartment ?? "Facility Maintenance",
      assignedTechnician: input.assignedTechnician,
      vendorName: input.vendorName,
      scheduledDate: iso(now()).slice(0, 10),
      dueDate: daysAhead(1).slice(0, 10),
      slaMinutes: input.priority === "critical" ? 30 : input.priority === "high" ? 120 : 1440,
      status: "Assigned",
      estimatedCost: input.estimatedCost ?? (partsCost + 3000),
      actualCost: 0,
      laborCost: 3000,
      partsCost,
      vendorCost: input.vendorName ? 5000 : 0,
      partsUsed: parts,
      photosCount: 1,
      notes: "Auto-generated work order.",
    };

    state.workOrders = [workOrder, ...state.workOrders];

    // Mark asset as Under Maintenance if High or Critical
    if (asset && (input.priority === "high" || input.priority === "critical")) {
      state.assets = state.assets.map((a) => (a.id === asset.id ? { ...a, status: "Under Maintenance" } : a));
    }

    // Integrate with Universal Request Engine in opsStore!
    opsStore.createRequest({
      type: "maintenance",
      category: input.maintenanceType,
      title: `[Facility Work Order] ${input.issue}`,
      description: `Asset ${workOrder.assetCode} — ${input.description}`,
      priority: input.priority,
      requesterName: "Facility Control Room",
      flatId: asset?.room ?? "Common Area",
      buildingId: asset?.buildingId ?? "BLD-004",
      block: asset?.block ?? "Block A",
      providerName: input.vendorName ?? null,
      amount: workOrder.estimatedCost,
    });

    commit();
    return workOrder;
  },

  updateWorkOrderStatus(workOrderId: string, status: WorkOrderStatus, notes?: string) {
    const wo = state.workOrders.find((w) => w.id === workOrderId);
    if (!wo) return;

    const completed = status === "Completed" || status === "Verified";
    const actualCost = completed ? (wo.laborCost + wo.partsCost + wo.vendorCost) : wo.actualCost;

    state.workOrders = state.workOrders.map((w) =>
      w.id === workOrderId
        ? {
            ...w,
            status,
            actualCost,
            completedAt: completed ? iso(now()) : w.completedAt,
            notes: notes ? `${w.notes} | ${notes}` : w.notes,
          }
        : w,
    );

    // If completed, update asset status & post financial cost record
    if (completed) {
      state.assets = state.assets.map((a) =>
        a.id === wo.assetId ? { ...a, status: "Operational", lastMaintenanceDate: iso(now()).slice(0, 10) } : a,
      );

      // Add to Facility Cost Records
      if (actualCost > 0) {
        state.costRecords = [
          {
            id: nextId("CST"),
            date: iso(now()).slice(0, 10),
            category: "Work Order Maintenance",
            description: `${wo.workOrderCode} — ${wo.issue}`,
            amountBDT: actualCost,
            buildingName: wo.location,
            assetName: wo.assetName,
            workOrderRef: wo.workOrderCode,
            accountLedgerRef: "5210 · Repairs & Maintenance",
            status: "Posted",
          },
          ...state.costRecords,
        ];
      }
    }

    commit();
  },

  // 3. Utility Meter Reading & Spike Alerting
  recordUtilityReading(input: {
    meterId: string;
    currentReading: number;
    readerName: string;
    readingSource?: UtilityReading["readingSource"];
  }) {
    const meter = state.meters.find((m) => m.id === input.meterId);
    if (!meter) return;

    const previous = meter.currentReading;
    const consumption = Math.max(0, input.currentReading - previous);
    const costBDT = Math.round(consumption * meter.ratePerUnit);

    // Check anomaly (spike if consumption > 2x average)
    const isAnomaly = consumption > 5000;

    const newReading: UtilityReading = {
      id: nextId("RDG"),
      meterId: input.meterId,
      meterCode: meter.meterCode,
      utilityType: meter.utilityType,
      buildingName: meter.buildingName,
      previousReading: previous,
      currentReading: input.currentReading,
      consumption,
      unit: meter.unit,
      readingDate: iso(now()).slice(0, 10),
      readerName: input.readerName,
      readingSource: input.readingSource ?? "Manual",
      costBDT,
      isAnomaly,
    };

    // Update meter state
    state.meters = state.meters.map((m) =>
      m.id === input.meterId ? { ...m, previousReading: previous, currentReading: input.currentReading, lastReadingDate: iso(now()).slice(0, 10) } : m,
    );

    state.readings = [newReading, ...state.readings];

    if (isAnomaly) {
      state.utilityAlerts = [
        {
          id: nextId("ALT"),
          meterId: input.meterId,
          utilityType: meter.utilityType,
          buildingName: meter.buildingName,
          alertType: "Sudden Spike",
          severity: "high",
          description: `High consumption detected on ${meter.meterCode}: ${consumption} ${meter.unit} (BDT ${costBDT.toLocaleString()})`,
          timestamp: iso(now()),
          resolved: false,
        },
        ...state.utilityAlerts,
      ];
    }

    commit();
    return newReading;
  },

  // 4. Housekeeping Task Completion & Quality Inspection
  updateHousekeepingTask(taskId: string, status: HousekeepingTask["status"], photoAttached = false) {
    state.housekeepingTasks = state.housekeepingTasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status,
            photosCount: photoAttached ? t.photosCount + 1 : t.photosCount,
          }
        : t,
    );
    commit();
  },

  inspectHousekeepingTask(taskId: string, score: HousekeepingTask["supervisorScore"], notes: string) {
    const task = state.housekeepingTasks.find((t) => t.id === taskId);
    if (!task) return;

    const failed = score === "Needs Improvement" || score === "Failed";

    state.housekeepingTasks = state.housekeepingTasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status: failed ? "Failed" : "Inspected",
            supervisorScore: score,
            supervisorNotes: notes,
            reinspectionRequired: failed,
          }
        : t,
    );

    // If failed, auto-generate corrective housekeeping task
    if (failed) {
      const correctiveTask: HousekeepingTask = {
        id: nextId("HK-TSK"),
        taskCode: `${task.taskCode}-CORRECTIVE`,
        location: task.location,
        buildingName: task.buildingName,
        taskName: `[Corrective] ${task.taskName}`,
        frequency: "Event-based",
        assignedStaff: task.assignedStaff,
        startTime: iso(now()).slice(11, 16),
        dueTime: daysAhead(0.2).slice(11, 16),
        status: "Pending",
        checklist: task.checklist.map((c) => ({ ...c, result: "Pending" })),
        photosCount: 0,
      };
      state.housekeepingTasks = [correctiveTask, ...state.housekeepingTasks];
    }

    commit();
  },

  // 5. AMC Contract Creation & Renewal
  renewAMCContract(amcId: string, extensionMonths = 12, newCostBDT?: number) {
    const amc = state.amcContracts.find((a) => a.id === amcId);
    if (!amc) return;

    const currentEnd = new Date(amc.endDate);
    const newEnd = new Date(currentEnd.setMonth(currentEnd.getMonth() + extensionMonths));
    const renewalDate = new Date(newEnd.getTime() - 30 * 86400_000);

    state.amcContracts = state.amcContracts.map((a) =>
      a.id === amcId
        ? {
            ...a,
            endDate: iso(newEnd).slice(0, 10),
            renewalDate: iso(renewalDate).slice(0, 10),
            contractValueBDT: newCostBDT ?? a.contractValueBDT,
            status: "Active",
          }
        : a,
    );

    // Log lifecycle event on linked asset
    if (amc.assetId) {
      state.lifecycleEvents = [
        {
          id: nextId("LFC"),
          assetId: amc.assetId,
          date: iso(now()).slice(0, 10),
          eventType: "AMC_RENEWED",
          title: "AMC Contract Renewed",
          description: `Contract ${amc.contractCode} renewed with ${amc.vendorName} until ${iso(newEnd).slice(0, 10)}`,
          performedBy: "Procurement / Facility Manager",
          cost: newCostBDT ?? amc.contractValueBDT,
        },
        ...state.lifecycleEvents,
      ];
    }

    commit();
  },

  // 6. Vendor Visit Arrival & Security Access Integration
  recordVendorVisitArrival(visitId: string, securityPassId: string) {
    state.amcVisits = state.amcVisits.map((v) =>
      v.id === visitId
        ? {
            ...v,
            securityPassId,
            gateArrivalStatus: "At Gate",
          }
        : v,
    );
    commit();
  },

  // 7. Biomedical Calibration
  recordCalibration(input: Omit<CalibrationRecord, "id">) {
    const id = nextId("CAL");
    const rec: CalibrationRecord = { id, ...input };
    state.calibrationRecords = [rec, ...state.calibrationRecords];

    state.biomedicalEquipment = state.biomedicalEquipment.map((b) =>
      b.id === input.equipmentId
        ? {
            ...b,
            lastCalibrationDate: input.calibrationDate,
            nextCalibrationDate: input.nextDue,
            certificationStatus: input.result === "Pass" ? "Certified" : "Out of Calibration",
          }
        : b,
    );

    commit();
    return rec;
  },

  // 8. Inventory Stock Movement
  adjustInventoryStock(itemId: string, qtyChange: number, reason: string) {
    state.inventoryItems = state.inventoryItems.map((item) => {
      if (item.id !== itemId) return item;
      const newQty = Math.max(0, item.quantityInStock + qtyChange);
      const status = newQty === 0 ? "Out of Stock" : newQty <= item.reorderLevel ? "Low Stock" : "In Stock";
      return { ...item, quantityInStock: newQty, status };
    });
    commit();
  },
};
