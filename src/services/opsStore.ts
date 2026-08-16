/**
 * In-memory operating store for the community OS layer.
 *
 * This is deliberately a frontend mock: state lives in module scope, mutations
 * are synchronous and subscribers are notified through `useSyncExternalStore`.
 * Every mutation funnels through the engines below (routing → task → SLA →
 * notification → audit → finance) so the same call sites work unchanged once a
 * real backend replaces `applyMutation`.
 */
import type {
  AccessPolicyRule, CaretakerShift, FinancialEvent, Handover, HandoverStatus, Invitation,
  OpsAuditEvent, OpsNotification, OpsRequest, OpsTask, Person, PropertyClaim, Relationship,
  RequestPriority, RequestStatus, RequestType, RoutingRule, TaskStatus, TemporaryAccessPass,
  TimelineEvent, UserAccount, VerificationRecord,
} from "@/types/ops";

/* ------------------------------------------------------------------ utils */

const now = () => new Date();
const iso = (d: Date) => d.toISOString();
const minutesAgo = (m: number) => iso(new Date(Date.now() - m * 60_000));
const minutesAhead = (m: number) => iso(new Date(Date.now() + m * 60_000));
let seq = 1000;
const nextId = (prefix: string) => `${prefix}-${++seq}`;

export const fmtTime = (isoStr: string) =>
  new Date(isoStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
export const fmtDateTime = (isoStr: string) =>
  new Date(isoStr).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export function slaState(req: { dueAt: string; status: RequestStatus | TaskStatus; completedAt?: string | null }) {
  const done = req.status === "completed" || req.status === "cancelled";
  const remainingMs = new Date(req.dueAt).getTime() - Date.now();
  const minutes = Math.round(remainingMs / 60_000);
  if (done) return { label: "Met", tone: "success" as const, minutes };
  if (minutes < 0) return { label: `Breached ${Math.abs(minutes)}m`, tone: "danger" as const, minutes };
  if (minutes < 15) return { label: `${minutes}m left`, tone: "warning" as const, minutes };
  return { label: `${minutes}m left`, tone: "neutral" as const, minutes };
}

/* --------------------------------------------------------- routing engine */

export const ROUTING_RULES: RoutingRule[] = [
  {
    id: "RR-001", requestType: "service", category: "Laundry / dry cleaning",
    department: "Caretaker Operations", assignedRole: "Caretaker", handlingMode: "caretaker_assisted",
    slaMinutes: 30, needsAccessPass: true, needsApproval: false,
    taskTemplates: [
      { type: "service_pickup", title: "Collect items from resident", role: "Caretaker", requiresPhoto: true },
      { type: "handover_out", title: "Hand over items to provider at gate", role: "Caretaker", requiresPhoto: true },
      { type: "handover_in", title: "Receive returned items from provider", role: "Caretaker", requiresPhoto: true },
      { type: "service_return", title: "Deliver items to resident", role: "Caretaker", requiresOtp: true },
    ],
    escalationPath: ["Shift Supervisor", "Building Manager", "Community Admin"],
  },
  {
    id: "RR-002", requestType: "service", category: "In-home service",
    department: "Service Marketplace", assignedRole: "Service Provider", handlingMode: "direct_provider",
    slaMinutes: 120, needsAccessPass: true, needsApproval: false,
    taskTemplates: [
      { type: "gate_verification", title: "Verify provider at gate", role: "Security Officer" },
      { type: "service_execution", title: "Carry out service at flat", role: "Service Provider", requiresPhoto: true },
      { type: "exit_verification", title: "Verify provider exit", role: "Security Officer" },
    ],
    escalationPath: ["Building Manager", "Community Admin"],
  },
  {
    id: "RR-003", requestType: "visitor", category: "Guest",
    department: "Security", assignedRole: "Security Officer", handlingMode: "direct_provider",
    slaMinutes: 5, needsAccessPass: true, needsApproval: true,
    taskTemplates: [
      { type: "visitor_verification", title: "Verify visitor at gate", role: "Security Officer" },
      { type: "host_notification", title: "Notify host and log entry", role: "Security Officer" },
    ],
    escalationPath: ["Security Supervisor", "Security Admin"],
  },
  {
    id: "RR-004", requestType: "maintenance", category: "Plumbing / electrical",
    department: "Maintenance", assignedRole: "Maintenance Staff", handlingMode: "building_staff",
    slaMinutes: 1440, needsAccessPass: false, needsApproval: false,
    taskTemplates: [
      { type: "inspection", title: "Inspect reported fault", role: "Maintenance Staff", requiresPhoto: true },
      { type: "repair", title: "Complete repair", role: "Maintenance Staff", requiresPhoto: true },
    ],
    escalationPath: ["Maintenance Manager", "Community Admin"],
  },
  {
    id: "RR-005", requestType: "package", category: "Courier delivery",
    department: "Caretaker Operations", assignedRole: "Caretaker", handlingMode: "caretaker_assisted",
    slaMinutes: 60, needsAccessPass: true, needsApproval: false,
    taskTemplates: [
      { type: "gate_verification", title: "Verify courier at gate", role: "Security Officer" },
      { type: "package_receive", title: "Receive package and link to flat", role: "Caretaker", requiresPhoto: true },
      { type: "package_deliver", title: "Deliver package to resident", role: "Caretaker", requiresOtp: true },
    ],
    escalationPath: ["Shift Supervisor", "Building Manager"],
  },
  {
    id: "RR-006", requestType: "caretaker", category: "Resident assistance",
    department: "Caretaker Operations", assignedRole: "Caretaker", handlingMode: "caretaker_assisted",
    slaMinutes: 120, needsAccessPass: false, needsApproval: false,
    taskTemplates: [{ type: "resident_request", title: "Assist resident", role: "Caretaker" }],
    escalationPath: ["Shift Supervisor", "Building Manager"],
  },
  {
    id: "RR-007", requestType: "emergency", category: "Emergency response",
    department: "Emergency Response", assignedRole: "Emergency Team", handlingMode: "community_department",
    slaMinutes: 15, needsAccessPass: false, needsApproval: false,
    taskTemplates: [
      { type: "dispatch", title: "Dispatch response team", role: "Emergency Team" },
      { type: "on_scene", title: "Team on scene", role: "Emergency Team" },
      { type: "resolution", title: "Resolve and report", role: "Emergency Team", requiresPhoto: true },
    ],
    escalationPath: ["Security Admin", "Community Admin"],
  },
  {
    id: "RR-008", requestType: "utility", category: "Community infrastructure",
    department: "Community Infrastructure", assignedRole: "Infrastructure Crew", handlingMode: "community_department",
    slaMinutes: 480, needsAccessPass: false, needsApproval: false,
    taskTemplates: [
      { type: "site_survey", title: "Survey reported location", role: "Infrastructure Crew" },
      { type: "works", title: "Complete corrective works", role: "Infrastructure Crew", requiresPhoto: true },
    ],
    escalationPath: ["Infrastructure Manager", "Community Admin"],
  },
  {
    id: "RR-009", requestType: "domestic_worker", category: "Domestic worker entry",
    department: "Security", assignedRole: "Security Officer", handlingMode: "direct_provider",
    slaMinutes: 10, needsAccessPass: false, needsApproval: true,
    taskTemplates: [{ type: "policy_verification", title: "Verify access policy at gate", role: "Security Officer" }],
    escalationPath: ["Security Supervisor"],
  },
  {
    id: "RR-010", requestType: "delivery", category: "Food / grocery delivery",
    department: "Security", assignedRole: "Security Officer", handlingMode: "direct_provider",
    slaMinutes: 20, needsAccessPass: true, needsApproval: false,
    taskTemplates: [
      { type: "gate_verification", title: "Verify rider at gate", role: "Security Officer" },
      { type: "collection_point", title: "Hand over at collection point", role: "Caretaker" },
    ],
    escalationPath: ["Shift Supervisor"],
  },
];

export function resolveRule(type: RequestType, category?: string): RoutingRule {
  return (
    ROUTING_RULES.find((r) => r.requestType === type && (!category || r.category === category)) ??
    ROUTING_RULES.find((r) => r.requestType === type) ??
    ROUTING_RULES[5]!
  );
}

/* ------------------------------------------------------------- seed data */

const PERSONS: Person[] = [
  { id: "PSN-001", name: "Mahbub Alam", nameBn: "মাহবুব আলম", phone: "+8801711000010", email: "mahbub.alam@bashundhara-ra.test", nid: "1994 5521 774301", photoInitials: "MA", emergencyContact: "+8801711220010", language: "en", createdAt: minutesAgo(60 * 24 * 400) },
  { id: "PSN-002", name: "Nusrat Jahan", nameBn: "নুসরাত জাহান", phone: "+8801711000008", email: "nusrat.jahan@bashundhara-ra.test", nid: "1990 7741 220145", photoInitials: "NJ", emergencyContact: "+8801711220008", language: "bn", createdAt: minutesAgo(60 * 24 * 320) },
  { id: "PSN-003", name: "Jamal Uddin", nameBn: "জামাল উদ্দিন", phone: "+8801711000012", email: "jamal.caretaker@bashundhara-ra.test", nid: "1988 3310 887762", photoInitials: "JU", emergencyContact: "+8801711220012", language: "bn", createdAt: minutesAgo(60 * 24 * 260) },
  { id: "PSN-004", name: "Rahim Mia", nameBn: "রহিম মিয়া", phone: "+8801822440071", email: "rahim.worker@bashundhara-ra.test", nid: "1996 2210 553390", photoInitials: "RM", emergencyContact: "+8801822440072", language: "bn", createdAt: minutesAgo(60 * 24 * 120) },
  { id: "PSN-005", name: "Sabrina Islam", nameBn: "সাবরিনা ইসলাম", phone: "+8801711000005", email: "sabrina.manager@bashundhara-ra.test", nid: "1992 8890 114477", photoInitials: "SI", emergencyContact: "+8801711220005", language: "en", createdAt: minutesAgo(60 * 24 * 200) },
  { id: "PSN-006", name: "Tanvir Hasan", nameBn: "তানভীর হাসান", phone: "+8801933110088", email: "tanvir.tenant@bashundhara-ra.test", nid: "1993 4412 990033", photoInitials: "TH", emergencyContact: "+8801933110089", language: "en", createdAt: minutesAgo(60 * 24 * 90) },
  { id: "PSN-007", name: "Clean & Fresh Laundry", nameBn: "ক্লিন অ্যান্ড ফ্রেশ", phone: "+8801711000015", email: "hello@cleanfresh.test", nid: "TIN 4477-9911-22", photoInitials: "CF", emergencyContact: "+8801711000016", language: "en", createdAt: minutesAgo(60 * 24 * 180) },
];

const ACCOUNTS: UserAccount[] = PERSONS.map((p, i) => ({
  id: `ACC-${String(i + 1).padStart(3, "0")}`,
  personId: p.id,
  phone: p.phone,
  email: p.email,
  authProvider: i % 3 === 0 ? "otp" : "password",
  status: i === 3 ? "pending" : "active",
  verified: i !== 3,
  createdAt: p.createdAt,
  lastLogin: minutesAgo(60 * (i + 1)),
  lastActive: minutesAgo(5 * (i + 1)),
  profileCompletion: [100, 96, 88, 62, 100, 84, 91][i] ?? 80,
}));

const RELATIONSHIPS: Relationship[] = [
  { id: "REL-001", personId: "PSN-001", personName: "Mahbub Alam", type: "owner", propertyId: "PRP-A3", propertyLabel: "Flat A-3, Meghna Tower", buildingId: "BLD-004", block: "Block A", permissions: ["property.manage", "tenant.manage", "finance.view", "documents.manage"], scope: "Own property only", startDate: "2019-04-01", endDate: null, verifiedBy: "Farhana Chowdhury", status: "active" },
  { id: "REL-002", personId: "PSN-001", personName: "Mahbub Alam", type: "owner", propertyId: "PRP-B7", propertyLabel: "Flat B-7, Padma Residence", buildingId: "BLD-011", block: "Block B", permissions: ["property.manage", "finance.view"], scope: "Own property only", startDate: "2021-09-15", endDate: null, verifiedBy: "Farhana Chowdhury", status: "active" },
  { id: "REL-003", personId: "PSN-001", personName: "Mahbub Alam", type: "owner", propertyId: "PRP-C2", propertyLabel: "Flat C-2, Jamuna Heights", buildingId: "BLD-019", block: "Block C", permissions: ["property.view"], scope: "Own property only", startDate: "2023-02-20", endDate: null, verifiedBy: "Golam Rabbani", status: "active" },
  { id: "REL-004", personId: "PSN-006", personName: "Tanvir Hasan", type: "tenant", propertyId: "PRP-A3", propertyLabel: "Flat A-3, Meghna Tower", buildingId: "BLD-004", block: "Block A", permissions: ["household.manage", "request.create", "visitor.invite"], scope: "Tenancy only", startDate: "2025-01-01", endDate: "2026-12-31", verifiedBy: "Mahbub Alam", status: "active" },
  { id: "REL-005", personId: "PSN-002", personName: "Nusrat Jahan", type: "family_member", propertyId: "PRP-A3", propertyLabel: "Flat A-3, Meghna Tower", buildingId: "BLD-004", block: "Block A", permissions: ["request.create", "visitor.invite"], scope: "Household only", startDate: "2025-01-01", endDate: null, verifiedBy: "Tanvir Hasan", status: "active" },
  { id: "REL-006", personId: "PSN-004", personName: "Rahim Mia", type: "domestic_worker", propertyId: "PRP-A3", propertyLabel: "Flat A-3, Meghna Tower", buildingId: "BLD-004", block: "Block A", permissions: ["gate.entry"], scope: "Flat A-3 only, Sun–Thu 08:00–18:00", startDate: "2025-06-01", endDate: null, verifiedBy: null, status: "under_review" },
  { id: "REL-007", personId: "PSN-005", personName: "Sabrina Islam", type: "property_manager", propertyId: "PRP-B7", propertyLabel: "Flat B-7, Padma Residence", buildingId: "BLD-011", block: "Block B", permissions: ["tenant.manage", "maintenance.manage", "expense.manage", "reports.view"], scope: "Flat B-7 only, until 2026-12-31", startDate: "2025-03-01", endDate: "2026-12-31", verifiedBy: "Mahbub Alam", status: "active" },
  { id: "REL-008", personId: "PSN-003", personName: "Jamal Uddin", type: "caretaker", propertyId: "BLD-004", propertyLabel: "Meghna Tower", buildingId: "BLD-004", block: "Block A", permissions: ["task.manage", "handover.record"], scope: "Building BLD-004 only", startDate: "2023-05-10", endDate: null, verifiedBy: "Farhana Chowdhury", status: "active" },
];

const CLAIMS: PropertyClaim[] = [
  { id: "CLM-001", personId: "PSN-006", applicant: "Tanvir Hasan", phone: "+8801933110088", propertyId: "PRP-A3", propertyLabel: "Flat A-3, Meghna Tower", block: "Block A", road: "Road 5", building: "Meghna Tower", flat: "A-3", relationship: "tenant", documents: ["Tenancy agreement.pdf", "NID front.jpg", "NID back.jpg"], submittedOn: minutesAgo(60 * 40), reviewer: "Sabrina Islam", reviewNotes: "Lease dates match owner record.", status: "approved" },
  { id: "CLM-002", personId: "PSN-004", applicant: "Rahim Mia", phone: "+8801822440071", propertyId: "PRP-A3", propertyLabel: "Flat A-3, Meghna Tower", block: "Block A", road: "Road 5", building: "Meghna Tower", flat: "A-3", relationship: "domestic_worker", documents: ["NID.jpg", "Photo.jpg", "Employer letter.pdf"], submittedOn: minutesAgo(60 * 8), reviewer: null, reviewNotes: "", status: "pending_verification" },
  { id: "CLM-003", personId: "PSN-007", applicant: "Clean & Fresh Laundry", phone: "+8801711000015", propertyId: "COM-MKT", propertyLabel: "Marketplace listing", block: "Block D", road: "Road 2", building: "—", flat: "—", relationship: "service_provider", documents: ["Trade licence.pdf", "TIN certificate.pdf"], submittedOn: minutesAgo(60 * 30), reviewer: "Golam Rabbani", reviewNotes: "Trade licence expiry to be confirmed.", status: "under_review" },
  { id: "CLM-004", personId: "PSN-001", applicant: "Mahbub Alam", phone: "+8801711000010", propertyId: "PRP-C2", propertyLabel: "Flat C-2, Jamuna Heights", block: "Block C", road: "Road 11", building: "Jamuna Heights", flat: "C-2", relationship: "owner", documents: ["Deed copy.pdf", "Mutation paper.pdf", "Utility bill.pdf"], submittedOn: minutesAgo(60 * 96), reviewer: "Golam Rabbani", reviewNotes: "Ownership record cross-checked with society register.", status: "approved" },
  { id: "CLM-005", personId: "PSN-005", applicant: "Sabrina Islam", phone: "+8801711000005", propertyId: "PRP-B7", propertyLabel: "Flat B-7, Padma Residence", block: "Block B", road: "Road 8", building: "Padma Residence", flat: "B-7", relationship: "property_manager", documents: ["Management agreement.pdf"], submittedOn: minutesAgo(60 * 12), reviewer: "Farhana Chowdhury", reviewNotes: "Owner authorisation letter required.", status: "more_info_required" },
];

const VERIFICATIONS: VerificationRecord[] = [
  { id: "VRF-001", personId: "PSN-001", personName: "Mahbub Alam", category: "property_ownership", documents: ["Deed copy.pdf", "Mutation paper.pdf"], submittedOn: minutesAgo(60 * 96), reviewer: "Golam Rabbani", reviewNotes: "Verified against welfare society register.", decidedOn: minutesAgo(60 * 90), status: "verified" },
  { id: "VRF-002", personId: "PSN-006", personName: "Tanvir Hasan", category: "tenant", documents: ["Tenancy agreement.pdf"], submittedOn: minutesAgo(60 * 40), reviewer: "Sabrina Islam", reviewNotes: "", decidedOn: minutesAgo(60 * 36), status: "verified" },
  { id: "VRF-003", personId: "PSN-004", personName: "Rahim Mia", category: "domestic_worker", documents: ["NID.jpg", "Employer letter.pdf"], submittedOn: minutesAgo(60 * 8), reviewer: null, reviewNotes: "", decidedOn: null, status: "pending" },
  { id: "VRF-004", personId: "PSN-007", personName: "Clean & Fresh Laundry", category: "service_provider", documents: ["Trade licence.pdf"], submittedOn: minutesAgo(60 * 30), reviewer: "Golam Rabbani", reviewNotes: "Awaiting renewed licence.", decidedOn: null, status: "under_review" },
  { id: "VRF-005", personId: "PSN-003", personName: "Jamal Uddin", category: "staff", documents: ["NID.jpg", "Police clearance.pdf"], submittedOn: minutesAgo(60 * 24 * 60), reviewer: "Farhana Chowdhury", reviewNotes: "Police verification complete.", decidedOn: minutesAgo(60 * 24 * 58), status: "verified" },
  { id: "VRF-006", personId: "PSN-005", personName: "Sabrina Islam", category: "property_manager", documents: ["Management agreement.pdf"], submittedOn: minutesAgo(60 * 12), reviewer: "Farhana Chowdhury", reviewNotes: "Owner authorisation letter required.", decidedOn: null, status: "under_review" },
];

const INVITATIONS: Invitation[] = [
  { id: "INV-001", type: "tenant", invitedName: "Tanvir Hasan", invitedPhone: "+8801933110088", propertyId: "PRP-A3", propertyLabel: "Flat A-3, Meghna Tower", invitedBy: "Mahbub Alam", permissions: ["household.manage", "request.create"], expiresOn: minutesAhead(60 * 24 * 3), sentOn: minutesAgo(60 * 44), status: "accepted" },
  { id: "INV-002", type: "family_member", invitedName: "Nusrat Jahan", invitedPhone: "+8801711000008", propertyId: "PRP-A3", propertyLabel: "Flat A-3, Meghna Tower", invitedBy: "Tanvir Hasan", permissions: ["request.create", "visitor.invite"], expiresOn: minutesAhead(60 * 24 * 2), sentOn: minutesAgo(60 * 20), status: "accepted" },
  { id: "INV-003", type: "domestic_worker", invitedName: "Rahim Mia", invitedPhone: "+8801822440071", propertyId: "PRP-A3", propertyLabel: "Flat A-3, Meghna Tower", invitedBy: "Tanvir Hasan", permissions: ["gate.entry"], expiresOn: minutesAhead(60 * 24 * 5), sentOn: minutesAgo(60 * 9), status: "pending" },
  { id: "INV-004", type: "property_manager", invitedName: "Sabrina Islam", invitedPhone: "+8801711000005", propertyId: "PRP-B7", propertyLabel: "Flat B-7, Padma Residence", invitedBy: "Mahbub Alam", permissions: ["tenant.manage", "maintenance.manage", "expense.manage"], expiresOn: minutesAhead(60 * 24 * 30), sentOn: minutesAgo(60 * 24 * 20), status: "accepted" },
  { id: "INV-005", type: "temporary_guest", invitedName: "Mr. Hasan Mahmud", invitedPhone: "+8801611220033", propertyId: "PRP-A3", propertyLabel: "Flat A-3, Meghna Tower", invitedBy: "Nusrat Jahan", permissions: ["gate.entry"], expiresOn: minutesAhead(60 * 6), sentOn: minutesAgo(60 * 2), status: "pending" },
];

const POLICIES: AccessPolicyRule[] = [
  { id: "APL-001", personId: "PSN-004", personName: "Rahim Mia", relationship: "domestic_worker", role: "Domestic Worker", propertyId: "PRP-A3", propertyLabel: "Flat A-3, Meghna Tower", zone: "Flat A-3 only", purpose: "Household work", startDate: "2025-06-01", endDate: "2026-05-31", days: "Sun–Thu", startTime: "08:00", endTime: "18:00", gate: "Gate 2", status: "active" },
  { id: "APL-002", personId: "PSN-003", personName: "Jamal Uddin", relationship: "caretaker", role: "Caretaker", propertyId: "BLD-004", propertyLabel: "Meghna Tower", zone: "Building common areas", purpose: "Caretaker duties", startDate: "2023-05-10", endDate: "2026-12-31", days: "Sat–Fri", startTime: "06:00", endTime: "22:00", gate: "Gate 2", status: "active" },
  { id: "APL-003", personId: "PSN-007", personName: "Clean & Fresh Laundry", relationship: "service_provider", role: "Service Provider", propertyId: "PRP-A3", propertyLabel: "Flat A-3, Meghna Tower", zone: "Gate 3 → Collection point", purpose: "Laundry pickup and return", startDate: "2026-08-16", endDate: "2026-08-16", days: "Today", startTime: "10:00", endTime: "13:00", gate: "Gate 3", status: "active" },
];

const PASSES: TemporaryAccessPass[] = [
  { id: "PAS-001", personName: "Mr. Hasan Mahmud", personType: "visitor", purpose: "Guest visit", propertyId: "PRP-A3", propertyLabel: "Flat A-3, Meghna Tower", zone: "Gate 2 → Building A → Flat A-3", gate: "Gate 2", date: "2026-08-16", validFrom: minutesAhead(60), validTo: minutesAhead(240), host: "Nusrat Jahan", qrCode: "QR-A3-8842", otp: "482913", requestId: null, status: "active" },
  { id: "PAS-002", personName: "Clean & Fresh Laundry", personType: "service_provider", purpose: "Laundry pickup", propertyId: "PRP-A3", propertyLabel: "Flat A-3, Meghna Tower", zone: "Gate 3 → Collection point", gate: "Gate 3", date: "2026-08-16", validFrom: minutesAgo(30), validTo: minutesAhead(90), host: "Tanvir Hasan", qrCode: "QR-LND-2210", otp: "774310", requestId: null, status: "active" },
  { id: "PAS-003", personName: "Shafiq Air Care", personType: "technician", purpose: "AC servicing", propertyId: "PRP-B7", propertyLabel: "Flat B-7, Padma Residence", zone: "Gate 2 → Building B → Floor 4 → Flat B-7", gate: "Gate 2", date: "2026-08-16", validFrom: minutesAgo(240), validTo: minutesAgo(60), host: "Sabrina Islam", qrCode: "QR-ACS-9911", otp: "220987", requestId: null, status: "expired" },
  { id: "PAS-004", personName: "Pathao Courier — Sohel", personType: "delivery", purpose: "Package delivery", propertyId: "PRP-C2", propertyLabel: "Flat C-2, Jamuna Heights", zone: "Gate 1 → Collection point", gate: "Gate 1", date: "2026-08-16", validFrom: minutesAgo(15), validTo: minutesAhead(45), host: "Mahbub Alam", qrCode: "QR-PKG-5521", otp: "119384", requestId: null, status: "active" },
];

const SHIFTS: CaretakerShift[] = [
  { id: "SHF-001", caretakerName: "Jamal Uddin", shift: "morning", buildingId: "BLD-004", zone: "Block A · Meghna Tower", from: "06:00", to: "14:00", availability: "available", workload: 4 },
  { id: "SHF-002", caretakerName: "Abdul Kader", shift: "afternoon", buildingId: "BLD-004", zone: "Block A · Meghna Tower", from: "14:00", to: "22:00", availability: "busy", workload: 7 },
  { id: "SHF-003", caretakerName: "Selim Reza", shift: "night", buildingId: "BLD-004", zone: "Block A · Meghna Tower", from: "22:00", to: "06:00", availability: "off", workload: 1 },
  { id: "SHF-004", caretakerName: "Nazmul Haque", shift: "morning", buildingId: "BLD-011", zone: "Block B · Padma Residence", from: "06:00", to: "14:00", availability: "available", workload: 3 },
  { id: "SHF-005", caretakerName: "Ripon Sheikh", shift: "evening", buildingId: "BLD-019", zone: "Block C · Jamuna Heights", from: "16:00", to: "00:00", availability: "available", workload: 2 },
];

/* --------------------------------------------------- request/task seeding */

interface Store {
  version: number;
  persons: Person[];
  accounts: UserAccount[];
  relationships: Relationship[];
  claims: PropertyClaim[];
  verifications: VerificationRecord[];
  invitations: Invitation[];
  policies: AccessPolicyRule[];
  passes: TemporaryAccessPass[];
  requests: OpsRequest[];
  tasks: OpsTask[];
  handovers: Handover[];
  notifications: OpsNotification[];
  audit: OpsAuditEvent[];
  finance: FinancialEvent[];
  shifts: CaretakerShift[];
}

const CARETAKERS = ["Jamal Uddin", "Abdul Kader", "Nazmul Haque", "Ripon Sheikh"];

function buildRequest(input: {
  type: RequestType; category?: string; title: string; description: string;
  priority?: RequestPriority; requesterName: string; requesterId?: string;
  flatId: string; buildingId: string; block: string; providerName?: string | null;
  amount?: number; ageMinutes?: number; status?: RequestStatus;
}): { request: OpsRequest; tasks: OpsTask[] } {
  const rule = resolveRule(input.type, input.category);
  const created = new Date(Date.now() - (input.ageMinutes ?? 2) * 60_000);
  const id = nextId("REQ");
  const priority = input.priority ?? "normal";
  const assignee =
    rule.assignedRole === "Caretaker" ? CARETAKERS[Math.floor(Math.random() * CARETAKERS.length)]! :
    rule.assignedRole === "Security Officer" ? "Rakib Sarker" :
    rule.assignedRole === "Maintenance Staff" ? "Imran Bhuiyan" :
    rule.assignedRole === "Service Provider" ? (input.providerName ?? "Assigned provider") :
    rule.assignedRole;

  const request: OpsRequest = {
    id,
    type: input.type,
    category: input.category ?? rule.category,
    title: input.title,
    description: input.description,
    priority,
    status: input.status ?? "new",
    requesterId: input.requesterId ?? "PSN-006",
    requesterName: input.requesterName,
    flatId: input.flatId,
    buildingId: input.buildingId,
    block: input.block,
    department: rule.department,
    assignedRole: rule.assignedRole,
    assigneeName: input.status === "new" ? null : assignee,
    handlingMode: rule.handlingMode,
    needsAccessPass: rule.needsAccessPass,
    accessPassId: null,
    providerName: input.providerName ?? null,
    amount: input.amount ?? 0,
    paymentStatus: input.amount ? "unpaid" : "not_applicable",
    photos: 0,
    slaMinutes: rule.slaMinutes,
    createdAt: iso(created),
    dueAt: iso(new Date(created.getTime() + rule.slaMinutes * 60_000)),
    completedAt: null,
    escalationLevel: 0,
    timeline: [
      { id: nextId("EVT"), at: iso(created), actor: input.requesterName, actorRole: "Requester", label: "Request created", detail: input.title, tone: "neutral" },
      { id: nextId("EVT"), at: iso(new Date(created.getTime() + 60_000)), actor: "Routing engine", actorRole: "System", label: `Routed to ${rule.department}`, detail: `${rule.assignedRole} · SLA ${rule.slaMinutes} min`, tone: "neutral" },
    ],
  };

  const tasks: OpsTask[] = rule.taskTemplates.map((tpl, i) => ({
    id: nextId("TSK"),
    requestId: id,
    type: tpl.type,
    title: tpl.title,
    assignedRole: tpl.role,
    assigneeName: tpl.role === "Caretaker" ? assignee : tpl.role === "Security Officer" ? "Rakib Sarker" : assignee,
    buildingId: input.buildingId,
    flatId: input.flatId,
    priority,
    slaMinutes: rule.slaMinutes,
    createdAt: iso(created),
    dueAt: iso(new Date(created.getTime() + rule.slaMinutes * 60_000 * (i + 1))),
    startedAt: null,
    completedAt: null,
    requiresPhoto: !!tpl.requiresPhoto,
    requiresOtp: !!tpl.requiresOtp,
    evidence: 0,
    notes: "",
    status: "new",
  }));

  return { request, tasks };
}

function seedRequests() {
  const requests: OpsRequest[] = [];
  const tasks: OpsTask[] = [];
  const specs: Parameters<typeof buildRequest>[0][] = [
    { type: "service", category: "Laundry / dry cleaning", title: "Laundry pickup — 12 items", description: "Weekly laundry, 12 items including 3 formal shirts.", requesterName: "Tanvir Hasan", flatId: "A-3", buildingId: "BLD-004", block: "Block A", providerName: "Clean & Fresh Laundry", amount: 1450, ageMinutes: 55, status: "in_progress", priority: "high" },
    { type: "visitor", category: "Guest", title: "Guest visit — Mr. Hasan Mahmud", description: "Family guest expected 18:00–21:00 at Gate 2.", requesterName: "Nusrat Jahan", flatId: "A-3", buildingId: "BLD-004", block: "Block A", ageMinutes: 12, status: "accepted" },
    { type: "maintenance", category: "Plumbing / electrical", title: "Kitchen sink leaking", description: "Water leaking from under the kitchen sink since morning.", requesterName: "Tanvir Hasan", flatId: "A-3", buildingId: "BLD-004", block: "Block A", ageMinutes: 300, status: "assigned", priority: "high" },
    { type: "package", category: "Courier delivery", title: "Daraz package at Gate 1", description: "Courier waiting at Gate 1 with one parcel.", requesterName: "Mahbub Alam", flatId: "C-2", buildingId: "BLD-019", block: "Block C", ageMinutes: 18, status: "in_progress" },
    { type: "caretaker", category: "Resident assistance", title: "Help elderly resident with groceries", description: "Assistance required carrying groceries to 6th floor.", requesterName: "Nusrat Jahan", flatId: "A-3", buildingId: "BLD-004", block: "Block A", ageMinutes: 40, status: "accepted" },
    { type: "service", category: "In-home service", title: "AC servicing — 2 units", description: "Split AC servicing for bedroom and living room.", requesterName: "Sabrina Islam", flatId: "B-7", buildingId: "BLD-011", block: "Block B", providerName: "Shafiq Air Care", amount: 3200, ageMinutes: 140, status: "escalated", priority: "high" },
    { type: "emergency", category: "Emergency response", title: "SOS — chest pain, Flat C-2", description: "Resident reported chest pain, ambulance support required.", requesterName: "Mahbub Alam", flatId: "C-2", buildingId: "BLD-019", block: "Block C", ageMinutes: 9, status: "in_progress", priority: "urgent" },
    { type: "utility", category: "Community infrastructure", title: "Streetlight out on Road 11", description: "Three streetlights not working near Jamuna Heights.", requesterName: "Mahbub Alam", flatId: "C-2", buildingId: "BLD-019", block: "Block C", ageMinutes: 600, status: "in_progress", priority: "low" },
    { type: "domestic_worker", category: "Domestic worker entry", title: "Domestic worker entry — Rahim Mia", description: "Daily entry under access policy APL-001.", requesterName: "Tanvir Hasan", flatId: "A-3", buildingId: "BLD-004", block: "Block A", ageMinutes: 480, status: "completed" },
    { type: "delivery", category: "Food / grocery delivery", title: "Foodpanda delivery at Gate 2", description: "Rider expected within 15 minutes.", requesterName: "Nusrat Jahan", flatId: "A-3", buildingId: "BLD-004", block: "Block A", ageMinutes: 6, status: "new" },
    { type: "maintenance", category: "Plumbing / electrical", title: "Corridor light flickering", description: "Fourth-floor corridor light flickering at night.", requesterName: "Sabrina Islam", flatId: "B-7", buildingId: "BLD-011", block: "Block B", ageMinutes: 1500, status: "completed", priority: "low" },
    { type: "caretaker", category: "Resident assistance", title: "Collect dry cleaning from gate", description: "Provider returned two suits at Gate 3.", requesterName: "Tanvir Hasan", flatId: "A-3", buildingId: "BLD-004", block: "Block A", ageMinutes: 200, status: "completed" },
  ];

  for (const spec of specs) {
    const { request, tasks: t } = buildRequest(spec);
    // Progress seeded tasks to match the request status.
    if (request.status === "completed") {
      request.completedAt = minutesAgo(1);
      t.forEach((task) => { task.status = "completed"; task.startedAt = task.createdAt; task.completedAt = minutesAgo(2); task.evidence = task.requiresPhoto ? 2 : 0; });
      request.timeline.push(
        { id: nextId("EVT"), at: minutesAgo(3), actor: request.assigneeName ?? "Operations", actorRole: request.assignedRole, label: "All tasks completed", tone: "success" },
        { id: nextId("EVT"), at: minutesAgo(1), actor: request.requesterName, actorRole: "Requester", label: "Resident confirmed completion", tone: "success" },
      );
      if (request.amount) request.paymentStatus = "paid";
    } else if (request.status === "in_progress" || request.status === "escalated") {
      t.forEach((task, i) => {
        if (i === 0) { task.status = "completed"; task.startedAt = task.createdAt; task.completedAt = minutesAgo(10); task.evidence = 2; }
        else if (i === 1) { task.status = "in_progress"; task.startedAt = minutesAgo(8); }
        else task.status = "assigned";
      });
      request.timeline.push({ id: nextId("EVT"), at: minutesAgo(10), actor: request.assigneeName ?? "Operations", actorRole: request.assignedRole, label: "First task completed", tone: "success" });
      if (request.status === "escalated") {
        request.escalationLevel = 1;
        request.timeline.push({ id: nextId("EVT"), at: minutesAgo(4), actor: "SLA engine", actorRole: "System", label: "SLA breached — escalated to Building Manager", tone: "danger" });
      }
    } else if (request.status === "accepted" || request.status === "assigned") {
      t.forEach((task, i) => { task.status = i === 0 ? (request.status === "accepted" ? "accepted" : "assigned") : "new"; });
      request.timeline.push({ id: nextId("EVT"), at: minutesAgo(2), actor: request.assigneeName ?? "Operations", actorRole: request.assignedRole, label: request.status === "accepted" ? "Task accepted" : "Task assigned", tone: "neutral" });
    }
    requests.push(request);
    tasks.push(...t);
  }
  return { requests, tasks };
}

const seeded = seedRequests();
const laundry = seeded.requests[0]!;

const HANDOVERS: Handover[] = [
  { id: "HND-001", requestId: laundry.id, sequence: 1, from: "Tanvir Hasan (Resident)", to: "Jamal Uddin (Caretaker)", flatId: "A-3", item: "Laundry bag — 12 items", quantity: 12, condition: "Good", photos: 2, at: minutesAgo(35), location: "Flat A-3 door", confirmation: "photo", code: "HO-2210", status: "collected" },
  { id: "HND-002", requestId: laundry.id, sequence: 2, from: "Jamal Uddin (Caretaker)", to: "Clean & Fresh Laundry", flatId: "A-3", item: "Laundry bag — 12 items", quantity: 12, condition: "Good", photos: 1, at: minutesAgo(20), location: "Gate 3 collection point", confirmation: "qr", code: "QR-LND-2210", status: "handed_over" },
];

const NOTIFICATIONS: OpsNotification[] = [
  { id: "NTF-001", audienceRole: "Caretaker", title: "New pickup task", body: `Laundry pickup for Flat A-3 (${laundry.id})`, requestId: laundry.id, at: minutesAgo(50), read: false, tone: "info" },
  { id: "NTF-002", audienceRole: "Security Officer", title: "Provider expected at Gate 3", body: "Clean & Fresh Laundry — pass PAS-002 valid until 13:00", requestId: laundry.id, at: minutesAgo(28), read: false, tone: "warning" },
  { id: "NTF-003", audienceRole: "Resident", title: "Caretaker collected your items", body: "12 items collected and photographed.", requestId: laundry.id, at: minutesAgo(35), read: true, tone: "success" },
  { id: "NTF-004", audienceRole: "Community Admin", title: "SLA breach", body: "AC servicing request escalated to Building Manager.", requestId: seeded.requests[5]!.id, at: minutesAgo(4), read: false, tone: "danger" },
];

const AUDIT: OpsAuditEvent[] = [
  { id: "AUD-001", at: minutesAgo(60 * 90), actor: "Golam Rabbani", role: "Welfare Admin", action: "Property claim approved", target: "CLM-004", previousValue: "under_review", newValue: "approved", comment: "Deed verified against society register.", requestId: null, propertyId: "PRP-C2" },
  { id: "AUD-002", at: minutesAgo(60 * 36), actor: "Sabrina Islam", role: "Property Manager", action: "Tenant relationship activated", target: "REL-004", previousValue: "pending", newValue: "active", comment: "Lease 2025-01-01 → 2026-12-31.", requestId: null, propertyId: "PRP-A3" },
  { id: "AUD-003", at: minutesAgo(30), actor: "Routing engine", role: "System", action: "Access pass issued", target: "PAS-002", previousValue: "—", newValue: "active", comment: "Gate 3 → collection point, 3 hour validity.", requestId: laundry.id, propertyId: "PRP-A3" },
];

const FINANCE: FinancialEvent[] = [
  { id: "FIN-001", at: minutesAgo(60 * 20), requestId: seeded.requests[10]!.id, description: "Corridor light repair — materials", amount: 1850, direction: "expense", account: "5210 · Repairs & Maintenance", journalRef: "JV-2026-0841", status: "posted" },
  { id: "FIN-002", at: minutesAgo(60 * 3), requestId: seeded.requests[11]!.id, description: "Dry cleaning service — Flat A-3", amount: 900, direction: "income", account: "4120 · Service Commission", journalRef: "JV-2026-0846", status: "posted" },
];

const state: Store = {
  version: 0,
  persons: PERSONS,
  accounts: ACCOUNTS,
  relationships: RELATIONSHIPS,
  claims: CLAIMS,
  verifications: VERIFICATIONS,
  invitations: INVITATIONS,
  policies: POLICIES,
  passes: PASSES,
  requests: seeded.requests,
  tasks: seeded.tasks,
  handovers: HANDOVERS,
  notifications: NOTIFICATIONS,
  audit: AUDIT,
  finance: FINANCE,
  shifts: SHIFTS,
};

/* ---------------------------------------------------------- subscription */

const listeners = new Set<() => void>();
let snapshot: Store = { ...state };

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function getSnapshot(): Store {
  return snapshot;
}
function commit() {
  state.version += 1;
  snapshot = { ...state };
  listeners.forEach((l) => l());
}

function audit(entry: Omit<OpsAuditEvent, "id" | "at">) {
  state.audit = [{ id: nextId("AUD"), at: iso(now()), ...entry }, ...state.audit];
}
function notify(entry: Omit<OpsNotification, "id" | "at" | "read">) {
  state.notifications = [{ id: nextId("NTF"), at: iso(now()), read: false, ...entry }, ...state.notifications];
}
function pushEvent(requestId: string, event: Omit<TimelineEvent, "id" | "at">) {
  state.requests = state.requests.map((r) =>
    r.id === requestId ? { ...r, timeline: [...r.timeline, { id: nextId("EVT"), at: iso(now()), ...event }] } : r,
  );
}

/* -------------------------------------------------------------- mutations */

export const opsStore = {
  /** Request engine: create → route → tasks → access pass → notify → audit. */
  createRequest(input: {
    type: RequestType; category?: string; title: string; description: string;
    priority?: RequestPriority; requesterName: string; flatId: string; buildingId?: string;
    block?: string; providerName?: string | null; amount?: number;
  }) {
    const { request, tasks } = buildRequest({
      ...input,
      buildingId: input.buildingId ?? "BLD-004",
      block: input.block ?? "Block A",
      ageMinutes: 0,
      status: "assigned",
    });
    request.assigneeName = tasks[0]?.assigneeName ?? null;
    tasks[0]!.status = "assigned";
    state.requests = [request, ...state.requests];
    state.tasks = [...tasks, ...state.tasks];

    if (request.needsAccessPass && request.providerName) {
      const pass: TemporaryAccessPass = {
        id: nextId("PAS"),
        personName: request.providerName,
        personType: request.type === "delivery" ? "delivery" : "service_provider",
        purpose: request.title,
        propertyId: `PRP-${request.flatId}`,
        propertyLabel: `Flat ${request.flatId}`,
        zone: request.handlingMode === "caretaker_assisted" ? "Gate 3 → Collection point" : `Gate 2 → Flat ${request.flatId}`,
        gate: request.handlingMode === "caretaker_assisted" ? "Gate 3" : "Gate 2",
        date: iso(now()).slice(0, 10),
        validFrom: iso(now()),
        validTo: minutesAhead(180),
        host: request.requesterName,
        qrCode: `QR-${request.id}`,
        otp: String(Math.floor(100000 + Math.random() * 899999)),
        requestId: request.id,
        status: "active",
      };
      state.passes = [pass, ...state.passes];
      state.requests = state.requests.map((r) => (r.id === request.id ? { ...r, accessPassId: pass.id } : r));
      pushEvent(request.id, { actor: "Access engine", actorRole: "System", label: `Temporary access pass ${pass.id} issued`, detail: pass.zone, tone: "neutral" });
      notify({ audienceRole: "Security Officer", title: "Provider expected", body: `${pass.personName} — ${pass.zone}`, requestId: request.id, tone: "warning" });
    }

    notify({ audienceRole: request.assignedRole, title: "New task assigned", body: `${request.title} · Flat ${request.flatId}`, requestId: request.id, tone: "info" });
    audit({ actor: request.requesterName, role: "Requester", action: "Request created", target: request.id, previousValue: "—", newValue: "assigned", comment: request.title, requestId: request.id, propertyId: `PRP-${request.flatId}` });
    commit();
    return request;
  },

  addRequest(input: any) {
    return opsStore.createRequest(input);
  },

  setRequestStatus(requestId: string, status: RequestStatus, comment = "") {
    const prev = state.requests.find((r) => r.id === requestId);
    if (!prev) return;
    state.requests = state.requests.map((r) =>
      r.id === requestId
        ? { ...r, status, completedAt: status === "completed" ? iso(now()) : r.completedAt, escalationLevel: status === "escalated" ? r.escalationLevel + 1 : r.escalationLevel }
        : r,
    );
    pushEvent(requestId, {
      actor: "Operations", actorRole: "System",
      label: `Status changed to ${status.replace(/_/g, " ")}`,
      ...(comment ? { detail: comment } : {}),
      tone: status === "completed" ? "success" : status === "escalated" || status === "failed" ? "danger" : "neutral",
    });
    audit({ actor: "Operations", role: "System", action: "Request status change", target: requestId, previousValue: prev.status, newValue: status, comment, requestId, propertyId: `PRP-${prev.flatId}` });
    commit();
  },

  assign(requestId: string, assigneeName: string) {
    const prev = state.requests.find((r) => r.id === requestId);
    state.requests = state.requests.map((r) => (r.id === requestId ? { ...r, assigneeName, status: r.status === "new" ? "assigned" : r.status } : r));
    state.tasks = state.tasks.map((t) => (t.requestId === requestId && t.status === "new" ? { ...t, assigneeName, status: "assigned" } : t));
    pushEvent(requestId, { actor: assigneeName, actorRole: prev?.assignedRole ?? "Staff", label: "Assigned", detail: assigneeName, tone: "neutral" });
    notify({ audienceRole: prev?.assignedRole ?? "Caretaker", title: "Task assigned", body: `${prev?.title ?? requestId} assigned to ${assigneeName}`, requestId, tone: "info" });
    audit({ actor: "Dispatcher", role: "Community Admin", action: "Assignment", target: requestId, previousValue: prev?.assigneeName ?? "—", newValue: assigneeName, comment: "", requestId, propertyId: null });
    commit();
  },

  escalate(requestId: string) {
    const req = state.requests.find((r) => r.id === requestId);
    if (!req) return;
    const rule = resolveRule(req.type, req.category);
    const to = rule.escalationPath[Math.min(req.escalationLevel, rule.escalationPath.length - 1)] ?? "Community Admin";
    state.requests = state.requests.map((r) => (r.id === requestId ? { ...r, status: "escalated", escalationLevel: r.escalationLevel + 1 } : r));
    pushEvent(requestId, { actor: "SLA engine", actorRole: "System", label: `Escalated to ${to}`, tone: "danger" });
    notify({ audienceRole: to, title: "Escalation", body: `${req.title} escalated (${req.id})`, requestId, tone: "danger" });
    audit({ actor: "SLA engine", role: "System", action: "Escalation", target: requestId, previousValue: req.status, newValue: "escalated", comment: `Escalated to ${to}`, requestId, propertyId: null });
    commit();
  },

  /** Task engine. Completing the last task completes the parent request. */
  updateTask(taskId: string, status: TaskStatus, options: { note?: string; photo?: boolean } = {}) {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;
    state.tasks = state.tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status,
            startedAt: status === "in_progress" && !t.startedAt ? iso(now()) : t.startedAt,
            completedAt: status === "completed" ? iso(now()) : t.completedAt,
            evidence: options.photo ? t.evidence + 1 : t.evidence,
            notes: options.note ?? t.notes,
          }
        : t,
    );
    pushEvent(task.requestId, {
      actor: task.assigneeName, actorRole: task.assignedRole,
      label: `${task.title} — ${status.replace(/_/g, " ")}`,
      ...(options.note ? { detail: options.note } : {}),
      tone: status === "completed" ? "success" : status === "failed" ? "danger" : "neutral",
    });
    audit({ actor: task.assigneeName, role: task.assignedRole, action: "Task status change", target: task.id, previousValue: task.status, newValue: status, comment: options.note ?? "", requestId: task.requestId, propertyId: null });

    const siblings = state.tasks.filter((t) => t.requestId === task.requestId);
    const allDone = siblings.every((t) => t.status === "completed");
    const req = state.requests.find((r) => r.id === task.requestId);
    if (req) {
      if (allDone) {
        state.requests = state.requests.map((r) => (r.id === req.id ? { ...r, status: "completed", completedAt: iso(now()), paymentStatus: r.amount ? "paid" : r.paymentStatus } : r));
        pushEvent(req.id, { actor: req.requesterName, actorRole: "Requester", label: "Request completed and confirmed", tone: "success" });
        notify({ audienceRole: "Resident", title: "Request completed", body: `${req.title} is complete.`, requestId: req.id, tone: "success" });
        if (req.amount) {
          state.finance = [{ id: nextId("FIN"), at: iso(now()), requestId: req.id, description: `${req.title} — service settlement`, amount: req.amount, direction: "income", account: "4120 · Service Commission", journalRef: `JV-${nextId("REF")}`, status: "posted" }, ...state.finance];
          pushEvent(req.id, { actor: "Accounts engine", actorRole: "System", label: `Financial event posted — BDT ${req.amount.toLocaleString("en-BD")}`, tone: "success" });
        }
        // Access passes tied to this request expire on completion.
        state.passes = state.passes.map((p) => (p.requestId === req.id && p.status === "active" ? { ...p, status: "used" } : p));
      } else if (req.status === "new" || req.status === "assigned") {
        state.requests = state.requests.map((r) => (r.id === req.id ? { ...r, status: status === "accepted" ? "accepted" : "in_progress" } : r));
      } else if (status === "in_progress" && req.status !== "in_progress") {
        state.requests = state.requests.map((r) => (r.id === req.id ? { ...r, status: "in_progress" } : r));
      }
    }
    commit();
  },

  recordHandover(input: { requestId: string; from: string; to: string; item: string; quantity: number; condition: string; location: string; confirmation: Handover["confirmation"]; status: HandoverStatus; photos?: number }) {
    const sequence = state.handovers.filter((h) => h.requestId === input.requestId).length + 1;
    const req = state.requests.find((r) => r.id === input.requestId);
    const handover: Handover = {
      id: nextId("HND"),
      sequence,
      flatId: req?.flatId ?? "—",
      photos: input.photos ?? 1,
      at: iso(now()),
      code: `HO-${1000 + sequence}`,
      ...input,
    };
    state.handovers = [handover, ...state.handovers];
    pushEvent(input.requestId, { actor: input.from, actorRole: "Handover", label: `Handover ${input.status.replace(/_/g, " ")} → ${input.to}`, detail: `${input.item} · ${input.quantity} item(s)`, tone: "neutral" });
    audit({ actor: input.from, role: "Handover", action: "Handover recorded", target: handover.id, previousValue: "—", newValue: input.status, comment: input.item, requestId: input.requestId, propertyId: null });
    commit();
    return handover;
  },

  reviewClaim(claimId: string, status: PropertyClaim["status"], reviewer: string, notes: string) {
    const claim = state.claims.find((c) => c.id === claimId);
    if (!claim) return;
    state.claims = state.claims.map((c) => (c.id === claimId ? { ...c, status, reviewer, reviewNotes: notes } : c));
    state.verifications = state.verifications.map((v) =>
      v.personId === claim.personId && v.status !== "verified"
        ? { ...v, status: status === "approved" ? "verified" : status === "rejected" ? "rejected" : "under_review", reviewer, decidedOn: iso(now()), reviewNotes: notes }
        : v,
    );
    if (status === "approved") {
      const exists = state.relationships.some((r) => r.personId === claim.personId && r.propertyId === claim.propertyId && r.type === claim.relationship);
      if (!exists) {
        state.relationships = [
          {
            id: nextId("REL"), personId: claim.personId, personName: claim.applicant, type: claim.relationship,
            propertyId: claim.propertyId, propertyLabel: claim.propertyLabel, buildingId: "BLD-004", block: claim.block,
            permissions: claim.relationship === "owner" ? ["property.manage", "tenant.manage", "finance.view"] : ["request.create"],
            scope: claim.relationship === "owner" ? "Own property only" : "Scoped to claimed property",
            startDate: iso(now()).slice(0, 10), endDate: null, verifiedBy: reviewer, status: "active",
          },
          ...state.relationships,
        ];
      }
      if (claim.relationship === "domestic_worker") {
        state.policies = [
          {
            id: nextId("APL"), personId: claim.personId, personName: claim.applicant, relationship: "domestic_worker",
            role: "Domestic Worker", propertyId: claim.propertyId, propertyLabel: claim.propertyLabel,
            zone: `${claim.flat} only`, purpose: "Household work", startDate: iso(now()).slice(0, 10),
            endDate: "2027-12-31", days: "Sun–Thu", startTime: "08:00", endTime: "18:00", gate: "Gate 2", status: "active",
          },
          ...state.policies,
        ];
        notify({ audienceRole: "Security Officer", title: "New domestic worker access policy", body: `${claim.applicant} — ${claim.flat}, Sun–Thu 08:00–18:00`, requestId: null, tone: "info" });
      }
    }
    notify({ audienceRole: "Resident", title: `Property claim ${status.replace(/_/g, " ")}`, body: `${claim.propertyLabel} — ${claim.id}`, requestId: null, tone: status === "approved" ? "success" : "warning" });
    audit({ actor: reviewer, role: "Verification Officer", action: "Property claim review", target: claimId, previousValue: claim.status, newValue: status, comment: notes, requestId: null, propertyId: claim.propertyId });
    commit();
  },

  submitClaim(input: { applicant: string; phone: string; block: string; road: string; building: string; flat: string; relationship: PropertyClaim["relationship"]; documents: string[] }) {
    const personId = state.persons.find((p) => p.phone === input.phone)?.id ?? nextId("PSN");
    const claim: PropertyClaim = {
      id: nextId("CLM"),
      personId,
      applicant: input.applicant,
      phone: input.phone,
      propertyId: `PRP-${input.flat}`,
      propertyLabel: `Flat ${input.flat}, ${input.building}`,
      block: input.block, road: input.road, building: input.building, flat: input.flat,
      relationship: input.relationship,
      documents: input.documents,
      submittedOn: iso(now()),
      reviewer: null, reviewNotes: "",
      status: "pending_verification",
    };
    state.claims = [claim, ...state.claims];
    state.verifications = [
      {
        id: nextId("VRF"), personId, personName: input.applicant,
        category: input.relationship === "owner" ? "property_ownership" : input.relationship === "tenant" ? "tenant" : input.relationship === "domestic_worker" ? "domestic_worker" : "identity",
        documents: input.documents, submittedOn: iso(now()), reviewer: null, reviewNotes: "", decidedOn: null, status: "pending",
      },
      ...state.verifications,
    ];
    notify({ audienceRole: "Community Admin", title: "New property claim", body: `${input.applicant} — ${claim.propertyLabel}`, requestId: null, tone: "info" });
    audit({ actor: input.applicant, role: "Applicant", action: "Property claim submitted", target: claim.id, previousValue: "—", newValue: "pending_verification", comment: `${claim.relationship} claim`, requestId: null, propertyId: claim.propertyId });
    commit();
    return claim;
  },

  sendInvitation(input: { type: Invitation["type"]; invitedName: string; invitedPhone: string; propertyId: string; propertyLabel: string; invitedBy: string; permissions: string[] }) {
    const invitation: Invitation = { id: nextId("INV"), ...input, expiresOn: minutesAhead(60 * 24 * 7), sentOn: iso(now()), status: "pending" };
    state.invitations = [invitation, ...state.invitations];
    audit({ actor: input.invitedBy, role: "Resident", action: "Invitation sent", target: invitation.id, previousValue: "—", newValue: "pending", comment: `${input.type} invitation to ${input.invitedName}`, requestId: null, propertyId: input.propertyId });
    commit();
    return invitation;
  },

  setInvitationStatus(id: string, status: Invitation["status"]) {
    const inv = state.invitations.find((i) => i.id === id);
    if (!inv) return;
    state.invitations = state.invitations.map((i) => (i.id === id ? { ...i, status } : i));
    if (status === "accepted") {
      state.relationships = [
        {
          id: nextId("REL"), personId: nextId("PSN"), personName: inv.invitedName,
          type: inv.type === "temporary_guest" ? "other" : (inv.type as Relationship["type"]),
          propertyId: inv.propertyId, propertyLabel: inv.propertyLabel, buildingId: "BLD-004", block: "Block A",
          permissions: inv.permissions, scope: `Scoped to ${inv.propertyLabel}`,
          startDate: iso(now()).slice(0, 10), endDate: null, verifiedBy: inv.invitedBy,
          status: inv.type === "domestic_worker" ? "under_review" : "active",
        },
        ...state.relationships,
      ];
    }
    audit({ actor: inv.invitedName, role: "Invitee", action: "Invitation response", target: id, previousValue: inv.status, newValue: status, comment: "", requestId: null, propertyId: inv.propertyId });
    commit();
  },

  setPolicyStatus(id: string, status: AccessPolicyRule["status"]) {
    const p = state.policies.find((x) => x.id === id);
    state.policies = state.policies.map((x) => (x.id === id ? { ...x, status } : x));
    audit({ actor: "Security Admin", role: "Security Admin", action: "Access policy change", target: id, previousValue: p?.status ?? "—", newValue: status, comment: "", requestId: null, propertyId: p?.propertyId ?? null });
    commit();
  },

  setPassStatus(id: string, status: TemporaryAccessPass["status"]) {
    const p = state.passes.find((x) => x.id === id);
    state.passes = state.passes.map((x) => (x.id === id ? { ...x, status } : x));
    audit({ actor: "Security Officer", role: "Security", action: "Access pass change", target: id, previousValue: p?.status ?? "—", newValue: status, comment: "", requestId: p?.requestId ?? null, propertyId: p?.propertyId ?? null });
    commit();
  },

  revokeRelationship(id: string) {
    const rel = state.relationships.find((r) => r.id === id);
    if (!rel) return;
    state.relationships = state.relationships.map((r) => (r.id === id ? { ...r, status: "revoked", endDate: iso(now()).slice(0, 10) } : r));
    state.policies = state.policies.map((p) => (p.personId === rel.personId && p.propertyId === rel.propertyId ? { ...p, status: "revoked" } : p));
    notify({ audienceRole: "Security Officer", title: "Access revoked", body: `${rel.personName} — ${rel.propertyLabel}`, requestId: null, tone: "danger" });
    audit({ actor: "Community Admin", role: "Community Admin", action: "Relationship revoked", target: id, previousValue: rel.status, newValue: "revoked", comment: "Access revoked immediately.", requestId: null, propertyId: rel.propertyId });
    commit();
  },

  markNotificationsRead(role?: string) {
    state.notifications = state.notifications.map((n) => (!role || n.audienceRole === role ? { ...n, read: true } : n));
    commit();
  },
};

export type { Store as OpsStoreState };
