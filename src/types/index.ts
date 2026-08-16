export type Role =
  | "super_admin"
  | "community_admin"
  | "security_admin"
  | "security_officer"
  | "property_manager"
  | "maintenance_manager"
  | "finance_manager"
  | "resident"
  | "contractor"
  | "welfare_admin"
  | "building_owner"
  | "building_manager"
  | "accountant"
  | "caretaker"
  | "maintenance_staff"
  | "service_provider"
  | "tenant";

export interface AppUser {
  id: string;
  name: string;
  nameBn: string;
  role: Role;
  phone: string;
  email: string;
  block: string;
  propertyId?: string;
  avatarInitials: string;
}

export type Severity = "low" | "medium" | "high" | "critical";

export interface Block {
  id: string;
  name: string;
  roads: number;
  properties: number;
  residents: number;
  gate: string;
  status: "active" | "under_development";
}

export interface Road {
  id: string;
  name: string;
  block: string;
  lengthM: number;
  condition: "good" | "fair" | "poor";
  streetlights: number;
  lastRepair: string;
}

export interface Property {
  id: string;
  address: string;
  block: string;
  road: string;
  house: string;
  type: "apartment" | "duplex" | "commercial" | "plot";
  flats: number;
  owner: string;
  tenant: string | null;
  occupancy: "occupied" | "vacant" | "partial";
  dues: number;
}

export interface Flat {
  id: string;
  propertyId: string;
  number: string;
  block: string;
  sizeSqft: number;
  bedrooms: number;
  occupancy: "occupied" | "vacant";
  familyId: string | null;
  monthlyCharge: number;
}

export interface Resident {
  id: string;
  name: string;
  phone: string;
  email: string;
  nid: string;
  nidVerified: boolean;
  type: "owner" | "tenant" | "family_member" | "authorized" | "temporary";
  propertyId: string;
  address: string;
  block: string;
  familyId: string;
  status: "active" | "pending" | "inactive";
  since: string;
  vehicles: number;
  dues: number;
}

export interface Family {
  id: string;
  name: string;
  head: string;
  propertyId: string;
  block: string;
  members: number;
  workers: number;
  phone: string;
  status: "active" | "inactive";
}

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  category:
    | "guest"
    | "family"
    | "delivery"
    | "courier"
    | "service"
    | "driver"
    | "contractor"
    | "domestic_worker"
    | "emergency";
  host: string;
  propertyId: string;
  block: string;
  gate: string;
  vehicle: string | null;
  purpose: string;
  date: string;
  time: string;
  status: "pending" | "approved" | "rejected" | "checked_in" | "checked_out" | "expired";
  passCode: string;
}

export interface Vehicle {
  id: string;
  registration: string;
  type: "car" | "microbus" | "motorcycle" | "bicycle" | "truck" | "ambulance";
  brand: string;
  model: string;
  color: string;
  ownerName: string;
  propertyId: string;
  block: string;
  category: "resident" | "visitor" | "commercial" | "service";
  sticker: string;
  status: "active" | "expired" | "blocked";
  parkingSlot: string | null;
}

export interface ParkingSpace {
  id: string;
  code: string;
  block: string;
  zone: string;
  type: "resident" | "visitor" | "commercial";
  status: "available" | "occupied" | "reserved" | "maintenance";
  allocatedTo: string | null;
  monthlyFee: number;
}

export interface Gate {
  id: string;
  name: string;
  block: string;
  entriesToday: number;
  exitsToday: number;
  waiting: number;
  officers: number;
  cctv: "online" | "offline";
  status: "open" | "restricted" | "closed";
}

export interface Officer {
  id: string;
  name: string;
  badge: string;
  gate: string;
  shift: "morning" | "evening" | "night";
  zone: string;
  status: "on_duty" | "off_duty" | "on_patrol" | "leave";
  phone: string;
  patrolProgress: number;
  lastCheckpoint: string;
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  block: string;
  zone: "gate" | "road" | "parking" | "building" | "critical";
  status: "online" | "offline" | "degraded";
  lastActive: string;
}

export interface Incident {
  id: string;
  title: string;
  category:
    | "security"
    | "accident"
    | "fire"
    | "medical"
    | "theft"
    | "unauthorized_access"
    | "vehicle"
    | "property_damage"
    | "infrastructure"
    | "other";
  location: string;
  block: string;
  reportedBy: string;
  assignedTo: string;
  severity: Severity;
  status: "open" | "investigating" | "resolved" | "closed";
  reportedAt: string;
}

export interface Emergency {
  id: string;
  type: "medical" | "fire" | "security" | "accident" | "gas" | "electrical" | "water" | "other";
  resident: string;
  propertyId: string;
  block: string;
  location: string;
  status: "new" | "acknowledged" | "responding" | "on_scene" | "resolved";
  raisedAt: string;
  responseMins: number | null;
  team: string;
}

export interface Complaint {
  id: string;
  title: string;
  category:
    | "water"
    | "electricity"
    | "drainage"
    | "road"
    | "streetlight"
    | "waste"
    | "cleaning"
    | "parking"
    | "security"
    | "construction"
    | "noise"
    | "other";
  location: string;
  block: string;
  raisedBy: string;
  department: string;
  assignedTo: string;
  priority: Severity;
  slaHours: number;
  status: "new" | "assigned" | "in_progress" | "waiting" | "resolved" | "closed";
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  complaintId: string;
  title: string;
  team: string;
  technician: string;
  location: string;
  block: string;
  estimatedCost: number;
  actualCost: number | null;
  startDate: string;
  completionDate: string | null;
  status: "draft" | "assigned" | "in_progress" | "inspection" | "completed" | "closed";
  priority: Severity;
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  kind: "road" | "drain" | "streetlight" | "water" | "waste" | "park" | "fogging";
  block: string;
  location: string;
  status: "operational" | "degraded" | "down" | "scheduled";
  lastService: string;
  nextService: string;
  responsible: string;
}

export interface FireAsset {
  id: string;
  type: "extinguisher" | "hydrant" | "alarm" | "sprinkler";
  location: string;
  block: string;
  status: "ok" | "due" | "faulty";
  lastInspection: string;
  nextInspection: string;
  team: string;
}

export interface Project {
  id: string;
  name: string;
  block: string;
  road: string;
  contractor: string;
  type: "new_construction" | "renovation" | "infrastructure" | "utility";
  stage: "application" | "verification" | "approved" | "construction" | "inspection" | "completed";
  progress: number;
  budget: number;
  startDate: string;
  endDate: string;
}

export interface Contractor {
  id: string;
  company: string;
  contact: string;
  phone: string;
  category:
    | "construction"
    | "electrical"
    | "plumbing"
    | "cleaning"
    | "security"
    | "landscaping"
    | "it"
    | "maintenance";
  registration: string;
  projects: number;
  rating: number;
  paymentDue: number;
  status: "active" | "suspended" | "pending";
}

export interface Worker {
  id: string;
  name: string;
  category:
    | "domestic_worker"
    | "driver"
    | "gardener"
    | "electrician"
    | "plumber"
    | "technician"
    | "cleaner"
    | "construction";
  employer: string;
  propertyId: string;
  block: string;
  verified: boolean;
  validTill: string;
  status: "active" | "expired" | "blocked";
  phone: string;
}

export interface Invoice {
  id: string;
  resident: string;
  propertyId: string;
  block: string;
  head: "service_charge" | "maintenance" | "parking" | "construction" | "penalty" | "utility";
  amount: number;
  paid: number;
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
  status: "paid" | "partial" | "due" | "overdue";
  method: "bkash" | "nagad" | "bank" | "cash" | "card" | null;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  vendor: string;
  amount: number;
  date: string;
  approvedBy: string;
  status: "approved" | "pending" | "rejected";
}

export interface Facility {
  id: string;
  name: string;
  kind: "hall" | "playground" | "sports" | "meeting" | "event" | "park";
  block: string;
  capacity: number;
  hourlyFee: number;
  status: "available" | "booked" | "maintenance";
}

export interface Booking {
  id: string;
  facility: string;
  resident: string;
  propertyId: string;
  date: string;
  slot: string;
  purpose: string;
  guests: number;
  amount: number;
  status: "requested" | "approved" | "rejected" | "completed" | "cancelled";
}

export interface CommunityEvent {
  id: string;
  title: string;
  venue: string;
  date: string;
  time: string;
  organizer: string;
  registered: number;
  capacity: number;
  status: "upcoming" | "open" | "closed" | "completed";
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: string;
  channel: ("push" | "email" | "sms")[];
  priority: "info" | "warning" | "emergency";
  publishedBy: string;
  publishedAt: string;
  status: "published" | "scheduled" | "draft";
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  category:
    | "security"
    | "emergency"
    | "payment"
    | "maintenance"
    | "visitor"
    | "booking"
    | "announcement"
    | "construction"
    | "utility"
    | "community";
  createdAt: string;
  read: boolean;
  severity: "info" | "warning" | "emergency";
}

export interface Delivery {
  id: string;
  courier: string;
  personnel: string;
  parcelCode: string;
  recipient: string;
  propertyId: string;
  gate: string;
  receivedAt: string;
  status: "at_gate" | "notified" | "delivered" | "returned";
}

export interface TransportRoute {
  id: string;
  name: string;
  kind: "school" | "shuttle" | "staff";
  vehicle: string;
  driver: string;
  stops: number;
  passengers: number;
  departure: string;
  status: "on_route" | "idle" | "maintenance";
}

export interface DirectoryEntry {
  id: string;
  name: string;
  kind: "hospital" | "clinic" | "pharmacy" | "ambulance" | "doctor" | "emergency_contact";
  address: string;
  phone: string;
  open24h: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  committee: string;
  participants: number;
  decisions: number;
  actionItems: number;
  status: "scheduled" | "held" | "minuted";
}

export interface CommitteeMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  block: string;
  phone: string;
  termEnds: string;
  status: "active" | "inactive";
}

export interface DocumentRecord {
  id: string;
  name: string;
  category:
    | "nid"
    | "property"
    | "ownership"
    | "lease"
    | "permit"
    | "contractor"
    | "vehicle"
    | "worker"
    | "inspection";
  owner: string;
  uploadedAt: string;
  expiry: string | null;
  verification: "verified" | "pending" | "rejected";
  sizeKb: number;
}

export interface AuditEntry {
  id: string;
  user: string;
  role: Role;
  action: string;
  module: string;
  target: string;
  ip: string;
  timestamp: string;
}

export interface MapMarker {
  id: string;
  label: string;
  layer: "blocks" | "gates" | "cctv" | "incidents" | "emergency" | "parking" | "maintenance";
  x: number;
  y: number;
  detail: string;
  status: string;
}
export * from "./community";
export * from "./accounting";
