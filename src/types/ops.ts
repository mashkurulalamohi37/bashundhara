/**
 * Operating-system layer: identity, relationships, verification, access,
 * requests, tasks, handovers, notifications and audit.
 *
 * Frontend-only domain model. Every entity here is served from the in-memory
 * mock store in `src/services/opsStore.ts` and is shaped so a REST/GraphQL
 * backend can be attached later without changing component code.
 */

export type AccountStatus = "pending" | "active" | "suspended" | "disabled";

export interface UserAccount {
  id: string;
  personId: string;
  phone: string;
  email: string;
  authProvider: "password" | "otp" | "google";
  status: AccountStatus;
  verified: boolean;
  createdAt: string;
  lastLogin: string;
  lastActive: string;
  profileCompletion: number;
}

export interface Person {
  id: string;
  name: string;
  nameBn: string;
  phone: string;
  email: string;
  nid: string;
  photoInitials: string;
  emergencyContact: string;
  language: "en" | "bn";
  createdAt: string;
}

export type RelationshipType =
  | "owner" | "landlord" | "tenant" | "family_member" | "domestic_worker"
  | "property_manager" | "caretaker" | "security_staff" | "maintenance_staff"
  | "service_provider" | "community_staff" | "other";

export type RelationshipStatus =
  | "pending" | "under_review" | "active" | "rejected" | "suspended" | "revoked" | "expired";

export interface Relationship {
  id: string;
  personId: string;
  personName: string;
  type: RelationshipType;
  propertyId: string;
  propertyLabel: string;
  buildingId: string;
  block: string;
  permissions: string[];
  scope: string;
  startDate: string;
  endDate: string | null;
  verifiedBy: string | null;
  status: RelationshipStatus;
}

export type VerificationCategory =
  | "identity" | "property_ownership" | "tenant" | "domestic_worker"
  | "service_provider" | "staff" | "property_manager";

export type VerificationStatusOps =
  | "unverified" | "pending" | "under_review" | "verified" | "rejected" | "expired";

export interface VerificationRecord {
  id: string;
  personId: string;
  personName: string;
  category: VerificationCategory;
  documents: string[];
  submittedOn: string;
  reviewer: string | null;
  reviewNotes: string;
  decidedOn: string | null;
  status: VerificationStatusOps;
}

export type ClaimStatus =
  | "pending_verification" | "under_review" | "approved" | "rejected" | "more_info_required";

export interface PropertyClaim {
  id: string;
  personId: string;
  applicant: string;
  phone: string;
  propertyId: string;
  propertyLabel: string;
  block: string;
  road: string;
  building: string;
  flat: string;
  relationship: RelationshipType;
  documents: string[];
  submittedOn: string;
  reviewer: string | null;
  reviewNotes: string;
  status: ClaimStatus;
}

export type InvitationType =
  | "tenant" | "family_member" | "domestic_worker" | "property_manager" | "staff" | "temporary_guest" | "other";

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export interface Invitation {
  id: string;
  type: InvitationType;
  invitedName: string;
  invitedPhone: string;
  propertyId: string;
  propertyLabel: string;
  invitedBy: string;
  permissions: string[];
  expiresOn: string;
  sentOn: string;
  status: InvitationStatus;
}

export interface AccessPolicyRule {
  id: string;
  personId: string;
  personName: string;
  relationship: RelationshipType;
  role: string;
  propertyId: string;
  propertyLabel: string;
  zone: string;
  purpose: string;
  startDate: string;
  endDate: string;
  days: string;
  startTime: string;
  endTime: string;
  gate: string;
  status: "active" | "suspended" | "expired" | "revoked";
}

export type AccessPassStatus = "pending" | "active" | "used" | "expired" | "revoked";

export interface TemporaryAccessPass {
  id: string;
  personName: string;
  personType: "visitor" | "service_provider" | "contractor" | "domestic_worker" | "delivery" | "technician" | "event_guest";
  purpose: string;
  propertyId: string;
  propertyLabel: string;
  zone: string;
  gate: string;
  date: string;
  validFrom: string;
  validTo: string;
  host: string;
  qrCode: string;
  otp: string;
  requestId: string | null;
  status: AccessPassStatus;
}

export type RequestType =
  | "visitor" | "service" | "maintenance" | "delivery" | "package" | "domestic_worker"
  | "caretaker" | "parking" | "facility" | "utility" | "complaint" | "emergency"
  | "construction" | "other";

export type RequestPriority = "low" | "normal" | "high" | "urgent";

export type RequestStatus =
  | "new" | "assigned" | "accepted" | "in_progress" | "waiting" | "blocked"
  | "completed" | "failed" | "escalated" | "cancelled";

export interface TimelineEvent {
  id: string;
  at: string;
  actor: string;
  actorRole: string;
  label: string;
  detail?: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}

export interface OpsRequest {
  id: string;
  type: RequestType;
  category: string;
  title: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  requesterId: string;
  requesterName: string;
  flatId: string;
  buildingId: string;
  block: string;
  department: string;
  assignedRole: string;
  assigneeName: string | null;
  handlingMode: "caretaker_assisted" | "direct_provider" | "building_staff" | "community_department";
  needsAccessPass: boolean;
  accessPassId: string | null;
  providerName: string | null;
  amount: number;
  paymentStatus: "not_applicable" | "unpaid" | "paid";
  photos: number;
  slaMinutes: number;
  createdAt: string;
  dueAt: string;
  completedAt: string | null;
  escalationLevel: number;
  timeline: TimelineEvent[];
}

export type TaskStatus =
  | "new" | "assigned" | "accepted" | "in_progress" | "waiting" | "blocked"
  | "completed" | "failed" | "cancelled" | "escalated";

export interface OpsTask {
  id: string;
  requestId: string;
  type: string;
  title: string;
  assignedRole: string;
  assigneeName: string;
  buildingId: string;
  flatId: string;
  priority: RequestPriority;
  slaMinutes: number;
  createdAt: string;
  dueAt: string;
  startedAt: string | null;
  completedAt: string | null;
  requiresPhoto: boolean;
  requiresOtp: boolean;
  evidence: number;
  notes: string;
  status: TaskStatus;
}

export type HandoverStatus =
  | "prepared" | "ready_for_pickup" | "collected" | "handed_over" | "in_transit"
  | "received" | "delivered" | "confirmed" | "disputed" | "lost" | "damaged";

export interface Handover {
  id: string;
  requestId: string;
  sequence: number;
  from: string;
  to: string;
  flatId: string;
  item: string;
  quantity: number;
  condition: string;
  photos: number;
  at: string;
  location: string;
  confirmation: "qr" | "otp" | "signature" | "photo";
  code: string;
  status: HandoverStatus;
}

export interface OpsNotification {
  id: string;
  audienceRole: string;
  title: string;
  body: string;
  requestId: string | null;
  at: string;
  read: boolean;
  tone: "info" | "success" | "warning" | "danger";
}

export interface OpsAuditEvent {
  id: string;
  at: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  previousValue: string;
  newValue: string;
  comment: string;
  requestId: string | null;
  propertyId: string | null;
}

export interface FinancialEvent {
  id: string;
  at: string;
  requestId: string;
  description: string;
  amount: number;
  direction: "income" | "expense";
  account: string;
  journalRef: string;
  status: "pending" | "posted";
}

export interface RoutingRule {
  id: string;
  requestType: RequestType;
  category: string;
  department: string;
  assignedRole: string;
  handlingMode: OpsRequest["handlingMode"];
  slaMinutes: number;
  needsAccessPass: boolean;
  needsApproval: boolean;
  taskTemplates: { type: string; title: string; role: string; requiresPhoto?: boolean; requiresOtp?: boolean }[];
  escalationPath: string[];
}

export interface CaretakerShift {
  id: string;
  caretakerName: string;
  shift: "morning" | "afternoon" | "evening" | "night";
  buildingId: string;
  zone: string;
  from: string;
  to: string;
  availability: "available" | "busy" | "off";
  workload: number;
}
