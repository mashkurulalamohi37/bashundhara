/**
 * Extended mock dataset for the Digital Community OS layers:
 * buildings, ownership, tenancy, households, domestic workers,
 * building ERP finance and the verified service marketplace.
 */
import { BLOCK_NAMES, flats as baseFlats } from "./data";
import type {
  AccessEvent, AccessPass, AuthorizedResident, Budget, Building, BuildingAsset,
  BuildingExpense, BuildingIncome, BuildingStaff, CaretakerTask, CommunityPost,
  DomesticWorker, DomesticWorkerEmployment, FamilyMember, Floor, Household, Lease,
  NearbyPlace, Owner, Poll, PurchaseRequest, ServiceBid,
  ServiceCategory, ServiceDispute, ServiceHandover, ServiceItem, ServiceOrder,
  ServiceProvider, ServiceRequest, ServiceReview, Tenant, UtilityBill, Vendor,
} from "@/types";

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const rnd = makeRng(20260816);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)]!;
const int = (min: number, max: number) => min + Math.floor(rnd() * (max - min + 1));
const pad = (n: number, len = 4) => String(n).padStart(len, "0");
const money = (min: number, max: number, step = 500) => int(min / step, max / step) * step;
const day = (offset: number) => {
  const base = new Date(Date.UTC(2026, 7, 15));
  base.setUTCDate(base.getUTCDate() + offset);
  return base.toISOString().slice(0, 10);
};
const clock = (h: number, m = 0) => `${pad(h, 2)}:${pad(m, 2)}`;

const FIRST = [
  "Rafiqul", "Nusrat", "Tanvir", "Sabrina", "Mahmudul", "Farhana", "Imran", "Sadia", "Kamrul",
  "Rumana", "Shahriar", "Tasnim", "Arif", "Nabila", "Mizanur", "Sharmin", "Zahid", "Ishrat",
  "Mostafiz", "Anika", "Rakib", "Sumaiya", "Jubair", "Maliha", "Habibur", "Rehnuma", "Sohel",
  "Tahmina", "Nazmul", "Afsana", "Rahima", "Jharna", "Bilkis", "Momena", "Shafiq", "Jamal",
] as const;
const LAST = [
  "Islam", "Rahman", "Chowdhury", "Hossain", "Akter", "Ahmed", "Karim", "Bhuiyan", "Sarker",
  "Mollah", "Siddique", "Talukder", "Mahmud", "Haque", "Kabir",
] as const;
const BN_FIRST = ["রফিকুল", "নুসরাত", "তানভীর", "সাবরিনা", "মাহমুদুল", "ফারহানা", "ইমরান", "সাদিয়া"] as const;
const BN_LAST = ["ইসলাম", "রহমান", "চৌধুরী", "হোসেন", "আক্তার", "আহমেদ", "করিম"] as const;

const name = () => `${pick(FIRST)} ${pick(LAST)}`;
const nameBn = () => `${pick(BN_FIRST)} ${pick(BN_LAST)}`;
const phone = () => `+8801${int(3, 9)}${pad(int(0, 99999999), 8)}`;
const nid = () => `${int(1980, 2004)}${pad(int(1, 9999999), 7)}`;
const blockName = () => `Block ${pick(BLOCK_NAMES)}`;
const gateName = () => `Gate ${int(1, 6)}`;

/* ---------------------------------- Buildings --------------------------------- */

export const BUILDING_OWNER_NAMES = [
  "Mahbub Alam", "Shirin Sultana", "Golam Rabbani", "Ayesha Siddiqua", "Nurul Amin",
] as const;

export const buildings: Building[] = Array.from({ length: 24 }, (_, i) => {
  const block = pick(BLOCK_NAMES);
  const house = int(1, 68);
  const road = int(1, 24);
  const floors = int(5, 12);
  const flatsCount = floors * int(2, 4);
  const occupied = Math.round(flatsCount * (0.7 + rnd() * 0.28));
  const income = money(450000, 1450000, 5000);
  return {
    id: `BLD-${pad(i + 1, 3)}`,
    name: `House ${house}`,
    houseNo: `House ${house}`,
    road: `Road ${road}`,
    block: `Block ${block}`,
    address: `House ${house}, Road ${road}, Block ${block}, Bashundhara R/A, Dhaka 1229`,
    ownerId: `OWN-B-${pad((i % 5) + 1, 3)}`,
    ownerName: BUILDING_OWNER_NAMES[i % 5]!,
    managerName: name(),
    caretakerName: name(),
    floors,
    flats: flatsCount,
    occupiedFlats: occupied,
    type: i % 9 === 0 ? "mixed" : i % 13 === 0 ? "commercial" : "residential",
    yearBuilt: int(2004, 2023),
    lift: int(1, 3),
    generator: rnd() > 0.15,
    parkingSlots: int(6, 30),
    monthlyIncome: income,
    monthlyExpense: Math.round(income * (0.3 + rnd() * 0.2)),
    status: i % 11 === 0 ? "renovation" : "active",
  };
});

export const floors: Floor[] = buildings.flatMap((b) =>
  Array.from({ length: Math.min(b.floors, 8) }, (_, l) => ({
    id: `${b.id}-F${pad(l + 1, 2)}`,
    buildingId: b.id,
    buildingName: `${b.name}, ${b.road}`,
    level: l + 1,
    flats: Math.max(1, Math.round(b.flats / b.floors)),
    occupied: int(1, Math.max(1, Math.round(b.flats / b.floors))),
    commonArea: pick(["Lobby & lift landing", "Corridor + utility shaft", "Landing & stair", "Roof access landing"]),
    status: rnd() > 0.92 ? "maintenance" : "active",
  })),
);

/** Flat ids reused from the core dataset so both layers stay linked. */
const flatIds = baseFlats.slice(0, 220).map((f) => f.id);
const flatOf = (i: number) => flatIds[i % flatIds.length]!;
const buildingOf = (i: number) => buildings[i % buildings.length]!;

/* --------------------------------- Ownership ---------------------------------- */

export const owners: Owner[] = Array.from({ length: 150 }, (_, i) => {
  const shared = i % 7 === 0;
  const b = buildingOf(i);
  const occupancy = pick(["living_in", "renting_out", "renting_out", "partial", "vacant"] as const);
  return {
    id: `OWN-${pad(i + 1, 4)}`,
    name: name(),
    nameBn: nameBn(),
    phone: phone(),
    email: `owner${i + 1}@mail.test`,
    nid: nid(),
    permanentAddress: `${int(1, 60)}/${pick(["A", "B", "C"])}, ${pick(["Gulshan", "Banani", "Uttara", "Mirpur", "Cumilla", "Sylhet"])}, Bangladesh`,
    emergencyContact: phone(),
    flatId: flatOf(i),
    buildingId: b.id,
    block: b.block,
    ownershipPct: shared ? pick([60, 50, 40] as const) : 100,
    ownershipStart: day(-int(400, 5200)),
    ownershipEnd: null,
    occupancy,
    otherProperties: int(0, 3),
    documents: int(1, 6),
    contactPreference: pick(["sms", "app", "email", "phone"] as const),
    status: "active",
  };
});

export const tenants: Tenant[] = Array.from({ length: 120 }, (_, i) => {
  const owner = owners[(i * 3) % owners.length]!;
  const rent = money(18000, 95000, 1000);
  const start = -int(30, 700);
  return {
    id: `TNT-${pad(i + 1, 4)}`,
    name: name(),
    nameBn: nameBn(),
    phone: phone(),
    email: `tenant${i + 1}@mail.test`,
    nid: nid(),
    emergencyContact: phone(),
    occupation: pick(["Banker", "Engineer", "Doctor", "Teacher", "Business", "Govt. Officer", "IT Consultant", "Pilot"]),
    organization: pick(["BRAC Bank", "Grameenphone", "Square Hospital", "NSU", "Robi Axiata", "Beximco", "bKash", "Unilever BD"]),
    flatId: owner.flatId,
    buildingId: owner.buildingId,
    block: owner.block,
    ownerId: owner.id,
    ownerName: owner.name,
    leaseId: `LSE-${pad(i + 1, 4)}`,
    leaseStart: day(start),
    leaseEnd: day(start + 365),
    monthlyRent: rent,
    securityDeposit: rent * 2,
    advance: rent,
    rentDueDay: pick([1, 5, 7, 10] as const),
    paymentStatus: pick(["paid", "paid", "due", "overdue", "partial"] as const),
    documents: int(1, 5),
    status: pick(["active", "active", "active", "notice_period", "moved_out"] as const),
  };
});

export const leases: Lease[] = tenants.map((t, i) => ({
  id: t.leaseId,
  flatId: t.flatId,
  buildingId: t.buildingId,
  tenantId: t.id,
  tenantName: t.name,
  ownerId: t.ownerId,
  ownerName: t.ownerName,
  startDate: t.leaseStart,
  endDate: t.leaseEnd,
  monthlyRent: t.monthlyRent,
  securityDeposit: t.securityDeposit,
  advance: t.advance,
  escalationPct: pick([0, 5, 8, 10] as const),
  noticePeriodDays: pick([30, 60, 90] as const),
  status:
    t.status === "moved_out" ? "terminated" : i % 9 === 0 ? "expiring" : i % 14 === 0 ? "renewed" : "active",
}));

/* --------------------------- Households and residents ------------------------- */

export const households: Household[] = Array.from({ length: 180 }, (_, i) => {
  const ownerHh = i % 3 === 0;
  const src = ownerHh ? owners[i % owners.length]! : tenants[i % tenants.length]!;
  return {
    id: `HH-${pad(i + 1, 4)}`,
    flatId: src.flatId,
    buildingId: src.buildingId,
    block: src.block,
    type: ownerHh ? "owner_household" : "tenant_household",
    headName: src.name,
    headRelationLabel: ownerHh ? "Owner occupant" : "Tenant head of household",
    members: int(1, 7),
    domesticWorkers: int(0, 3),
    vehicles: int(0, 3),
    moveIn: day(-int(60, 2200)),
    moveOut: i % 17 === 0 ? day(-int(1, 50)) : null,
    contactPhone: src.phone,
    status: i % 17 === 0 ? "historical" : "active",
  };
});

const RELATIONS = ["self", "spouse", "child", "child", "parent", "sibling", "relative"] as const;

export const familyMembers: FamilyMember[] = households.flatMap((hh, hi) =>
  Array.from({ length: Math.min(hh.members, 5) }, (_, m) => {
    const relationship = m === 0 ? "self" : pick(RELATIONS.slice(1));
    const child = relationship === "child";
    return {
      id: `FM-${pad(hi * 10 + m + 1, 5)}`,
      householdId: hh.id,
      flatId: hh.flatId,
      name: m === 0 ? hh.headName : name(),
      nameBn: nameBn(),
      gender: pick(["male", "female"] as const),
      dob: child ? day(-int(1200, 6500)) : day(-int(8000, 22000)),
      nid: child ? `BR-${pad(int(1, 999999), 6)}` : nid(),
      relationship,
      phone: child ? "" : phone(),
      email: child ? "" : `member${hi}${m}@mail.test`,
      emergencyContact: hh.contactPhone,
      occupation: child ? "Student" : pick(["Homemaker", "Engineer", "Banker", "Teacher", "Doctor", "Business", "Retired"]),
      organization: child ? pick(["Playpen School", "Sunnydale", "Bashundhara Adarsha Vidyaniketan", "NSU"]) : pick(["City Bank", "Square", "BRAC", "Self-employed", "—"]),
      moveIn: hh.moveIn,
      moveOut: hh.status === "historical" ? hh.moveOut : null,
      accessLevel: child ? "restricted" : m === 0 ? "full" : "standard",
      status: hh.status === "historical" ? "moved_out" : "active",
    };
  }),
);

export const authorizedResidents: AuthorizedResident[] = Array.from({ length: 64 }, (_, i) => {
  const hh = households[i % households.length]!;
  const from = -int(10, 200);
  const to = from + int(30, 400);
  return {
    id: `AUR-${pad(i + 1, 4)}`,
    name: name(),
    flatId: hh.flatId,
    buildingId: hh.buildingId,
    block: hh.block,
    category: pick(["relative", "long_term_guest", "caregiver", "company_employee", "temporary"] as const),
    sponsorName: hh.headName,
    sponsorType: hh.type === "owner_household" ? "owner" : "tenant",
    phone: phone(),
    nid: nid(),
    authorizedFrom: day(from),
    authorizedTo: day(to),
    accessLevel: pick(["standard", "standard", "restricted", "full"] as const),
    status: to < 0 ? "expired" : to < 30 ? "expiring" : i % 19 === 0 ? "revoked" : "active",
  };
});

/* ------------------------------ Domestic workers ------------------------------ */

const WORKER_TYPES = ["maid", "cook", "driver", "babysitter", "caregiver", "gardener", "cleaner", "personal_assistant"] as const;

export const domesticWorkers: DomesticWorker[] = Array.from({ length: 110 }, (_, i) => {
  const hh = households[(i * 2) % households.length]!;
  const verified = rnd() > 0.2;
  return {
    id: `DWK-${pad(i + 1, 4)}`,
    name: name(),
    nameBn: nameBn(),
    gender: pick(["female", "female", "male"] as const),
    dob: day(-int(6500, 20000)),
    phone: phone(),
    nid: nid(),
    permanentAddress: `${pick(["Mymensingh", "Barishal", "Rangpur", "Jamalpur", "Khulna", "Faridpur"])}, Bangladesh`,
    emergencyContact: phone(),
    workerType: pick(WORKER_TYPES),
    employerName: hh.headName,
    flatId: hh.flatId,
    buildingId: hh.buildingId,
    block: hh.block,
    startDate: day(-int(30, 1500)),
    endDate: null,
    passCode: `DW-${pad(int(1000, 9999))}`,
    verification: verified ? "verified" : "pending",
    policeVerified: verified && rnd() > 0.3,
    accessWindow: pick(["06:00–10:00", "07:00–12:00", "08:00–18:00", "14:00–20:00", "06:30–21:00"]),
    documents: int(1, 4),
    status: verified
      ? pick(["active", "active", "verified", "suspended"] as const)
      : pick(["pending_verification", "pending_verification", "expired"] as const),
  };
});

export const domesticWorkerEmployments: DomesticWorkerEmployment[] = domesticWorkers.flatMap((w, i) => {
  const past = i % 3 === 0;
  const rows: DomesticWorkerEmployment[] = [
    {
      id: `DWE-${pad(i * 2 + 1, 5)}`,
      workerId: w.id,
      workerName: w.name,
      flatId: w.flatId,
      buildingId: w.buildingId,
      employerName: w.employerName,
      workerType: w.workerType,
      startDate: w.startDate,
      endDate: null,
      monthlySalary: money(4000, 25000, 500),
      status: "current",
    },
  ];
  if (past) {
    const hh = households[(i * 5) % households.length]!;
    rows.push({
      id: `DWE-${pad(i * 2 + 2, 5)}`,
      workerId: w.id,
      workerName: w.name,
      flatId: hh.flatId,
      buildingId: hh.buildingId,
      employerName: hh.headName,
      workerType: w.workerType,
      startDate: day(-int(1600, 2600)),
      endDate: day(-int(200, 1500)),
      monthlySalary: money(3500, 18000, 500),
      status: "ended",
    });
  }
  return rows;
});

/* ----------------------------- Building operations ---------------------------- */

const STAFF_ROLES = ["security", "caretaker", "cleaner", "technician", "gardener", "electrician", "plumber", "driver"] as const;

export const buildingStaff: BuildingStaff[] = Array.from({ length: 96 }, (_, i) => {
  const b = buildingOf(i);
  return {
    id: `BST-${pad(i + 1, 4)}`,
    name: name(),
    role: pick(STAFF_ROLES),
    buildingId: b.id,
    phone: phone(),
    nid: nid(),
    shift: pick(["morning", "evening", "night", "general"] as const),
    joinDate: day(-int(60, 2400)),
    monthlySalary: money(9000, 32000, 500),
    advance: rnd() > 0.7 ? money(2000, 12000, 500) : 0,
    overtimeHours: int(0, 26),
    attendancePct: int(78, 100),
    leaveBalance: int(0, 18),
    status: pick(["active", "active", "active", "on_leave", "suspended", "resigned"] as const),
  };
});

export const vendors: Vendor[] = Array.from({ length: 44 }, (_, i) => {
  const b = buildingOf(i);
  return {
    id: `VND-${pad(i + 1, 3)}`,
    company: `${pick(["Meghna", "Padma", "Jamuna", "Turag", "Buriganga", "Shitalakshya"])} ${pick(["Lift Services", "Electricals", "Sanitary", "Generators", "Cleaning Co.", "Security Ltd.", "Pest Control", "Traders"])}`,
    category: pick(["Lift maintenance", "Electrical", "Plumbing", "Generator", "Cleaning", "Security", "Pest control", "Supplies"]),
    contactName: name(),
    phone: phone(),
    email: `vendor${i + 1}@mail.test`,
    buildingId: b.id,
    contractValue: money(60000, 900000, 5000),
    outstanding: rnd() > 0.5 ? money(5000, 180000, 2500) : 0,
    rating: Number((3.4 + rnd() * 1.6).toFixed(1)),
    since: day(-int(120, 2400)),
    status: pick(["active", "active", "active", "on_hold", "terminated"] as const),
  };
});

const ASSET_CATEGORIES = ["lift", "generator", "pump", "water_tank", "cctv", "fire_extinguisher", "fire_pump", "ac", "solar", "electrical", "furniture", "appliance"] as const;

export const buildingAssets: BuildingAsset[] = Array.from({ length: 130 }, (_, i) => {
  const b = buildingOf(i);
  const category = pick(ASSET_CATEGORIES);
  const purchase = -int(200, 3600);
  return {
    id: `AST-${pad(i + 1, 4)}`,
    name: `${category.replace(/_/g, " ")} unit ${int(1, 6)}`.replace(/\b\w/, (c) => c.toUpperCase()),
    category,
    buildingId: b.id,
    location: pick(["Basement", "Ground floor", "Roof", "Lift lobby", "Pump room", "Generator room", "Corridor"]),
    purchaseDate: day(purchase),
    cost: money(15000, 2200000, 5000),
    vendor: vendors[i % vendors.length]!.company,
    warrantyUntil: day(purchase + int(365, 1825)),
    condition: pick(["excellent", "good", "good", "fair", "poor"] as const),
    lastMaintenance: day(-int(5, 220)),
    nextMaintenance: day(int(3, 160)),
    replacementDue: day(int(200, 3000)),
    status: pick(["operational", "operational", "operational", "under_maintenance", "faulty", "retired"] as const),
  };
});

export const utilityBills: UtilityBill[] = Array.from({ length: 160 }, (_, i) => {
  const b = buildingOf(i);
  const scope = rnd() > 0.55 ? "flat" : "common_area";
  const utility = pick(["electricity", "water", "gas", "generator", "internet"] as const);
  return {
    id: `UTB-${pad(i + 1, 4)}`,
    buildingId: b.id,
    utility,
    meter: `MTR-${pad(int(1000, 9999))}`,
    scope,
    flatId: scope === "flat" ? flatOf(i) : null,
    month: pick(["2026-05", "2026-06", "2026-07", "2026-08"]),
    units: int(60, 4200),
    amount: money(1200, 145000, 100),
    dueDate: day(int(-20, 20)),
    status: pick(["paid", "paid", "due", "overdue"] as const),
  };
});

const EXPENSE_CATEGORIES = [
  "Electricity", "Water", "Gas", "Generator fuel", "Lift maintenance", "Cleaning", "Security",
  "Staff salaries", "Plumbing", "Electrical", "Painting", "Civil work", "AC maintenance",
  "Pest control", "Landscaping", "Waste", "Internet", "Insurance", "Community fees",
  "Vendor payments", "Emergency expense", "Miscellaneous",
] as const;

export const buildingExpenses: BuildingExpense[] = Array.from({ length: 220 }, (_, i) => {
  const b = buildingOf(i);
  const scope = pick(["common_area", "common_area", "common_area", "flat", "floor", "building_area"] as const);
  return {
    id: `BEX-${pad(i + 1, 4)}`,
    buildingId: b.id,
    category: pick(EXPENSE_CATEGORIES),
    scope,
    scopeRef:
      scope === "flat" ? flatOf(i)
        : scope === "floor" ? `Floor ${int(1, 9)}`
          : scope === "building_area" ? pick(["Basement", "Roof", "Lobby", "Stairwell"])
            : "Common area",
    amount: money(1500, 320000, 500),
    date: day(-int(0, 180)),
    vendor: vendors[i % vendors.length]!.company,
    paymentMethod: pick(["bank_transfer", "cash", "bkash", "nagad", "cheque"] as const),
    invoiceNo: `INV-B-${pad(int(1000, 9999))}`,
    approvedBy: pick(["Building Manager", "Building Owner", "Caretaker"]),
    notes: pick(["Monthly recurring", "Emergency repair", "Scheduled service", "Annual contract", "Ad-hoc purchase"]),
    status: pick(["paid", "paid", "approved", "pending", "rejected"] as const),
  };
});

export const buildingIncome: BuildingIncome[] = Array.from({ length: 200 }, (_, i) => {
  const b = buildingOf(i);
  const source = pick(["rent", "rent", "rent", "parking_rent", "commercial_rent", "service_charge", "late_fee", "other"] as const);
  return {
    id: `BIN-${pad(i + 1, 4)}`,
    buildingId: b.id,
    source,
    flatId: source === "rent" ? flatOf(i) : null,
    payer: name(),
    amount: source === "rent" ? money(18000, 95000, 1000) : money(1000, 60000, 500),
    date: day(-int(0, 120)),
    month: pick(["2026-06", "2026-07", "2026-08"]),
    method: pick(["bank_transfer", "bkash", "cash", "nagad", "cheque"] as const),
    status: pick(["received", "received", "received", "pending", "overdue"] as const),
  };
});

const BUDGET_CATEGORIES = ["Security", "Staff", "Electricity", "Water", "Maintenance", "Lift", "Generator", "Cleaning", "Other"] as const;

export const budgets: Budget[] = buildings.slice(0, 12).flatMap((b, bi) =>
  BUDGET_CATEGORIES.map((category, ci) => {
    const planned = money(20000, 260000, 5000);
    const actual = Math.round(planned * (0.6 + rnd() * 0.8));
    const variance = planned - actual;
    return {
      id: `BGT-${pad(bi * 10 + ci + 1, 4)}`,
      buildingId: b.id,
      period: "2026-08",
      category,
      planned,
      actual,
      variance,
      status: variance < -planned * 0.1 ? "over_budget" : variance < 0 ? "at_risk" : "on_track",
    } as Budget;
  }),
);

export const purchaseRequests: PurchaseRequest[] = Array.from({ length: 58 }, (_, i) => {
  const b = buildingOf(i);
  const cost = money(800, 180000, 100);
  return {
    id: `PRQ-${pad(i + 1, 4)}`,
    buildingId: b.id,
    item: pick(["LED bulbs (24 pcs)", "Generator diesel 200L", "Cleaning materials pack", "Plumbing parts kit", "CCTV hard disk 4TB", "Lift door sensor", "Water pump seal", "Fire extinguisher refill", "Paint 40L"]),
    category: pick(["Electrical", "Fuel", "Cleaning", "Plumbing", "Security", "Lift", "Maintenance", "Safety"]),
    quantity: int(1, 40),
    estimatedCost: cost,
    requestedBy: pick(["Caretaker", "Building Manager", "Technician"]),
    requestedOn: day(-int(0, 60)),
    approvalTier: cost < 5000 ? "caretaker" : cost <= 50000 ? "building_manager" : "building_owner",
    vendor: vendors[i % vendors.length]!.company,
    status: pick(["requested", "pending_approval", "approved", "ordered", "received", "invoiced", "paid", "rejected"] as const),
  };
});

/* ----------------------------- Service marketplace ---------------------------- */

const SERVICE_CATEGORIES: ServiceCategory[] = [
  "laundry", "dry_cleaning", "cleaning", "ac_servicing", "plumbing", "electrical", "car_wash",
  "car_servicing", "pest_control", "appliance_repair", "tailoring", "salon", "grocery", "movers",
  "interior", "tutor", "driver", "other",
];

const PROVIDER_NAMES = [
  "Clean & Fresh Laundry", "Sparkle Dry Clean", "HomeShine Cleaners", "CoolCare AC Services",
  "Dhaka Plumbing Works", "VoltEdge Electricals", "AutoGlow Car Wash", "MotorMate Servicing",
  "SafeGuard Pest Control", "FixIt Appliance Care", "Stitch Studio Tailors", "Glow Salon & Spa",
  "Bashundhara Fresh Grocers", "SwiftMove Packers", "Interior Nest", "BrightMind Tutors",
  "SafeDrive Drivers", "HandyPro Services", "Aqua Clean Laundry", "Prime Home Care",
] as const;

export const serviceProviders: ServiceProvider[] = PROVIDER_NAMES.map((business, i) => {
  const category = SERVICE_CATEGORIES[i % SERVICE_CATEGORIES.length]!;
  return {
    id: `SVP-${pad(i + 1, 3)}`,
    business,
    contactName: name(),
    phone: phone(),
    email: `contact${i + 1}@provider.test`,
    category,
    services: pick([
      "Wash · Dry clean · Iron · Express",
      "Deep clean · Sofa clean · Kitchen clean",
      "Servicing · Gas refill · Installation",
      "Repair · Installation · Emergency call-out",
      "Pickup · Processing · Return delivery",
    ]),
    description: "Bashundhara-verified provider operating under the community controlled-access protocol.",
    priceFrom: money(200, 1500, 50),
    priceTo: money(2000, 12000, 100),
    hours: pick(["08:00–20:00", "09:00–21:00", "24/7 on call", "10:00–19:00"]),
    serviceArea: pick(["All blocks", "Blocks A–F", "Blocks C, D, E", "Blocks G–M"]),
    rating: Number((3.9 + rnd() * 1.1).toFixed(1)),
    completedJobs: int(48, 1600),
    responseMins: int(6, 55),
    trustScore: int(62, 99),
    complaintRate: Number((rnd() * 6).toFixed(1)),
    noShowRate: Number((rnd() * 4).toFixed(1)),
    verification: i % 11 === 0 ? "under_review" : i % 17 === 0 ? "suspended" : "verified",
    since: day(-int(120, 1800)),
    status: i % 17 === 0 ? "suspended" : "active",
  };
});

export const serviceRequests: ServiceRequest[] = Array.from({ length: 62 }, (_, i) => {
  const category = SERVICE_CATEGORIES[i % SERVICE_CATEGORIES.length]!;
  const from = money(800, 4000, 100);
  return {
    id: `SRQ-${pad(i + 1, 4)}`,
    title: pick(["Need sofa cleaning", "Weekly laundry pickup", "AC not cooling — servicing", "Kitchen tap leaking", "Car wash at parking", "Pest control for kitchen", "Fridge repair", "Curtain stitching", "Deep clean before Eid"]),
    category,
    residentName: name(),
    flatId: flatOf(i),
    block: blockName(),
    location: `${blockName()}, Road ${int(1, 24)}`,
    preferredDate: day(int(0, 21)),
    budgetFrom: from,
    budgetTo: from + money(500, 3000, 100),
    pricingModel: pick(["fixed_price", "quote_request", "competitive_bid"] as const),
    description: "Resident-submitted request routed to verified providers under community access rules.",
    photos: int(0, 4),
    bids: int(0, 6),
    createdOn: day(-int(0, 20)),
    status: pick(["open", "receiving_bids", "receiving_bids", "provider_selected", "converted", "cancelled"] as const),
  };
});

export const serviceBids: ServiceBid[] = serviceRequests.flatMap((r, ri) =>
  Array.from({ length: Math.min(r.bids, 4) }, (_, bi) => {
    const p = serviceProviders[(ri + bi) % serviceProviders.length]!;
    return {
      id: `SBD-${pad(ri * 10 + bi + 1, 5)}`,
      requestId: r.id,
      providerId: p.id,
      providerName: p.business,
      price: money(r.budgetFrom, r.budgetTo + 1500, 100),
      availability: pick(["Today 4–6 PM", "Tomorrow morning", "Within 24 hours", "Sat 10 AM", "Same day express"]),
      estimatedCompletion: pick(["2 hours", "Same day", "24 hours", "48 hours", "3 days"]),
      rating: p.rating,
      note: pick(["Includes materials", "Free re-visit within 7 days", "Express slot available", "Team of 2 technicians"]),
      submittedOn: day(-int(0, 6)),
      status: bi === 0 && r.status === "provider_selected" ? "selected" : pick(["submitted", "submitted", "shortlisted", "rejected"] as const),
    } as ServiceBid;
  }),
);

const ORDER_STATUS_FLOW = [
  "scheduled", "provider_approaching", "at_gate", "security_verified", "caretaker_assigned",
  "picked_up", "processing", "return_to_gate", "caretaker_received", "delivered",
  "resident_confirmed", "completed",
] as const;

export const serviceOrders: ServiceOrder[] = Array.from({ length: 72 }, (_, i) => {
  const p = serviceProviders[i % serviceProviders.length]!;
  const b = buildingOf(i);
  const status = i % 13 === 0 ? pick(["cancelled", "no_show", "disputed", "lost_damaged"] as const) : pick(ORDER_STATUS_FLOW);
  return {
    id: `SOR-${pad(i + 1, 4)}`,
    requestId: i % 2 === 0 ? serviceRequests[i % serviceRequests.length]!.id : null,
    category: p.category,
    service: pick(["Laundry pickup & return", "Dry cleaning", "Deep cleaning", "AC servicing", "Plumbing repair", "Shoe repair pickup", "Tailoring pickup"]),
    providerId: p.id,
    providerName: p.business,
    residentName: name(),
    flatId: flatOf(i),
    buildingId: b.id,
    block: b.block,
    gate: gateName(),
    caretakerName: b.caretakerName,
    scheduledDate: day(int(-10, 10)),
    pickupWindow: `${clock(int(8, 12))}–${clock(int(13, 14))}`,
    returnWindow: `${clock(int(16, 18))}–${clock(int(19, 20))}`,
    itemCount: int(1, 18),
    amount: money(400, 9000, 50),
    paymentStatus: pick(["unpaid", "paid", "paid"] as const),
    accessPassCode: `SAP-${pad(int(1000, 9999))}`,
    otp: String(int(100000, 999999)),
    status,
    createdOn: day(-int(0, 20)),
  };
});

export const serviceItems: ServiceItem[] = serviceOrders.flatMap((o, oi) =>
  Array.from({ length: Math.min(o.itemCount, 3) }, (_, ii) => ({
    id: `SIT-${pad(oi * 10 + ii + 1, 5)}`,
    orderId: o.id,
    description: pick(["Cotton shirts ×4", "Bed linen set", "Winter blanket", "Formal suit", "Saree (silk)", "Curtains ×2", "Leather shoes", "Kids uniform ×3"]),
    quantity: int(1, 6),
    weightKg: Number((0.4 + rnd() * 6).toFixed(1)),
    conditionOut: pick(["Good", "Good", "Minor stain noted", "Fragile fabric"]),
    conditionIn: pick(["Good", "Good", "—", "Colour faded"]),
    photos: int(1, 3),
    pickupDate: o.scheduledDate,
    returnDate: o.status === "completed" ? o.scheduledDate : null,
    status: pick(["with_resident", "with_caretaker", "with_provider", "returned"] as const),
  })),
);

const HANDOVER_STEPS: { type: ServiceHandover["type"]; role: ServiceHandover["personRole"]; label: string }[] = [
  { type: "gate_verification", role: "security_officer", label: "Provider arrived and identity verified at gate" },
  { type: "resident_to_caretaker", role: "caretaker", label: "Caretaker collected package from resident" },
  { type: "caretaker_to_provider", role: "caretaker", label: "Package handed to provider at collection point" },
  { type: "gate_exit", role: "security_officer", label: "Provider exited the community" },
  { type: "provider_to_caretaker", role: "caretaker", label: "Caretaker received returned package" },
  { type: "caretaker_to_resident", role: "caretaker", label: "Package delivered to resident flat" },
];

export const serviceHandovers: ServiceHandover[] = serviceOrders.flatMap((o, oi) => {
  const reached = ORDER_STATUS_FLOW.indexOf(o.status as (typeof ORDER_STATUS_FLOW)[number]);
  const steps = reached < 0 ? 2 : Math.max(1, Math.min(6, Math.ceil((reached + 1) / 2)));
  return Array.from({ length: steps }, (_, si) => {
    const step = HANDOVER_STEPS[si]!;
    return {
      id: `SHV-${pad(oi * 10 + si + 1, 5)}`,
      orderId: o.id,
      sequence: si + 1,
      timestamp: `${o.scheduledDate} ${clock(9 + si * 2, si * 7 % 60)}`,
      type: step.type,
      personName: step.role === "caretaker" ? o.caretakerName : step.role === "security_officer" ? name() : o.providerName,
      personRole: step.role,
      gate: o.gate,
      location: step.type.includes("resident") ? `Flat ${o.flatId}` : step.type.includes("gate") ? o.gate : "Collection point",
      confirmation: pick(["otp", "qr", "photo", "signature"] as const),
      photos: int(0, 3),
      notes: step.label,
      status: "completed",
    } as ServiceHandover;
  });
});

export const serviceDisputes: ServiceDispute[] = Array.from({ length: 18 }, (_, i) => {
  const o = serviceOrders[(i * 4) % serviceOrders.length]!;
  return {
    id: `SDP-${pad(i + 1, 3)}`,
    orderId: o.id,
    residentName: o.residentName,
    providerName: o.providerName,
    reason: pick(["missing_item", "damaged_item", "wrong_item", "late_return", "poor_service", "incorrect_price", "no_show"] as const),
    claimAmount: money(500, 18000, 100),
    raisedOn: day(-int(0, 40)),
    evidence: int(1, 5),
    providerResponse: pick(["Investigating with the processing team", "Offered replacement", "Disputed the claim", "Awaiting response"]),
    reviewer: pick(["Community Admin", "Welfare Society", "Marketplace Ops"]),
    resolution: pick(["Refund issued", "Partial refund", "Replacement agreed", "Pending", "Claim rejected"]),
    status: pick(["open", "provider_responding", "community_review", "resolved", "rejected", "escalated"] as const),
  };
});

export const serviceReviews: ServiceReview[] = Array.from({ length: 90 }, (_, i) => {
  const o = serviceOrders[i % serviceOrders.length]!;
  const s = () => int(3, 5);
  const q = s(), b = s(), t = s(), pr = s(), c = s();
  return {
    id: `SRV-${pad(i + 1, 4)}`,
    orderId: o.id,
    providerId: o.providerId,
    providerName: o.providerName,
    residentName: o.residentName,
    quality: q,
    behaviour: b,
    timeliness: t,
    price: pr,
    carefulness: c,
    overall: Number(((q + b + t + pr + c) / 5).toFixed(1)),
    comment: pick(["Careful handover, everything accounted for.", "On time and polite.", "Good service, slightly pricey.", "Items returned neatly folded.", "Delayed by an hour but resolved."]),
    date: day(-int(0, 60)),
    status: i % 23 === 0 ? "flagged" : "published",
  };
});

export const caretakerTasks: CaretakerTask[] = Array.from({ length: 46 }, (_, i) => {
  const o = serviceOrders[i % serviceOrders.length]!;
  const type = pick(["service_pickup", "service_return", "maintenance", "resident_request", "handover", "inspection"] as const);
  return {
    id: `CTK-${pad(i + 1, 4)}`,
    orderId: type.startsWith("service") || type === "handover" ? o.id : null,
    buildingId: o.buildingId,
    caretakerName: o.caretakerName,
    type,
    title: {
      service_pickup: `Collect ${o.service.toLowerCase()} from resident`,
      service_return: `Deliver returned items to resident`,
      maintenance: pick(["Fix corridor light", "Check water pump", "Lift inspection support"]),
      resident_request: pick(["Assist with parcel", "Water tank cleaning request", "Escort technician"]),
      handover: `Handover to ${o.providerName}`,
      inspection: "Daily building walk-through",
    }[type],
    flatId: o.flatId,
    scheduledAt: `${day(int(0, 2))} ${clock(int(8, 19), pick([0, 15, 30, 45] as const))}`,
    window: pick(["10:00–11:00", "11:00–12:00", "16:00–17:00", "17:00–18:00"]),
    priority: pick(["normal", "normal", "high", "low", "urgent"] as const),
    requiresOtp: type !== "inspection",
    requiresPhoto: type.startsWith("service") || type === "handover",
    status: pick(["pending", "pending", "accepted", "in_progress", "awaiting_otp", "completed", "missed"] as const),
  };
});

/* ------------------------------ Access & security ----------------------------- */

export const accessPasses: AccessPass[] = Array.from({ length: 70 }, (_, i) => {
  const o = serviceOrders[i % serviceOrders.length]!;
  const personType = pick(["service_provider", "service_provider", "domestic_worker", "delivery", "contractor", "visitor"] as const);
  const dw = domesticWorkers[i % domesticWorkers.length]!;
  const isProvider = personType === "service_provider";
  return {
    id: `PAS-${pad(i + 1, 4)}`,
    personName: isProvider ? o.providerName : personType === "domestic_worker" ? dw.name : name(),
    personType,
    organisation: isProvider ? o.providerName : personType === "delivery" ? pick(["Pathao", "Foodpanda", "Daraz", "Sundarban Courier"]) : "—",
    associatedWith: isProvider ? o.residentName : dw.employerName,
    flatId: isProvider ? o.flatId : dw.flatId,
    block: isProvider ? o.block : dw.block,
    gate: gateName(),
    purpose: isProvider ? `${o.service} — pickup/return` : personType === "domestic_worker" ? "Daily household duty" : pick(["Parcel delivery", "Guest visit", "Approved works"]),
    validFrom: `${day(0)} ${clock(int(7, 10))}`,
    validTo: `${day(0)} ${clock(int(17, 21))}`,
    zoneAccess: isProvider ? "Gate → Collection point only" : personType === "domestic_worker" ? `Gate → ${dw.block} → Flat` : "Gate → Lobby only",
    orderId: isProvider ? o.id : null,
    passCode: isProvider ? o.accessPassCode : dw.passCode,
    status: pick(["expected", "at_gate", "verified", "inside", "at_collection_point", "completed", "denied", "expired"] as const),
  };
});

export const accessEvents: AccessEvent[] = Array.from({ length: 140 }, (_, i) => {
  const p = accessPasses[i % accessPasses.length]!;
  const inside = rnd() > 0.72;
  return {
    id: `ACE-${pad(i + 1, 4)}`,
    personName: p.personName,
    personType: pick(["service_provider", "domestic_worker", "visitor", "delivery", "contractor", "staff"] as const),
    flatId: p.flatId,
    purpose: p.purpose,
    gate: p.gate,
    entryTime: clock(int(6, 20), pick([0, 10, 20, 30, 40, 50] as const)),
    exitTime: inside ? null : clock(int(9, 22), pick([5, 15, 25, 35] as const)),
    verification: pick(["qr", "id_card", "otp", "manual"] as const),
    authorizedBy: pick(["Resident approval", "Standing authorization", "Service order", "Security desk"]),
    date: day(-int(0, 14)),
    status: inside ? "inside" : pick(["completed", "completed", "completed", "denied", "overstay"] as const),
  };
});

/* --------------------------- Resident community layer ------------------------- */

export const communityPosts: CommunityPost[] = Array.from({ length: 54 }, (_, i) => {
  const type = pick(["post", "question", "recommendation", "lost_found", "deal", "alert", "notice"] as const);
  return {
    id: `CPT-${pad(i + 1, 4)}`,
    author: name(),
    authorFlat: flatOf(i),
    block: blockName(),
    type,
    title: {
      post: pick(["Morning walkers group forming", "Rooftop gardening tips", "Block C cricket match Friday"]),
      question: pick(["Reliable AC technician?", "Best school van route for Block D?", "Anyone facing low water pressure?"]),
      recommendation: pick(["Great laundry service — Clean & Fresh", "SafeDrive drivers are punctual", "Recommend Glow Salon home service"]),
      lost_found: pick(["Lost: black wallet near Gate 3", "Found: house keys at playground", "Lost cat — Block E"]),
      deal: pick(["20% off at Bashundhara Fresh Grocers", "Eid offer — Sparkle Dry Clean", "Gym membership discount"]),
      alert: pick(["Water supply interruption 10 AM–1 PM", "Road 7 digging work today", "Generator test at 6 PM"]),
      notice: pick(["Welfare Society meeting Saturday", "Service charge due 10th", "New visitor policy in effect"]),
    }[type],
    body: "Shared with the Bashundhara R/A resident community feed.",
    group: pick(["Block A Residents", "Block C Residents", "Parents Group", "Pet Owners", "Marketplace", "General"]),
    likes: int(0, 180),
    comments: int(0, 46),
    postedOn: day(-int(0, 18)),
    status: i % 21 === 0 ? "pending_review" : "published",
  };
});

export const polls: Poll[] = Array.from({ length: 12 }, (_, i) => ({
  id: `POL-${pad(i + 1, 3)}`,
  question: pick([
    "Should Gate 4 stay open until midnight?",
    "Preferred day for community clean-up drive?",
    "Approve rooftop solar pilot for Block C?",
    "Should visitor parking fees be revised?",
    "Support weekly farmers market at the field?",
  ]),
  group: pick(["All residents", "Block C Residents", "Welfare Society", "Building owners"]),
  options: pick(["Yes · No · Abstain", "Friday · Saturday · Sunday", "Approve · Reject · Need more info"]),
  votes: int(24, 1400),
  closesOn: day(int(1, 20)),
  createdBy: pick(["Welfare Society", "Community Admin", "Block Committee"]),
  status: i % 5 === 0 ? "closed" : "open",
}));

export const nearbyPlaces: NearbyPlace[] = Array.from({ length: 64 }, (_, i) => {
  const category = pick(["grocery", "restaurant", "cafe", "pharmacy", "hospital", "clinic", "bank", "atm", "laundry", "salon", "gym", "school", "mosque", "petrol", "courier", "workshop", "bakery", "market"] as const);
  const label: Record<string, string[]> = {
    grocery: ["Shwapno Bashundhara", "Agora Block B", "Meena Bazar"],
    restaurant: ["Sultan's Dine", "Kacchi Bhai", "Star Kabab"],
    cafe: ["North End Coffee", "Crimson Cup", "Gloria Jean's"],
    pharmacy: ["Lazz Pharma", "Tamanna Pharmacy", "Wellbeing Pharmacy"],
    hospital: ["Evercare Hospital", "Apollo Imperial", "Bashundhara General"],
    clinic: ["Popular Diagnostic", "Ibn Sina Centre", "Praava Health"],
    bank: ["BRAC Bank Bashundhara", "City Bank Branch", "DBBL Branch"],
    atm: ["DBBL ATM Gate 2", "BRAC ATM Block C", "City Bank ATM"],
    laundry: ["Clean & Fresh Outlet", "Sparkle Dry Clean", "Aqua Clean"],
    salon: ["Glow Salon & Spa", "Persona Adamjee", "Cloud 9 Salon"],
    gym: ["Fitness Lab", "Muscle Zone", "GoodLife Gym"],
    school: ["Playpen School", "Sunnydale Bashundhara", "Adarsha Vidyaniketan"],
    mosque: ["Block B Jame Mosque", "Bashundhara Central Mosque", "Block G Mosque"],
    petrol: ["Padma Filling Station", "Meghna Fuel Point", "Jamuna CNG"],
    courier: ["Sundarban Courier", "SA Paribahan", "Pathao Hub"],
    workshop: ["AutoCare Garage", "Bike Point Service", "Motor Mechanic Shop"],
    bakery: ["Bread & Beyond", "Cooper's", "Mr. Baker"],
    market: ["Bashundhara Kacha Bazar", "Block D Market", "Weekly Bazar"],
  };
  return {
    id: `NBP-${pad(i + 1, 3)}`,
    name: pick(label[category]!),
    category,
    address: `Road ${int(1, 24)}, Block ${pick(BLOCK_NAMES)}, Bashundhara R/A`,
    block: blockName(),
    distanceKm: Number((0.1 + rnd() * 3.4).toFixed(1)),
    phone: phone(),
    hours: pick(["08:00–22:00", "09:00–21:00", "24 hours", "10:00–20:00"]),
    rating: Number((3.5 + rnd() * 1.5).toFixed(1)),
    openNow: rnd() > 0.25,
    verified: rnd() > 0.35,
    offers: pick(["—", "10% resident discount", "Free home delivery", "Eid special offer"]),
  };
});
