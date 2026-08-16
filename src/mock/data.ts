import type {
  Announcement,
  AppNotification,
  AuditEntry,
  Block,
  Booking,
  Camera,
  CommitteeMember,
  CommunityEvent,
  Complaint,
  Contractor,
  Delivery,
  DirectoryEntry,
  DocumentRecord,
  Emergency,
  Expense,
  Facility,
  Family,
  FireAsset,
  Flat,
  Gate,
  Incident,
  InfrastructureAsset,
  Invoice,
  MapMarker,
  Meeting,
  Officer,
  ParkingSpace,
  Project,
  Property,
  Resident,
  Road,
  TransportRoute,
  Vehicle,
  Visitor,
  WorkOrder,
  Worker,
} from "@/types";

/** Deterministic pseudo-random generator so mock data is stable across renders/SSR. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const rnd = makeRng(20260815);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)]!;
const int = (min: number, max: number) => min + Math.floor(rnd() * (max - min + 1));
const pad = (n: number, len = 4) => String(n).padStart(len, "0");
const dayOffset = (d: number) => {
  const base = new Date(Date.UTC(2026, 7, 15));
  base.setUTCDate(base.getUTCDate() + d);
  return base.toISOString().slice(0, 10);
};
const clock = () => `${pad(int(0, 23), 2)}:${pad(int(0, 5) * 10, 2)}`;

const FIRST = [
  "Rafiqul", "Nusrat", "Tanvir", "Sabrina", "Mahmudul", "Farhana", "Imran", "Sadia", "Kamrul",
  "Rumana", "Shahriar", "Tasnim", "Arif", "Nabila", "Mizanur", "Sharmin", "Zahid", "Ishrat",
  "Mostafiz", "Anika", "Rakib", "Sumaiya", "Jubair", "Maliha", "Habibur", "Rehnuma", "Sohel",
  "Tahmina", "Nazmul", "Afsana",
] as const;
const LAST = [
  "Islam", "Rahman", "Chowdhury", "Hossain", "Akter", "Ahmed", "Karim", "Bhuiyan", "Sarker",
  "Mollah", "Siddique", "Talukder", "Mahmud", "Haque", "Kabir",
] as const;
const name = () => `${pick(FIRST)} ${pick(LAST)}`;

export const BLOCK_NAMES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"] as const;
const phone = () => `+8801${int(3, 9)}${pad(int(0, 99999999), 8)}`;
const nid = () => `${int(1980, 2004)}${pad(int(1, 9999999), 7)}`;
const plate = () => `Dhaka Metro-${pick(["Ga", "Kha", "Ha", "Cha", "Ja"])} ${int(11, 39)}-${pad(int(1000, 9999))}`;

export const blocks: Block[] = BLOCK_NAMES.map((b, i) => ({
  id: `BLK-${b}`,
  name: `Block ${b}`,
  roads: int(8, 22),
  properties: int(120, 460),
  residents: int(600, 2400),
  gate: `Gate ${((i % 5) + 1)}`,
  status: i > 10 ? "under_development" : "active",
}));

export const roads: Road[] = Array.from({ length: 60 }, (_, i) => {
  const block = pick(BLOCK_NAMES);
  return {
    id: `RD-${pad(i + 1, 3)}`,
    name: `Road ${int(1, 24)}, Block ${block}`,
    block: `Block ${block}`,
    lengthM: int(180, 1400),
    condition: pick(["good", "good", "fair", "poor"] as const),
    streetlights: int(6, 48),
    lastRepair: dayOffset(-int(20, 700)),
  };
});

export const properties: Property[] = Array.from({ length: 90 }, (_, i) => {
  const block = pick(BLOCK_NAMES);
  const house = String(int(1, 60));
  const road = String(int(1, 24));
  const occupancy = pick(["occupied", "occupied", "occupied", "partial", "vacant"] as const);
  return {
    id: `PRP-${pad(i + 1)}`,
    address: `House ${house}, Road ${road}, Block ${block}, Bashundhara R/A, Dhaka 1229`,
    block: `Block ${block}`,
    road: `Road ${road}`,
    house: `House ${house}`,
    type: pick(["apartment", "apartment", "apartment", "duplex", "commercial", "plot"] as const),
    flats: int(2, 14),
    owner: name(),
    tenant: occupancy === "vacant" ? null : name(),
    occupancy,
    dues: occupancy === "vacant" ? 0 : int(0, 18) * 2500,
  };
});

export const flats: Flat[] = properties.flatMap((p) =>
  Array.from({ length: Math.min(p.flats, 6) }, (_, j) => {
    const occ = pick(["occupied", "occupied", "occupied", "vacant"] as const);
    return {
      id: `${p.id}-F${j + 1}`,
      propertyId: p.id,
      number: `${j + 1}${pick(["A", "B", "C"] as const)}`,
      block: p.block,
      sizeSqft: int(900, 2600),
      bedrooms: int(2, 5),
      occupancy: occ,
      familyId: occ === "occupied" ? `FAM-${pad(int(1, 120), 3)}` : null,
      monthlyCharge: int(3, 12) * 1000,
    } satisfies Flat;
  }),
);

export const families: Family[] = Array.from({ length: 120 }, (_, i) => {
  const p = properties[i % properties.length]!;
  return {
    id: `FAM-${pad(i + 1, 3)}`,
    name: `${pick(LAST)} Family`,
    head: name(),
    propertyId: p.id,
    block: p.block,
    members: int(2, 8),
    workers: int(0, 3),
    phone: phone(),
    status: rnd() > 0.06 ? "active" : "inactive",
  };
});

export const residents: Resident[] = Array.from({ length: 140 }, (_, i) => {
  const fam = families[i % families.length]!;
  const prop = properties.find((p) => p.id === fam.propertyId)!;
  const status = rnd() > 0.85 ? (rnd() > 0.5 ? "pending" : "inactive") : "active";
  return {
    id: `RES-${pad(i + 1)}`,
    name: name(),
    phone: phone(),
    email: `resident${i + 1}@bashundhara-ra.test`,
    nid: nid(),
    nidVerified: status === "active" ? rnd() > 0.12 : false,
    type: pick(["owner", "tenant", "tenant", "family_member", "authorized", "temporary"] as const),
    propertyId: prop.id,
    address: prop.address,
    block: prop.block,
    familyId: fam.id,
    status,
    since: dayOffset(-int(30, 2500)),
    vehicles: int(0, 3),
    dues: rnd() > 0.6 ? int(1, 14) * 2500 : 0,
  } satisfies Resident;
});

const VISIT_PURPOSE = [
  "Family visit", "Parcel delivery", "AC servicing", "Grocery delivery", "Tuition",
  "Interior work", "Medical visit", "Ride pickup", "Water filter service",
] as const;

export const visitors: Visitor[] = Array.from({ length: 96 }, (_, i) => {
  const r = residents[int(0, residents.length - 1)]!;
  return {
    id: `VIS-${pad(i + 1)}`,
    name: name(),
    phone: phone(),
    category: pick([
      "guest", "guest", "delivery", "courier", "service", "driver", "family",
      "contractor", "domestic_worker", "emergency",
    ] as const),
    host: r.name,
    propertyId: r.propertyId,
    block: r.block,
    gate: `Gate ${int(1, 5)}`,
    vehicle: rnd() > 0.6 ? plate() : null,
    purpose: pick(VISIT_PURPOSE),
    date: dayOffset(-int(0, 6)),
    time: clock(),
    status: pick([
      "pending", "approved", "approved", "checked_in", "checked_out", "checked_out",
      "rejected", "expired",
    ] as const),
    passCode: `BRA-${pad(int(100000, 999999), 6)}`,
  } satisfies Visitor;
});

export const vehicles: Vehicle[] = Array.from({ length: 110 }, (_, i) => {
  const r = residents[i % residents.length]!;
  return {
    id: `VEH-${pad(i + 1)}`,
    registration: plate(),
    type: pick(["car", "car", "car", "microbus", "motorcycle", "truck", "ambulance"] as const),
    brand: pick(["Toyota", "Honda", "Nissan", "Mitsubishi", "Hyundai", "Suzuki", "Bajaj"] as const),
    model: pick(["Axio", "Premio", "Allion", "X-Corolla", "CR-V", "Pulsar", "Hiace"] as const),
    color: pick(["White", "Silver", "Black", "Blue", "Maroon"] as const),
    ownerName: r.name,
    propertyId: r.propertyId,
    block: r.block,
    category: pick(["resident", "resident", "resident", "visitor", "commercial", "service"] as const),
    sticker: `STK-${pad(int(1000, 9999))}`,
    status: pick(["active", "active", "active", "expired", "blocked"] as const),
    parkingSlot: rnd() > 0.35 ? `P-${pick(BLOCK_NAMES)}${pad(int(1, 220), 3)}` : null,
  } satisfies Vehicle;
});

export const parkingSpaces: ParkingSpace[] = Array.from({ length: 120 }, (_, i) => {
  const block = pick(BLOCK_NAMES);
  const status = pick([
    "occupied", "occupied", "occupied", "available", "available", "reserved", "maintenance",
  ] as const);
  return {
    id: `PS-${pad(i + 1)}`,
    code: `P-${block}${pad(i + 1, 3)}`,
    block: `Block ${block}`,
    zone: `Zone ${pick(["North", "South", "East", "West"] as const)}`,
    type: pick(["resident", "resident", "visitor", "commercial"] as const),
    status,
    allocatedTo: status === "occupied" ? name() : null,
    monthlyFee: int(1, 5) * 500,
  } satisfies ParkingSpace;
});

export const gates: Gate[] = Array.from({ length: 6 }, (_, i) => ({
  id: `GT-${i + 1}`,
  name: `Gate ${i + 1}`,
  block: `Block ${BLOCK_NAMES[i]}`,
  entriesToday: int(240, 1800),
  exitsToday: int(220, 1750),
  waiting: int(0, 12),
  officers: int(2, 6),
  cctv: rnd() > 0.15 ? "online" : "offline",
  status: pick(["open", "open", "open", "restricted"] as const),
}));

export const officers: Officer[] = Array.from({ length: 34 }, (_, i) => ({
  id: `OFC-${pad(i + 1, 3)}`,
  name: name(),
  badge: `BRA-S${pad(i + 1, 3)}`,
  gate: `Gate ${int(1, 6)}`,
  shift: pick(["morning", "evening", "night"] as const),
  zone: `Zone ${pick(["North", "South", "East", "West"] as const)}`,
  status: pick(["on_duty", "on_duty", "on_patrol", "off_duty", "leave"] as const),
  phone: phone(),
  patrolProgress: int(0, 100),
  lastCheckpoint: `CP-${pad(int(1, 48), 2)} · ${clock()}`,
}));

export const cameras: Camera[] = Array.from({ length: 48 }, (_, i) => {
  const block = pick(BLOCK_NAMES);
  return {
    id: `CAM-${pad(i + 1, 3)}`,
    name: `CAM-${pad(i + 1, 3)}`,
    location: `Road ${int(1, 24)}, Block ${block}`,
    block: `Block ${block}`,
    zone: pick(["gate", "road", "road", "parking", "building", "critical"] as const),
    status: pick(["online", "online", "online", "online", "degraded", "offline"] as const),
    lastActive: `${clock()} today`,
  } satisfies Camera;
});

const INCIDENT_TITLES = [
  "Unauthorized entry attempt", "Minor road accident", "Suspicious package reported",
  "Vehicle collision at gate", "Bike theft reported", "Fire alarm triggered",
  "Boundary wall damage", "Medical assistance requested", "Water pipe burst",
] as const;

export const incidents: Incident[] = Array.from({ length: 54 }, (_, i) => {
  const block = pick(BLOCK_NAMES);
  return {
    id: `INC-${pad(i + 1)}`,
    title: pick(INCIDENT_TITLES),
    category: pick([
      "security", "accident", "fire", "medical", "theft", "unauthorized_access",
      "vehicle", "property_damage", "infrastructure", "other",
    ] as const),
    location: `Road ${int(1, 24)}, Block ${block}`,
    block: `Block ${block}`,
    reportedBy: name(),
    assignedTo: officers[int(0, officers.length - 1)]!.name,
    severity: pick(["low", "medium", "medium", "high", "critical"] as const),
    status: pick(["open", "investigating", "resolved", "resolved", "closed"] as const),
    reportedAt: `${dayOffset(-int(0, 20))} ${clock()}`,
  } satisfies Incident;
});

export const emergencies: Emergency[] = Array.from({ length: 14 }, (_, i) => {
  const r = residents[int(0, residents.length - 1)]!;
  const status = i < 3 ? pick(["new", "acknowledged", "responding", "on_scene"] as const) : "resolved";
  return {
    id: `EMG-${pad(i + 1, 3)}`,
    type: pick(["medical", "fire", "security", "accident", "gas", "electrical", "water"] as const),
    resident: r.name,
    propertyId: r.propertyId,
    block: r.block,
    location: r.address,
    status,
    raisedAt: `${dayOffset(-int(0, 9))} ${clock()}`,
    responseMins: status === "resolved" ? int(3, 26) : null,
    team: pick(["Response Team A", "Response Team B", "Fire Unit 1", "Medical Unit 2"] as const),
  } satisfies Emergency;
});

const COMPLAINT_TITLES = [
  "No water supply since morning", "Streetlight not working", "Drain blocked near corner",
  "Garbage not collected", "Lift out of service", "Road pothole", "Illegal parking",
  "Loud construction at night", "Voltage fluctuation", "Sewage smell",
] as const;

export const complaints: Complaint[] = Array.from({ length: 84 }, (_, i) => {
  const r = residents[int(0, residents.length - 1)]!;
  return {
    id: `CMP-${pad(i + 1)}`,
    title: pick(COMPLAINT_TITLES),
    category: pick([
      "water", "electricity", "drainage", "road", "streetlight", "waste", "cleaning",
      "parking", "security", "construction", "noise", "other",
    ] as const),
    location: r.address,
    block: r.block,
    raisedBy: r.name,
    department: pick(["Utilities", "Civil Works", "Sanitation", "Security", "Electrical"] as const),
    assignedTo: name(),
    priority: pick(["low", "medium", "medium", "high", "critical"] as const),
    slaHours: pick([4, 8, 24, 48, 72] as const),
    status: pick(["new", "assigned", "in_progress", "waiting", "resolved", "closed"] as const),
    createdAt: `${dayOffset(-int(0, 30))} ${clock()}`,
  } satisfies Complaint;
});

export const workOrders: WorkOrder[] = complaints.slice(0, 46).map((c, i) => ({
  id: `WO-${pad(i + 1)}`,
  complaintId: c.id,
  title: c.title,
  team: pick(["Civil Team 1", "Electrical Team 2", "Plumbing Team 1", "Sanitation Team 3"] as const),
  technician: name(),
  location: c.location,
  block: c.block,
  estimatedCost: int(2, 60) * 1000,
  actualCost: rnd() > 0.4 ? int(2, 70) * 1000 : null,
  startDate: dayOffset(-int(0, 20)),
  completionDate: rnd() > 0.45 ? dayOffset(-int(0, 6)) : null,
  status: pick(["draft", "assigned", "in_progress", "inspection", "completed", "closed"] as const),
  priority: c.priority,
}));

export const infrastructure: InfrastructureAsset[] = Array.from({ length: 76 }, (_, i) => {
  const block = pick(BLOCK_NAMES);
  const kind = pick(["road", "drain", "streetlight", "water", "waste", "park", "fogging"] as const);
  return {
    id: `INF-${pad(i + 1)}`,
    name: `${kind.toUpperCase()} asset ${pad(i + 1, 3)}`,
    kind,
    block: `Block ${block}`,
    location: `Road ${int(1, 24)}, Block ${block}`,
    status: pick(["operational", "operational", "operational", "degraded", "down", "scheduled"] as const),
    lastService: dayOffset(-int(1, 120)),
    nextService: dayOffset(int(1, 90)),
    responsible: pick(["Utilities", "Civil Works", "Sanitation", "Horticulture"] as const),
  } satisfies InfrastructureAsset;
});

export const fireAssets: FireAsset[] = Array.from({ length: 40 }, (_, i) => {
  const block = pick(BLOCK_NAMES);
  return {
    id: `FIRE-${pad(i + 1, 3)}`,
    type: pick(["extinguisher", "extinguisher", "hydrant", "alarm", "sprinkler"] as const),
    location: `Road ${int(1, 24)}, Block ${block}`,
    block: `Block ${block}`,
    status: pick(["ok", "ok", "ok", "due", "faulty"] as const),
    lastInspection: dayOffset(-int(10, 300)),
    nextInspection: dayOffset(int(5, 180)),
    team: pick(["Fire Unit 1", "Fire Unit 2", "Safety Cell"] as const),
  } satisfies FireAsset;
});

export const contractors: Contractor[] = Array.from({ length: 28 }, (_, i) => ({
  id: `CON-${pad(i + 1, 3)}`,
  company: `${pick(["Meghna", "Padma", "Jamuna", "Turag", "Buriganga", "Shitalakshya"] as const)} ${pick(["Builders", "Engineering", "Services", "Constructions", "Technologies"] as const)} Ltd.`,
  contact: name(),
  phone: phone(),
  category: pick([
    "construction", "electrical", "plumbing", "cleaning", "security", "landscaping", "it", "maintenance",
  ] as const),
  registration: `BRA-C-${pad(1000 + i)}`,
  projects: int(1, 14),
  rating: Number((3 + rnd() * 2).toFixed(1)),
  paymentDue: int(0, 40) * 25000,
  status: pick(["active", "active", "active", "pending", "suspended"] as const),
}));

export const projects: Project[] = Array.from({ length: 32 }, (_, i) => {
  const block = pick(BLOCK_NAMES);
  return {
    id: `PRJ-${pad(i + 1, 3)}`,
    name: `${pick(["Residential Tower", "Road Resurfacing", "Drain Rebuild", "Substation Upgrade", "Park Renovation"] as const)} — Block ${block}`,
    block: `Block ${block}`,
    road: `Road ${int(1, 24)}`,
    contractor: contractors[int(0, contractors.length - 1)]!.company,
    type: pick(["new_construction", "renovation", "infrastructure", "utility"] as const),
    stage: pick([
      "application", "verification", "approved", "construction", "construction", "inspection", "completed",
    ] as const),
    progress: int(0, 100),
    budget: int(20, 900) * 100000,
    startDate: dayOffset(-int(30, 500)),
    endDate: dayOffset(int(30, 500)),
  } satisfies Project;
});

export const workers: Worker[] = Array.from({ length: 88 }, (_, i) => {
  const r = residents[i % residents.length]!;
  return {
    id: `WRK-${pad(i + 1)}`,
    name: name(),
    category: pick([
      "domestic_worker", "domestic_worker", "driver", "gardener", "electrician",
      "plumber", "technician", "cleaner", "construction",
    ] as const),
    employer: r.name,
    propertyId: r.propertyId,
    block: r.block,
    verified: rnd() > 0.2,
    validTill: dayOffset(int(-30, 400)),
    status: pick(["active", "active", "active", "expired", "blocked"] as const),
    phone: phone(),
  } satisfies Worker;
});

export const invoices: Invoice[] = Array.from({ length: 130 }, (_, i) => {
  const r = residents[i % residents.length]!;
  const amount = int(2, 40) * 1000;
  const status = pick(["paid", "paid", "paid", "due", "partial", "overdue"] as const);
  return {
    id: `INV-2026-${pad(i + 1)}`,
    resident: r.name,
    propertyId: r.propertyId,
    block: r.block,
    head: pick(["service_charge", "service_charge", "maintenance", "parking", "construction", "penalty", "utility"] as const),
    amount,
    paid: status === "paid" ? amount : status === "partial" ? Math.round(amount * 0.5) : 0,
    issueDate: dayOffset(-int(5, 120)),
    dueDate: dayOffset(-int(-30, 60)),
    paidDate: status === "paid" ? dayOffset(-int(0, 40)) : null,
    status,
    method: status === "paid" ? pick(["bkash", "nagad", "bank", "cash", "card"] as const) : null,
  } satisfies Invoice;
});

export const expenses: Expense[] = Array.from({ length: 46 }, (_, i) => ({
  id: `EXP-${pad(i + 1)}`,
  title: pick([
    "Street lighting materials", "Generator fuel", "Security uniform", "Drain cleaning contract",
    "Waste disposal fee", "Park landscaping", "CCTV maintenance", "Road patch repair",
  ] as const),
  category: pick(["Utilities", "Security", "Civil Works", "Sanitation", "Administration"] as const),
  vendor: contractors[int(0, contractors.length - 1)]!.company,
  amount: int(10, 800) * 1000,
  date: dayOffset(-int(0, 150)),
  approvedBy: name(),
  status: pick(["approved", "approved", "pending", "rejected"] as const),
}));

export const facilities: Facility[] = [
  { id: "FAC-001", name: "Bashundhara Community Hall", kind: "hall", block: "Block C", capacity: 400, hourlyFee: 8000, status: "available" },
  { id: "FAC-002", name: "Block D Playground", kind: "playground", block: "Block D", capacity: 200, hourlyFee: 1500, status: "booked" },
  { id: "FAC-003", name: "Indoor Sports Complex", kind: "sports", block: "Block G", capacity: 120, hourlyFee: 3500, status: "available" },
  { id: "FAC-004", name: "Society Meeting Room 1", kind: "meeting", block: "Block A", capacity: 30, hourlyFee: 1200, status: "available" },
  { id: "FAC-005", name: "Open Event Ground", kind: "event", block: "Block I", capacity: 1500, hourlyFee: 12000, status: "maintenance" },
  { id: "FAC-006", name: "Central Park Lawn", kind: "park", block: "Block E", capacity: 300, hourlyFee: 2500, status: "available" },
];

export const bookings: Booking[] = Array.from({ length: 38 }, (_, i) => {
  const r = residents[int(0, residents.length - 1)]!;
  const f = pick(facilities);
  return {
    id: `BKG-${pad(i + 1, 3)}`,
    facility: f.name,
    resident: r.name,
    propertyId: r.propertyId,
    date: dayOffset(int(-10, 30)),
    slot: pick(["09:00 – 12:00", "12:00 – 15:00", "15:00 – 18:00", "18:00 – 22:00"] as const),
    purpose: pick(["Wedding reception", "Birthday", "Society meeting", "Sports practice", "Milad", "Cultural show"] as const),
    guests: int(10, 300),
    amount: f.hourlyFee * int(2, 6),
    status: pick(["requested", "approved", "approved", "completed", "rejected", "cancelled"] as const),
  } satisfies Booking;
});

export const events: CommunityEvent[] = Array.from({ length: 12 }, (_, i) => ({
  id: `EVT-${pad(i + 1, 3)}`,
  title: pick([
    "Bashundhara Community Iftar", "Annual Sports Day", "Blood Donation Camp",
    "Independence Day Programme", "Winter Charity Drive", "Cleanliness Campaign",
    "Residents' General Meeting", "Children's Art Competition",
  ] as const),
  venue: pick(facilities).name,
  date: dayOffset(int(-20, 60)),
  time: `${int(9, 19)}:00`,
  organizer: "Bashundhara Welfare Society",
  registered: int(20, 480),
  capacity: int(500, 1500),
  status: pick(["upcoming", "open", "closed", "completed"] as const),
}));

export const announcements: Announcement[] = Array.from({ length: 24 }, (_, i) => ({
  id: `ANN-${pad(i + 1, 3)}`,
  title: pick([
    "Scheduled water supply interruption", "Mosquito fogging schedule", "Gate 3 temporary closure",
    "Service charge payment deadline", "Road repair notice", "Security drill announcement",
    "New visitor pass policy", "Waste collection timing change",
  ] as const),
  body: "Residents are requested to take note of the schedule and cooperate with the concerned team of Bashundhara Welfare Society.",
  audience: pick(["Entire Bashundhara R/A", "Block A", "Block C residents", "Road 12, Block D", "All owners"] as const),
  channel: pick([["push"], ["push", "sms"], ["push", "email", "sms"]] as ("push" | "email" | "sms")[][]),
  priority: pick(["info", "info", "info", "warning", "emergency"] as const),
  publishedBy: "Community Admin",
  publishedAt: `${dayOffset(-int(0, 40))} ${clock()}`,
  status: pick(["published", "published", "scheduled", "draft"] as const),
}));

export const notifications: AppNotification[] = Array.from({ length: 22 }, (_, i) => {
  const severity = pick(["info", "info", "info", "warning", "emergency"] as const);
  return {
    id: `NTF-${pad(i + 1, 3)}`,
    title: pick([
      "Visitor checked in at Gate 2", "Service charge invoice generated", "Complaint CMP-0042 resolved",
      "Fogging scheduled in your road", "SOS raised in Block C", "Facility booking approved",
      "Vehicle sticker expiring soon", "Water supply maintenance tonight",
    ] as const),
    body: "Tap to view the full detail in the related module.",
    category: pick([
      "security", "emergency", "payment", "maintenance", "visitor", "booking",
      "announcement", "construction", "utility", "community",
    ] as const),
    createdAt: `${dayOffset(-int(0, 5))} ${clock()}`,
    read: rnd() > 0.55,
    severity,
  } satisfies AppNotification;
});

export const deliveries: Delivery[] = Array.from({ length: 34 }, (_, i) => {
  const r = residents[int(0, residents.length - 1)]!;
  return {
    id: `DLV-${pad(i + 1, 3)}`,
    courier: pick(["Pathao", "Steadfast", "RedX", "Sundarban", "Daraz Express", "eCourier"] as const),
    personnel: name(),
    parcelCode: `PC-${pad(int(100000, 999999), 6)}`,
    recipient: r.name,
    propertyId: r.propertyId,
    gate: `Gate ${int(1, 5)}`,
    receivedAt: `${dayOffset(-int(0, 3))} ${clock()}`,
    status: pick(["at_gate", "notified", "delivered", "delivered", "returned"] as const),
  } satisfies Delivery;
});

export const transportRoutes: TransportRoute[] = Array.from({ length: 10 }, (_, i) => ({
  id: `TRP-${pad(i + 1, 3)}`,
  name: `${pick(["School Route", "Community Shuttle", "Staff Route"] as const)} ${i + 1}`,
  kind: pick(["school", "shuttle", "staff"] as const),
  vehicle: plate(),
  driver: name(),
  stops: int(5, 18),
  passengers: int(8, 45),
  departure: `${int(6, 19)}:${pick(["00", "15", "30", "45"] as const)}`,
  status: pick(["on_route", "idle", "maintenance"] as const),
}));

export const directory: DirectoryEntry[] = [
  { id: "DIR-001", name: "Evercare Hospital Dhaka", kind: "hospital", address: "Bashundhara R/A, Block E, Dhaka", phone: "+8801700000101", open24h: true },
  { id: "DIR-002", name: "Bashundhara Community Clinic", kind: "clinic", address: "Block C, Road 5, Bashundhara R/A", phone: "+8801700000102", open24h: false },
  { id: "DIR-003", name: "Lazz Pharma — Block B", kind: "pharmacy", address: "Block B, Road 2, Bashundhara R/A", phone: "+8801700000103", open24h: true },
  { id: "DIR-004", name: "Community Ambulance Unit 1", kind: "ambulance", address: "Gate 1 Control Post", phone: "+8801700000104", open24h: true },
  { id: "DIR-005", name: "Dr. Nusrat Jahan (General)", kind: "doctor", address: "Block D Medical Centre", phone: "+8801700000105", open24h: false },
  { id: "DIR-006", name: "Fire Service — Bashundhara Post", kind: "emergency_contact", address: "Main Gate area", phone: "199", open24h: true },
  { id: "DIR-007", name: "Security Control Room", kind: "emergency_contact", address: "Bashundhara Welfare Society Bhaban", phone: "+8801700000199", open24h: true },
];

export const meetings: Meeting[] = Array.from({ length: 16 }, (_, i) => ({
  id: `MTG-${pad(i + 1, 3)}`,
  title: pick([
    "Monthly Executive Committee Meeting", "Security Review Session", "Budget Approval Meeting",
    "Infrastructure Planning Meeting", "Emergency Preparedness Review",
  ] as const),
  date: dayOffset(int(-120, 30)),
  committee: pick(["Executive Committee", "Security Sub-committee", "Finance Sub-committee", "Works Committee"] as const),
  participants: int(6, 28),
  decisions: int(1, 9),
  actionItems: int(1, 12),
  status: pick(["scheduled", "held", "minuted"] as const),
}));

export const committee: CommitteeMember[] = Array.from({ length: 18 }, (_, i) => ({
  id: `CM-${pad(i + 1, 3)}`,
  name: name(),
  designation: pick([
    "President", "General Secretary", "Treasurer", "Joint Secretary", "Executive Member",
    "Security Secretary", "Works Secretary",
  ] as const),
  department: pick(["Governance", "Finance", "Security", "Works", "Community Services"] as const),
  block: `Block ${pick(BLOCK_NAMES)}`,
  phone: phone(),
  termEnds: dayOffset(int(60, 700)),
  status: rnd() > 0.1 ? "active" : "inactive",
}));

export const documents: DocumentRecord[] = Array.from({ length: 64 }, (_, i) => ({
  id: `DOC-${pad(i + 1)}`,
  name: pick([
    "NID scan", "Deed of ownership", "Lease agreement", "Construction permit",
    "Contractor trade licence", "Vehicle registration", "Worker verification form", "Inspection report",
  ] as const),
  category: pick([
    "nid", "property", "ownership", "lease", "permit", "contractor", "vehicle", "worker", "inspection",
  ] as const),
  owner: name(),
  uploadedAt: dayOffset(-int(0, 400)),
  expiry: rnd() > 0.4 ? dayOffset(int(-40, 700)) : null,
  verification: pick(["verified", "verified", "pending", "rejected"] as const),
  sizeKb: int(120, 8400),
}));

export const auditLog: AuditEntry[] = Array.from({ length: 60 }, (_, i) => ({
  id: `AUD-${pad(i + 1)}`,
  user: name(),
  role: pick([
    "super_admin", "community_admin", "security_admin", "security_officer",
    "finance_manager", "maintenance_manager", "property_manager",
  ] as const),
  action: pick([
    "Approved visitor request", "Allowed vehicle entry", "Updated invoice", "Created work order",
    "Suspended contractor", "Published announcement", "Resolved incident", "Verified resident NID",
  ] as const),
  module: pick(["Visitors", "Gates", "Finance", "Maintenance", "Contractors", "Communication", "Security", "Residents"] as const),
  target: `#${pad(int(1, 9999))}`,
  ip: `103.${int(1, 250)}.${int(1, 250)}.${int(2, 250)}`,
  timestamp: `${dayOffset(-int(0, 14))} ${clock()}`,
}));

export const mapMarkers: MapMarker[] = [
  ...blocks.slice(0, 10).map((b, i) => ({
    id: b.id,
    label: b.name,
    layer: "blocks" as const,
    x: 12 + (i % 5) * 19,
    y: 18 + Math.floor(i / 5) * 34,
    detail: `${b.properties} properties · ${b.residents} residents`,
    status: b.status,
  })),
  ...gates.map((g, i) => ({
    id: g.id,
    label: g.name,
    layer: "gates" as const,
    x: 6 + i * 17,
    y: i % 2 === 0 ? 6 : 92,
    detail: `${g.entriesToday} entries · ${g.officers} officers`,
    status: g.status,
  })),
  ...cameras.slice(0, 12).map((c, i) => ({
    id: c.id,
    label: c.name,
    layer: "cctv" as const,
    x: 10 + (i % 6) * 15,
    y: 30 + Math.floor(i / 6) * 28,
    detail: c.location,
    status: c.status,
  })),
  ...incidents.slice(0, 6).map((inc, i) => ({
    id: inc.id,
    label: inc.title,
    layer: "incidents" as const,
    x: 20 + i * 12,
    y: 44 + (i % 3) * 14,
    detail: `${inc.location} · ${inc.severity}`,
    status: inc.status,
  })),
  ...emergencies.slice(0, 3).map((e, i) => ({
    id: e.id,
    label: `${e.type} emergency`,
    layer: "emergency" as const,
    x: 30 + i * 20,
    y: 60 + i * 8,
    detail: `${e.block} · ${e.status}`,
    status: e.status,
  })),
  ...parkingSpaces.slice(0, 6).map((p, i) => ({
    id: p.id,
    label: p.code,
    layer: "parking" as const,
    x: 16 + i * 13,
    y: 76,
    detail: `${p.zone} · ${p.type}`,
    status: p.status,
  })),
  ...infrastructure.slice(0, 6).map((a, i) => ({
    id: a.id,
    label: a.name,
    layer: "maintenance" as const,
    x: 24 + i * 11,
    y: 24,
    detail: `${a.location} · ${a.status}`,
    status: a.status,
  })),
];

export const visitorTrend = Array.from({ length: 14 }, (_, i) => ({
  day: dayOffset(i - 13).slice(5),
  visitors: int(240, 720),
  deliveries: int(80, 260),
}));

export const collectionTrend = [
  "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
].map((m) => ({ month: m, collected: int(40, 92) * 100000, outstanding: int(6, 30) * 100000 }));

export const complaintsByCategory = [
  "water", "electricity", "drainage", "road", "streetlight", "waste", "security",
].map((c) => ({ category: c, count: complaints.filter((x) => x.category === c).length + int(2, 14) }));

export const incidentTrend = Array.from({ length: 12 }, (_, i) => ({
  month: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"][i]!,
  incidents: int(4, 28),
  resolved: int(3, 26),
}));

export const resolutionTrend = Array.from({ length: 12 }, (_, i) => ({
  month: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"][i]!,
  rate: int(62, 96),
}));