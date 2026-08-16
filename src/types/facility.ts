/**
 * Facility Core Service — Domain Types & Data Model
 * 
 * Enterprise-grade Facility Management System for Bashundhara R/A Smart Community.
 * Includes Asset Management, Preventive Maintenance, Work Orders, Utilities,
 * Housekeeping, Vendors, AMC, Compliance, Biomedical, Inventory, Costing & Analytics.
 */

export type AssetCategory =
  | "Generator"
  | "Lift"
  | "Water Pump"
  | "Electrical Panel"
  | "Transformer"
  | "HVAC"
  | "AC"
  | "Water Treatment Equipment"
  | "Fire Safety Equipment"
  | "CCTV"
  | "Access Control Equipment"
  | "Solar Equipment"
  | "Plumbing Equipment"
  | "Cleaning Equipment"
  | "Medical Equipment"
  | "Furniture"
  | "IT Equipment"
  | "Other";

export type AssetStatus =
  | "Active"
  | "Operational"
  | "Under Maintenance"
  | "Damaged"
  | "Inactive"
  | "Disposed"
  | "Retired";

export type AssetCondition = "Excellent" | "Good" | "Fair" | "Poor" | "Critical";

export interface AssetLifecycleEvent {
  id: string;
  assetId: string;
  date: string;
  eventType: "PROCUREMENT" | "RECEIVED" | "INSTALLED" | "OPERATIONAL" | "MAINTENANCE" | "REPAIR" | "REPLACEMENT" | "RETIRED" | "DISPOSED" | "AMC_RENEWED";
  title: string;
  description: string;
  performedBy: string;
  cost?: number;
  workOrderId?: string;
  documentRef?: string;
}

export interface AssetMetric {
  assetId: string;
  runtimeHours: number;
  temperatureC: number;
  vibrationMmS: number;
  pressureBar: number;
  voltageV: number;
  currentA: number;
  waterFlowLpm: number;
  lastUpdated: string;
  healthScore: number; // 0 - 100
  isAnomaly: boolean;
}

export interface FacilityAsset {
  id: string;
  assetCode: string; // e.g. GEN-A-001
  name: string;
  category: AssetCategory;
  subcategory: string;
  manufacturer: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  installationDate: string;
  purchaseCost: number;
  currentValue: number;
  warrantyExpiry: string;
  
  // Location Hierarchy
  community: string;
  block: string;
  road: string;
  buildingId: string;
  buildingName: string;
  floor: string;
  room: string;
  facilityArea: string; // e.g. "Generator Room", "Pump Room", "Lift Shaft"
  
  responsibleDepartment: string;
  responsiblePerson: string;
  vendorId?: string;
  vendorName?: string;
  amcId?: string;
  amcName?: string;
  
  status: AssetStatus;
  condition: AssetCondition;
  expectedLifeYears: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  
  qrCodeUrl: string; // Frontend QR placeholder
  documentsCount: number;
  photosCount: number;
  notes: string;
}

/* ---------------------------------------------------- Maintenance & Work Orders */

export type MaintenanceType =
  | "Preventive"
  | "Corrective"
  | "Emergency"
  | "Breakdown"
  | "Inspection"
  | "Predictive";

export type WorkOrderStatus =
  | "New"
  | "Assigned"
  | "Scheduled"
  | "In Progress"
  | "Waiting Parts"
  | "Waiting Vendor"
  | "Completed"
  | "Verified"
  | "Cancelled";

export type WorkOrderPriority = "low" | "normal" | "high" | "critical";

export interface WorkOrderPart {
  id: string;
  partName: string;
  partCode: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface FacilityWorkOrder {
  id: string;
  workOrderCode: string; // e.g. WO-FAC-1001
  assetId: string;
  assetName: string;
  assetCode: string;
  location: string;
  buildingId: string;
  issue: string;
  description: string;
  priority: WorkOrderPriority;
  maintenanceType: MaintenanceType;
  requestedBy: string;
  assignedDepartment: string;
  assignedTechnician: string;
  vendorId?: string;
  vendorName?: string;
  scheduledDate: string;
  dueDate: string;
  slaMinutes: number;
  status: WorkOrderStatus;
  
  estimatedCost: number;
  actualCost: number;
  laborCost: number;
  partsCost: number;
  vendorCost: number;
  
  partsUsed: WorkOrderPart[];
  photosCount: number;
  notes: string;
  completionEvidence?: string;
  completedAt?: string;
  verifiedBy?: string;
  
  // Integration refs
  requestId?: string;
  accountsPayableRef?: string;
}

/* --------------------------------------------------- Preventive Maintenance & Checklist */

export interface ChecklistItem {
  id: string;
  task: string;
  result: "Pass" | "Fail" | "N/A" | "Pending";
  notes?: string;
}

export interface PreventiveSchedule {
  id: string;
  scheduleCode: string;
  assetId: string;
  assetName: string;
  assetCode: string;
  maintenanceType: MaintenanceType;
  frequencyDays: number; // e.g. 30, 90, 365
  frequencyLabel: string; // e.g. "Monthly", "Quarterly", "Annual"
  lastCompletedDate: string;
  nextDueDate: string;
  responsiblePerson: string;
  vendorName?: string;
  estimatedCost: number;
  slaMinutes: number;
  status: "Active" | "Paused" | "Overdue" | "Completed";
  checklist: ChecklistItem[];
}

/* ------------------------------------------------------------- Utilities */

export type UtilityType = "Electricity" | "Water" | "Gas" | "Generator Fuel" | "Solar Energy" | "Other";

export interface UtilityMeter {
  id: string;
  meterCode: string; // e.g. MTR-ELEC-01
  utilityType: UtilityType;
  location: string;
  buildingId: string;
  buildingName: string;
  flatId?: string;
  commonAreaName?: string;
  serialNumber: string;
  installationDate: string;
  previousReading: number;
  currentReading: number;
  lastReadingDate: string;
  unit: "kWh" | "m³" | "Liters" | "Other";
  status: "Active" | "Faulty" | "Disconnected";
  ratePerUnit: number; // in BDT
}

export interface UtilityReading {
  id: string;
  meterId: string;
  meterCode: string;
  utilityType: UtilityType;
  buildingName: string;
  previousReading: number;
  currentReading: number;
  consumption: number;
  unit: string;
  readingDate: string;
  readerName: string;
  readingSource: "Manual" | "Scheduled" | "Imported" | "IoT Sensor";
  costBDT: number;
  isAnomaly: boolean;
}

export interface UtilityAlert {
  id: string;
  meterId: string;
  utilityType: UtilityType;
  buildingName: string;
  alertType: "Unusual Consumption" | "Sudden Spike" | "Meter Failure" | "Low Fuel Alert" | "Overdue Reading";
  severity: "high" | "critical" | "medium";
  description: string;
  timestamp: string;
  resolved: boolean;
}

/* ------------------------------------------------------------- Housekeeping */

export interface HousekeepingTask {
  id: string;
  taskCode: string;
  location: string;
  buildingName: string;
  taskName: string;
  frequency: "Daily" | "Shift" | "Weekly" | "Event-based";
  assignedStaff: string;
  startTime: string;
  dueTime: string;
  status: "Pending" | "In Progress" | "Completed" | "Inspected" | "Failed";
  checklist: ChecklistItem[];
  photosCount: number;
  supervisorScore?: "Excellent" | "Good" | "Needs Improvement" | "Failed";
  supervisorNotes?: string;
  reinspectionRequired?: boolean;
}

export interface WasteCollection {
  id: string;
  zone: string;
  buildingName: string;
  collectionSchedule: string;
  collectionStaff: string;
  wasteType: "General Organic" | "Recyclable" | "Hazardous/Medical" | "Bulk Waste";
  pickupStatus: "Scheduled" | "Collected" | "Missed" | "In Progress";
  pickupTime?: string;
  notes?: string;
}

/* ------------------------------------------------------------- Vendors & AMC */

export interface FacilityVendor {
  id: string;
  vendorCode: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  category: string; // e.g. Electrical, Lift, HVAC, Cleaning
  servicesOffered: string[];
  verificationStatus: "Verified" | "Pending" | "Unverified";
  rating: number; // 1 to 5
  status: "Active" | "Suspended" | "Blacklisted";
  activeAMCsCount: number;
  slaComplianceRate: number; // percentage
}

export interface AMCContract {
  id: string;
  contractCode: string; // e.g. AMC-2026-LIFT
  vendorId: string;
  vendorName: string;
  assetId: string;
  assetName: string;
  serviceType: string;
  startDate: string;
  endDate: string;
  contractValueBDT: number;
  paymentTerms: string;
  slaResponseHours: number;
  visitFrequency: "Monthly" | "Bi-Monthly" | "Quarterly" | "Annual";
  includedServices: string;
  excludedServices: string;
  renewalDate: string;
  status: "Draft" | "Active" | "Expiring Soon" | "Expired" | "Cancelled" | "Renewed";
  documentsCount: number;
}

export interface AMCVisit {
  id: string;
  amcId: string;
  contractCode: string;
  vendorName: string;
  assetName: string;
  scheduledDate: string;
  technicianName: string;
  technicianPhone: string;
  securityPassId?: string;
  gateArrivalStatus: "Expected" | "At Gate" | "In Building" | "Completed" | "Cancelled";
  workOrderId?: string;
  serviceReportNotes: string;
  completedAt?: string;
}

/* ------------------------------------------------------------- Compliance & Inspections */

export interface ComplianceRequirement {
  id: string;
  requirementCode: string;
  requirementName: string;
  assetId?: string;
  assetName?: string;
  authorityStandard: string; // e.g. "RAJUK / Fire Service Bangladesh", "BSTI"
  responsibleDepartment: string;
  inspectionFrequencyDays: number;
  lastInspectionDate: string;
  nextInspectionDate: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  status: "Compliant" | "Due Soon" | "Overdue" | "Expired" | "Non-Compliant";
  documentsCount: number;
}

export interface FacilityInspection {
  id: string;
  inspectionCode: string;
  type: "Safety" | "Electrical" | "Fire" | "Lift" | "Generator" | "Water Quality" | "Housekeeping" | "Building Envelope";
  targetName: string;
  assignedInspector: string;
  scheduledDate: string;
  status: "Scheduled" | "In Progress" | "Passed" | "Action Required" | "Failed";
  findings: string;
  correctiveWorkOrderId?: string;
  completedDate?: string;
}

/* ------------------------------------------------------------- Biomedical Equipment */

export interface BiomedicalEquipment {
  id: string;
  equipmentCode: string;
  name: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  clinicLocation: string; // e.g. "Bashundhara Community Clinic - Room 102"
  purchaseDate: string;
  warrantyExpiry: string;
  calibrationFrequencyDays: number;
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  certificationStatus: "Certified" | "Calibration Due" | "Out of Calibration" | "Faulty";
  responsiblePerson: string;
  vendorName: string;
}

export interface CalibrationRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  calibrationDate: string;
  calibratedBy: string; // Agency / Vendor
  certificateNumber: string;
  result: "Pass" | "Fail" | "Adjusted";
  costBDT: number;
  nextDue: string;
}

/* ------------------------------------------------------------- Facility Inventory */

export interface FacilityInventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: "Spare Parts" | "Electrical" | "Plumbing" | "Cleaning Chemicals" | "Maintenance Tools" | "Safety Equipment" | "HVAC Parts" | "Generator Parts" | "Consumables";
  quantityInStock: number;
  unit: string;
  reorderLevel: number;
  unitCostBDT: number;
  supplierName: string;
  storageLocation: string; // e.g. "Main Store A - Shelf 3"
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

/* ------------------------------------------------------------- Costing & Budget */

export interface FacilityBudget {
  id: string;
  category: "Maintenance" | "Utilities" | "Housekeeping" | "Security Equipment" | "Asset Replacement" | "AMC" | "Compliance" | "Emergency" | "Capital Expenditure" | "Operational Expenditure";
  allocatedBDT: number;
  actualSpentBDT: number;
  committedBDT: number;
  remainingBDT: number;
  fiscalYear: string;
}

export interface FacilityCostRecord {
  id: string;
  date: string;
  category: string;
  description: string;
  amountBDT: number;
  buildingName: string;
  assetName?: string;
  workOrderRef?: string;
  accountLedgerRef: string;
  status: "Posted" | "Pending Approval";
}

/* ------------------------------------------------------------- Dashboard KPI Summary */

export interface FacilityDashboardSummary {
  totalAssets: number;
  activeAssets: number;
  underMaintenanceAssets: number;
  overdueMaintenanceCount: number;
  openWorkOrders: number;
  criticalIssuesCount: number;
  activeAMCContracts: number;
  amcExpiringSoonCount: number;
  monthlyUtilityCostBDT: number;
  housekeepingPendingCount: number;
  complianceAlertsCount: number;
  expiredCertificatesCount: number;
  monthlyExpenseBDT: number;
  pendingVendorPaymentsBDT: number;
  stockValueBDT: number;
}
