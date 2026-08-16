/**
 * Digital Community OS — extended domain model.
 * Community layer, building ERP layer and resident/service marketplace layer.
 */

export type VerificationStatus =
  | "pending" | "under_review" | "verified" | "suspended" | "blacklisted";

export interface Building {
  id: string;
  name: string;
  houseNo: string;
  road: string;
  block: string;
  address: string;
  ownerId: string;
  ownerName: string;
  managerName: string;
  caretakerName: string;
  floors: number;
  flats: number;
  occupiedFlats: number;
  type: "residential" | "commercial" | "mixed";
  yearBuilt: number;
  lift: number;
  generator: boolean;
  parkingSlots: number;
  monthlyIncome: number;
  monthlyExpense: number;
  status: "active" | "under_construction" | "renovation";
}

export interface Floor {
  id: string;
  buildingId: string;
  buildingName: string;
  level: number;
  flats: number;
  occupied: number;
  commonArea: string;
  status: "active" | "maintenance";
}

export interface Owner {
  id: string;
  name: string;
  nameBn: string;
  phone: string;
  email: string;
  nid: string;
  permanentAddress: string;
  emergencyContact: string;
  flatId: string;
  buildingId: string;
  block: string;
  ownershipPct: number;
  ownershipStart: string;
  ownershipEnd: string | null;
  occupancy: "living_in" | "renting_out" | "partial" | "vacant";
  otherProperties: number;
  documents: number;
  contactPreference: "sms" | "email" | "app" | "phone";
  status: "active" | "transferred" | "inactive";
}

export interface Tenant {
  id: string;
  name: string;
  nameBn: string;
  phone: string;
  email: string;
  nid: string;
  emergencyContact: string;
  occupation: string;
  organization: string;
  flatId: string;
  buildingId: string;
  block: string;
  ownerId: string;
  ownerName: string;
  leaseId: string;
  leaseStart: string;
  leaseEnd: string;
  monthlyRent: number;
  securityDeposit: number;
  advance: number;
  rentDueDay: number;
  paymentStatus: "paid" | "due" | "overdue" | "partial";
  documents: number;
  status: "active" | "notice_period" | "moved_out";
}

export interface Lease {
  id: string;
  flatId: string;
  buildingId: string;
  tenantId: string;
  tenantName: string;
  ownerId: string;
  ownerName: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  advance: number;
  escalationPct: number;
  noticePeriodDays: number;
  status: "active" | "expiring" | "expired" | "renewed" | "terminated";
}

export interface Household {
  id: string;
  flatId: string;
  buildingId: string;
  block: string;
  type: "owner_household" | "tenant_household";
  headName: string;
  headRelationLabel: string;
  members: number;
  domesticWorkers: number;
  vehicles: number;
  moveIn: string;
  moveOut: string | null;
  contactPhone: string;
  status: "active" | "historical";
}

export interface FamilyMember {
  id: string;
  householdId: string;
  flatId: string;
  name: string;
  nameBn: string;
  gender: "male" | "female" | "other";
  dob: string;
  nid: string;
  relationship: "self" | "spouse" | "child" | "parent" | "sibling" | "relative" | "other";
  phone: string;
  email: string;
  emergencyContact: string;
  occupation: string;
  organization: string;
  moveIn: string;
  moveOut: string | null;
  accessLevel: "full" | "standard" | "restricted";
  status: "active" | "moved_out";
}

export interface AuthorizedResident {
  id: string;
  name: string;
  flatId: string;
  buildingId: string;
  block: string;
  category: "relative" | "long_term_guest" | "caregiver" | "company_employee" | "temporary";
  sponsorName: string;
  sponsorType: "owner" | "tenant";
  phone: string;
  nid: string;
  authorizedFrom: string;
  authorizedTo: string;
  accessLevel: "full" | "standard" | "restricted";
  status: "active" | "expiring" | "expired" | "revoked";
}

export type DomesticWorkerType =
  | "maid" | "cook" | "driver" | "babysitter" | "caregiver" | "gardener"
  | "cleaner" | "personal_assistant" | "other";

export interface DomesticWorker {
  id: string;
  name: string;
  nameBn: string;
  gender: "male" | "female";
  dob: string;
  phone: string;
  nid: string;
  permanentAddress: string;
  emergencyContact: string;
  workerType: DomesticWorkerType;
  employerName: string;
  flatId: string;
  buildingId: string;
  block: string;
  startDate: string;
  endDate: string | null;
  passCode: string;
  verification: "pending" | "verified" | "expired";
  policeVerified: boolean;
  accessWindow: string;
  documents: number;
  status: "pending_verification" | "verified" | "active" | "suspended" | "expired" | "removed";
}

export interface DomesticWorkerEmployment {
  id: string;
  workerId: string;
  workerName: string;
  flatId: string;
  buildingId: string;
  employerName: string;
  workerType: DomesticWorkerType;
  startDate: string;
  endDate: string | null;
  monthlySalary: number;
  status: "current" | "ended";
}

export interface BuildingStaff {
  id: string;
  name: string;
  role: "security" | "caretaker" | "cleaner" | "technician" | "gardener" | "electrician" | "plumber" | "driver";
  buildingId: string;
  phone: string;
  nid: string;
  shift: "morning" | "evening" | "night" | "general";
  joinDate: string;
  monthlySalary: number;
  advance: number;
  overtimeHours: number;
  attendancePct: number;
  leaveBalance: number;
  status: "active" | "on_leave" | "suspended" | "resigned";
}

export interface Vendor {
  id: string;
  company: string;
  category: string;
  contactName: string;
  phone: string;
  email: string;
  buildingId: string;
  contractValue: number;
  outstanding: number;
  rating: number;
  since: string;
  status: "active" | "on_hold" | "terminated";
}

export interface BuildingAsset {
  id: string;
  name: string;
  category: "lift" | "generator" | "pump" | "water_tank" | "cctv" | "fire_extinguisher" | "fire_pump" | "ac" | "solar" | "electrical" | "furniture" | "appliance";
  buildingId: string;
  location: string;
  purchaseDate: string;
  cost: number;
  vendor: string;
  warrantyUntil: string;
  condition: "excellent" | "good" | "fair" | "poor";
  lastMaintenance: string;
  nextMaintenance: string;
  replacementDue: string;
  status: "operational" | "under_maintenance" | "faulty" | "retired";
}

export interface UtilityBill {
  id: string;
  buildingId: string;
  utility: "electricity" | "water" | "gas" | "generator" | "internet";
  meter: string;
  scope: "common_area" | "flat";
  flatId: string | null;
  month: string;
  units: number;
  amount: number;
  dueDate: string;
  status: "paid" | "due" | "overdue";
}

export interface BuildingExpense {
  id: string;
  buildingId: string;
  category: string;
  scope: "common_area" | "building_area" | "floor" | "flat";
  scopeRef: string;
  amount: number;
  date: string;
  vendor: string;
  paymentMethod: "cash" | "bank_transfer" | "bkash" | "nagad" | "cheque";
  invoiceNo: string;
  approvedBy: string;
  notes: string;
  status: "paid" | "pending" | "approved" | "rejected";
}

export interface BuildingIncome {
  id: string;
  buildingId: string;
  source: "rent" | "parking_rent" | "commercial_rent" | "service_charge" | "late_fee" | "security_deposit" | "other";
  flatId: string | null;
  payer: string;
  amount: number;
  date: string;
  month: string;
  method: "cash" | "bank_transfer" | "bkash" | "nagad" | "cheque";
  status: "received" | "pending" | "overdue";
}

export interface Budget {
  id: string;
  buildingId: string;
  period: string;
  category: string;
  planned: number;
  actual: number;
  variance: number;
  status: "on_track" | "at_risk" | "over_budget";
}

export interface PurchaseRequest {
  id: string;
  buildingId: string;
  item: string;
  category: string;
  quantity: number;
  estimatedCost: number;
  requestedBy: string;
  requestedOn: string;
  approvalTier: "caretaker" | "building_manager" | "building_owner";
  vendor: string;
  status: "requested" | "pending_approval" | "approved" | "ordered" | "received" | "invoiced" | "paid" | "rejected";
}

export type ServiceCategory =
  | "laundry" | "dry_cleaning" | "cleaning" | "ac_servicing" | "plumbing" | "electrical"
  | "car_wash" | "car_servicing" | "pest_control" | "appliance_repair" | "tailoring"
  | "salon" | "grocery" | "movers" | "interior" | "tutor" | "driver" | "other";

export interface ServiceProvider {
  id: string;
  business: string;
  contactName: string;
  phone: string;
  email: string;
  category: ServiceCategory;
  services: string;
  description: string;
  priceFrom: number;
  priceTo: number;
  hours: string;
  serviceArea: string;
  rating: number;
  completedJobs: number;
  responseMins: number;
  trustScore: number;
  complaintRate: number;
  noShowRate: number;
  verification: VerificationStatus;
  since: string;
  status: "active" | "paused" | "suspended";
}

export interface ServiceRequest {
  id: string;
  title: string;
  category: ServiceCategory;
  residentName: string;
  flatId: string;
  block: string;
  location: string;
  preferredDate: string;
  budgetFrom: number;
  budgetTo: number;
  pricingModel: "fixed_price" | "quote_request" | "competitive_bid";
  description: string;
  photos: number;
  bids: number;
  createdOn: string;
  status: "open" | "receiving_bids" | "provider_selected" | "converted" | "cancelled" | "expired";
}

export interface ServiceBid {
  id: string;
  requestId: string;
  providerId: string;
  providerName: string;
  price: number;
  availability: string;
  estimatedCompletion: string;
  rating: number;
  note: string;
  submittedOn: string;
  status: "submitted" | "shortlisted" | "selected" | "rejected" | "withdrawn";
}

export type ServiceOrderStatus =
  | "requested" | "providers_responded" | "provider_selected" | "scheduled"
  | "provider_approaching" | "at_gate" | "security_verified" | "caretaker_assigned"
  | "picked_up" | "processing" | "return_to_gate" | "caretaker_received"
  | "delivered" | "resident_confirmed" | "completed"
  | "cancelled" | "rejected" | "no_show" | "disputed" | "lost_damaged" | "escalated";

export interface ServiceOrder {
  id: string;
  requestId: string | null;
  category: ServiceCategory;
  service: string;
  providerId: string;
  providerName: string;
  residentName: string;
  flatId: string;
  buildingId: string;
  block: string;
  gate: string;
  caretakerName: string;
  scheduledDate: string;
  pickupWindow: string;
  returnWindow: string;
  itemCount: number;
  amount: number;
  paymentStatus: "unpaid" | "paid" | "refunded";
  accessPassCode: string;
  otp: string;
  status: ServiceOrderStatus;
  createdOn: string;
}

export interface ServiceItem {
  id: string;
  orderId: string;
  description: string;
  quantity: number;
  weightKg: number;
  conditionOut: string;
  conditionIn: string;
  photos: number;
  pickupDate: string;
  returnDate: string | null;
  status: "with_resident" | "with_caretaker" | "with_provider" | "returned" | "missing" | "damaged";
}

export type HandoverType =
  | "resident_to_caretaker" | "caretaker_to_provider" | "provider_to_caretaker"
  | "caretaker_to_resident" | "gate_verification" | "gate_exit";

export interface ServiceHandover {
  id: string;
  orderId: string;
  sequence: number;
  timestamp: string;
  type: HandoverType;
  personName: string;
  personRole: "resident" | "caretaker" | "service_provider" | "security_officer";
  gate: string;
  location: string;
  confirmation: "otp" | "qr" | "signature" | "photo";
  photos: number;
  notes: string;
  status: "completed" | "pending" | "failed";
}

export interface ServiceDispute {
  id: string;
  orderId: string;
  residentName: string;
  providerName: string;
  reason: "missing_item" | "damaged_item" | "wrong_item" | "late_return" | "poor_service" | "incorrect_price" | "no_show";
  claimAmount: number;
  raisedOn: string;
  evidence: number;
  providerResponse: string;
  reviewer: string;
  resolution: string;
  status: "open" | "provider_responding" | "community_review" | "resolved" | "rejected" | "escalated";
}

export interface ServiceReview {
  id: string;
  orderId: string;
  providerId: string;
  providerName: string;
  residentName: string;
  quality: number;
  behaviour: number;
  timeliness: number;
  price: number;
  carefulness: number;
  overall: number;
  comment: string;
  date: string;
  status: "published" | "flagged" | "hidden";
}

export interface CaretakerTask {
  id: string;
  orderId: string | null;
  buildingId: string;
  caretakerName: string;
  type: "service_pickup" | "service_return" | "maintenance" | "resident_request" | "handover" | "inspection";
  title: string;
  flatId: string;
  scheduledAt: string;
  window: string;
  priority: "low" | "normal" | "high" | "urgent";
  requiresOtp: boolean;
  requiresPhoto: boolean;
  status: "pending" | "accepted" | "in_progress" | "awaiting_otp" | "completed" | "missed";
}

export interface AccessPass {
  id: string;
  personName: string;
  personType: "visitor" | "service_provider" | "domestic_worker" | "delivery" | "contractor";
  organisation: string;
  associatedWith: string;
  flatId: string;
  block: string;
  gate: string;
  purpose: string;
  validFrom: string;
  validTo: string;
  zoneAccess: string;
  orderId: string | null;
  passCode: string;
  status: "expected" | "at_gate" | "verified" | "inside" | "at_collection_point" | "completed" | "denied" | "expired";
}

export interface AccessEvent {
  id: string;
  personName: string;
  personType: "visitor" | "service_provider" | "domestic_worker" | "delivery" | "contractor" | "staff";
  flatId: string;
  purpose: string;
  gate: string;
  entryTime: string;
  exitTime: string | null;
  verification: "qr" | "id_card" | "otp" | "manual";
  authorizedBy: string;
  date: string;
  status: "inside" | "completed" | "denied" | "overstay";
}

export interface CommunityPost {
  id: string;
  author: string;
  authorFlat: string;
  block: string;
  type: "post" | "question" | "recommendation" | "lost_found" | "deal" | "alert" | "notice";
  title: string;
  body: string;
  group: string;
  likes: number;
  comments: number;
  postedOn: string;
  status: "published" | "pending_review" | "hidden";
}

export interface Poll {
  id: string;
  question: string;
  group: string;
  options: string;
  votes: number;
  closesOn: string;
  createdBy: string;
  status: "open" | "closed";
}

export interface NearbyPlace {
  id: string;
  name: string;
  category: "grocery" | "restaurant" | "cafe" | "pharmacy" | "hospital" | "clinic" | "bank" | "atm" | "laundry" | "salon" | "gym" | "school" | "mosque" | "petrol" | "courier" | "workshop" | "bakery" | "market";
  address: string;
  block: string;
  distanceKm: number;
  phone: string;
  hours: string;
  rating: number;
  openNow: boolean;
  verified: boolean;
  offers: string;
}
