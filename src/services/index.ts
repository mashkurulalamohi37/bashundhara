import * as db from "@/mock/data";
import { createResourceService } from "./resourceService";
import { request } from "./api";
import type {
  Announcement, AppNotification, AuditEntry, Block, Booking, Camera, CommitteeMember,
  CommunityEvent, Complaint, Contractor, Delivery, DirectoryEntry, DocumentRecord,
  Emergency, Expense, Facility, Family, FireAsset, Flat, Gate, Incident,
  InfrastructureAsset, Invoice, Meeting, Officer, ParkingSpace, Project, Property,
  Resident, Road, TransportRoute, Vehicle, Visitor, WorkOrder, Worker,
} from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
const res = <T extends { id: string }>(path: string, source: () => T[]) =>
  createResourceService<any>(path, source as any) as import("./resourceService").ResourceService<T>;

export const blockService = res<Block>("/blocks", () => db.blocks);
export const roadService = res<Road>("/roads", () => db.roads);
export const propertyService = res<Property>("/properties", () => db.properties);
export const flatService = res<Flat>("/flats", () => db.flats);
export const residentService = res<Resident>("/residents", () => db.residents);
export const familyService = res<Family>("/families", () => db.families);
export const visitorService = res<Visitor>("/visitors", () => db.visitors);
export const vehicleService = res<Vehicle>("/vehicles", () => db.vehicles);
export const parkingService = res<ParkingSpace>("/parking-spaces", () => db.parkingSpaces);
export const gateService = res<Gate>("/gates", () => db.gates);
export const officerService = res<Officer>("/security-officers", () => db.officers);
export const cameraService = res<Camera>("/cameras", () => db.cameras);
export const incidentService = res<Incident>("/incidents", () => db.incidents);
export const emergencyService = res<Emergency>("/emergencies", () => db.emergencies);
export const complaintService = res<Complaint>("/complaints", () => db.complaints);
export const workOrderService = res<WorkOrder>("/work-orders", () => db.workOrders);
export const infrastructureService = res<InfrastructureAsset>("/infrastructure", () => db.infrastructure);
export const fireSafetyService = res<FireAsset>("/fire-assets", () => db.fireAssets);
export const projectService = res<Project>("/construction-projects", () => db.projects);
export const contractorService = res<Contractor>("/contractors", () => db.contractors);
export const workerService = res<Worker>("/workers", () => db.workers);
export const invoiceService = res<Invoice>("/invoices", () => db.invoices);
export const expenseService = res<Expense>("/expenses", () => db.expenses);
export const facilityService = res<Facility>("/facilities", () => db.facilities);
export const bookingService = res<Booking>("/bookings", () => db.bookings);
export const eventService = res<CommunityEvent>("/events", () => db.events);
export const announcementService = res<Announcement>("/announcements", () => db.announcements);
export const notificationService = res<AppNotification>("/notifications", () => db.notifications);
export const deliveryService = res<Delivery>("/deliveries", () => db.deliveries);
export const transportService = res<TransportRoute>("/transport-routes", () => db.transportRoutes);
export const directoryService = res<DirectoryEntry>("/health-directory", () => db.directory);
export const meetingService = res<Meeting>("/meetings", () => db.meetings);
export const committeeService = res<CommitteeMember>("/committee-members", () => db.committee);
export const documentService = res<DocumentRecord>("/documents", () => db.documents);
export const auditService = res<AuditEntry>("/audit-logs", () => db.auditLog);

/* ---------- Dashboard / analytics / reporting endpoints ---------- */

export interface CommandCenterSummary {
  residents: number;
  families: number;
  properties: number;
  occupied: number;
  vacant: number;
  visitorsToday: number;
  vehicleEntriesToday: number;
  openComplaints: number;
  activeEmergencies: number;
  pendingApprovals: number;
  officersOnDuty: number;
  camerasOnline: number;
  camerasTotal: number;
  gateEntries: number;
  gateExits: number;
  activeIncidents: number;
  collectionThisMonth: number;
  outstanding: number;
}

export const dashboardService = {
  summary: (): Promise<CommandCenterSummary> =>
    request("/dashboard/summary", {
      residents: 18420,
      families: 4860,
      properties: db.properties.length * 62,
      occupied: Math.round(db.properties.length * 62 * 0.86),
      vacant: Math.round(db.properties.length * 62 * 0.14),
      visitorsToday: db.visitors.filter((v) => v.date === db.visitorTrend.at(-1)?.day).length + 612,
      vehicleEntriesToday: db.gates.reduce((s, g) => s + g.entriesToday, 0),
      openComplaints: db.complaints.filter((c) => !["resolved", "closed"].includes(c.status)).length,
      activeEmergencies: db.emergencies.filter((e) => e.status !== "resolved").length,
      pendingApprovals:
        db.visitors.filter((v) => v.status === "pending").length +
        db.bookings.filter((b) => b.status === "requested").length,
      officersOnDuty: db.officers.filter((o) => o.status !== "off_duty" && o.status !== "leave").length,
      camerasOnline: db.cameras.filter((c) => c.status === "online").length,
      camerasTotal: db.cameras.length,
      gateEntries: db.gates.reduce((s, g) => s + g.entriesToday, 0),
      gateExits: db.gates.reduce((s, g) => s + g.exitsToday, 0),
      activeIncidents: db.incidents.filter((i) => i.status === "open" || i.status === "investigating").length,
      collectionThisMonth: db.collectionTrend.at(-1)?.collected ?? 0,
      outstanding: db.invoices.reduce((s, i) => s + (i.amount - i.paid), 0),
    }),
  charts: () =>
    request("/dashboard/charts", {
      visitorTrend: db.visitorTrend,
      collectionTrend: db.collectionTrend,
      complaintsByCategory: db.complaintsByCategory,
      incidentTrend: db.incidentTrend,
      resolutionTrend: db.resolutionTrend,
    }),
  map: () => request("/dashboard/map", db.mapMarkers),
  infrastructureStatus: () =>
    request("/dashboard/infrastructure", [
      { name: "Water supply", status: "operational", detail: "12 of 12 pumps running" },
      { name: "Electricity", status: "degraded", detail: "Block G feeder on generator" },
      { name: "Drainage", status: "operational", detail: "No waterlogging reported" },
      { name: "Streetlights", status: "degraded", detail: "37 lights reported faulty" },
      { name: "Waste collection", status: "operational", detail: "94% zones covered today" },
      { name: "Maintenance", status: "scheduled", detail: "18 work orders in progress" },
    ] as { name: string; status: "operational" | "degraded" | "down" | "scheduled"; detail: string }[]),
};

export const reportService = {
  catalogue: () =>
    request("/reports", [
      { id: "RPT-RES", group: "Resident", name: "Residents by block", description: "Distribution of verified residents across all blocks." },
      { id: "RPT-OCC", group: "Resident", name: "Occupancy report", description: "Occupied vs vacant flats with owner/tenant split." },
      { id: "RPT-REG", group: "Resident", name: "New registrations", description: "Resident and family onboarding over time." },
      { id: "RPT-VIS", group: "Security", name: "Visitor report", description: "Visitor volume, category and approval outcome." },
      { id: "RPT-GAT", group: "Security", name: "Gate activity", description: "Entries, exits and denial rate per gate." },
      { id: "RPT-INC", group: "Security", name: "Incident report", description: "Incidents by category, severity and response time." },
      { id: "RPT-PAT", group: "Security", name: "Patrol activity", description: "Checkpoint coverage and shift compliance." },
      { id: "RPT-CMP", group: "Maintenance", name: "Complaint report", description: "Volume, category and ageing of complaints." },
      { id: "RPT-SLA", group: "Maintenance", name: "SLA performance", description: "Resolution time against SLA by department." },
      { id: "RPT-COL", group: "Finance", name: "Collection report", description: "Service charge collection vs target." },
      { id: "RPT-OUT", group: "Finance", name: "Outstanding dues", description: "Ageing of dues by block and property." },
      { id: "RPT-EXP", group: "Finance", name: "Expense report", description: "Expenditure by category and vendor." },
      { id: "RPT-INF", group: "Infrastructure", name: "Infrastructure health", description: "Roads, drains, water, waste and streetlights." },
    ]),
  /** Placeholder export hook — wire to POST /reports/:id/export when the backend is ready. */
  export: (reportId: string, format: "pdf" | "excel" | "csv") =>
    request(`/reports/${reportId}/export?format=${format}`, {
      reportId,
      format,
      queued: true,
    }, 600),
};

export const searchService = {
  global: (term: string) => {
    const q = term.trim().toLowerCase();
    if (!q) return request("/search", [] as GlobalSearchHit[]);
    const hit = (category: string, id: string, label: string, meta: string, to: string) =>
      ({ category, id, label, meta, to }) as GlobalSearchHit;
    const hits: GlobalSearchHit[] = [
      ...db.residents.filter((r) => `${r.name} ${r.id} ${r.phone}`.toLowerCase().includes(q))
        .slice(0, 5).map((r) => hit("Resident", r.id, r.name, `${r.id} · ${r.block}`, "/residents")),
      ...db.properties.filter((p) => `${p.id} ${p.address}`.toLowerCase().includes(q))
        .slice(0, 5).map((p) => hit("Property", p.id, p.id, p.address, "/properties")),
      ...db.vehicles.filter((v) => `${v.registration} ${v.ownerName}`.toLowerCase().includes(q))
        .slice(0, 5).map((v) => hit("Vehicle", v.id, v.registration, v.ownerName, "/vehicles")),
      ...db.visitors.filter((v) => `${v.name} ${v.passCode}`.toLowerCase().includes(q))
        .slice(0, 4).map((v) => hit("Visitor", v.id, v.name, `${v.passCode} · ${v.status}`, "/visitors")),
      ...db.complaints.filter((c) => `${c.id} ${c.title}`.toLowerCase().includes(q))
        .slice(0, 4).map((c) => hit("Complaint", c.id, c.title, `${c.id} · ${c.status}`, "/maintenance")),
      ...db.invoices.filter((i) => `${i.id} ${i.resident}`.toLowerCase().includes(q))
        .slice(0, 4).map((i) => hit("Invoice", i.id, i.id, `${i.resident} · ৳${i.amount}`, "/finance/invoices")),
      ...db.contractors.filter((c) => c.company.toLowerCase().includes(q))
        .slice(0, 3).map((c) => hit("Contractor", c.id, c.company, c.category, "/contractors")),
    ];
    return request("/search", hits, 120);
  },
};

export interface GlobalSearchHit {
  category: string;
  id: string;
  label: string;
  meta: string;
  to: string;
}
export * from "./community";
export * from "./accounting";
