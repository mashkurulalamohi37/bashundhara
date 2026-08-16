/**
 * Deterministic mock dataset for the accounting engine and the
 * enterprise control layer (identity, metering, inventory, SLA,
 * workflow, access, allocation, compliance).
 */
import { buildings, serviceOrders, vendors } from "./community";
import { flats as baseFlats } from "./data";
import type {
  Account, AccountingAuditEvent, AccountingProject, AccessPolicy, AccessZone, Adjustment,
  AllocationResult, AllocationRule, BankStatementLine, CashBankAccount, CashTransaction,
  ComplianceDocument, CostCenter, DepreciationRow, DispatchRecord, EscalationRule, FiscalPeriod,
  FixedAsset, InventoryItem, JournalEntry, JournalLine, Meter, MeterReading, NotificationRule,
  Payable, Person, PersonRelationship, PettyCashEntry, ProcurementRecord, Receivable,
  RelationshipKind, RoutingRule, Settlement, SlaRule, SlaTicket, SourceModule, StockMovement,
  Warehouse,
} from "@/types";

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const rnd = makeRng(20260817);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)]!;
const int = (min: number, max: number) => min + Math.floor(rnd() * (max - min + 1));
const money = (min: number, max: number, step = 500) => int(min / step, max / step) * step;
const pad = (n: number, len = 4) => String(n).padStart(len, "0");
const TODAY = new Date(Date.UTC(2026, 7, 15));
const day = (offset: number) => {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
};
const stamp = (offset: number) => `${day(offset)} ${pad(int(8, 20), 2)}:${pad(int(0, 5) * 10, 2)}`;

const FIRST = [
  "Rafiqul", "Nusrat", "Tanvir", "Sabrina", "Mahmudul", "Farhana", "Imran", "Sadia", "Kamrul",
  "Rumana", "Shahriar", "Tasnim", "Arif", "Nabila", "Mizanur", "Sharmin", "Zahid", "Ishrat",
  "Mostafiz", "Anika", "Rakib", "Sumaiya", "Jubair", "Maliha", "Habibur", "Rehnuma", "Sohel",
] as const;
const LAST = [
  "Islam", "Rahman", "Chowdhury", "Hossain", "Akter", "Ahmed", "Karim", "Bhuiyan", "Sarker",
  "Mollah", "Siddique", "Talukder", "Mahmud", "Haque", "Kabir",
] as const;
const BN_FIRST = ["রফিকুল", "নুসরাত", "তানভীর", "সাবরিনা", "মাহমুদুল", "ফারহানা", "ইমরান", "সাদিয়া"] as const;
const BN_LAST = ["ইসলাম", "রহমান", "চৌধুরী", "হোসেন", "আক্তার", "আহমেদ", "করিম"] as const;
const person = () => `${pick(FIRST)} ${pick(LAST)}`;
const personBn = () => `${pick(BN_FIRST)} ${pick(BN_LAST)}`;
const phone = () => `+8801${int(3, 9)}${pad(int(0, 99999999), 8)}`;
const nid = () => `${int(1980, 2004)}${pad(int(1, 9999999), 7)}`;
const flatCode = () => baseFlats[int(0, baseFlats.length - 1)]?.id ?? `FLT-${pad(int(1, 999), 4)}`;
const buildingId = () => buildings[int(0, buildings.length - 1)]!.id;

/* ============================== Chart of accounts ============================= */

interface Seed { code: string; name: string; type: Account["type"]; group?: boolean; desc: string }

const COA_SEED: Seed[] = [
  { code: "1000", name: "Assets", type: "asset", group: true, desc: "All community and building assets." },
  { code: "1100", name: "Current Assets", type: "asset", group: true, desc: "Assets convertible within a year." },
  { code: "1110", name: "Cash in Hand", type: "asset", desc: "Petty cash held by building offices." },
  { code: "1120", name: "Bank — Operating Account", type: "asset", desc: "Primary operating bank account." },
  { code: "1130", name: "Bank — Reserve Fund", type: "asset", desc: "Sinking and reserve fund deposits." },
  { code: "1140", name: "Accounts Receivable — Service Charge", type: "asset", desc: "Dues billed to residents." },
  { code: "1150", name: "Accounts Receivable — Rent", type: "asset", desc: "Rent billed to tenants." },
  { code: "1160", name: "Advance to Vendors", type: "asset", desc: "Advances issued against purchase orders." },
  { code: "1170", name: "Inventory — Maintenance Stores", type: "asset", desc: "Spare parts and consumables on hand." },
  { code: "1200", name: "Fixed Assets", type: "asset", group: true, desc: "Capitalised long-life assets." },
  { code: "1210", name: "Lifts and Elevators", type: "asset", desc: "Passenger and service lifts." },
  { code: "1220", name: "Generators and Substations", type: "asset", desc: "Backup power infrastructure." },
  { code: "1230", name: "Pumps and Water Systems", type: "asset", desc: "Water pumps, reservoirs, treatment." },
  { code: "1240", name: "Security and CCTV Equipment", type: "asset", desc: "Cameras, barriers, access hardware." },
  { code: "1290", name: "Accumulated Depreciation", type: "asset", desc: "Contra-asset for accumulated depreciation." },
  { code: "2000", name: "Liabilities", type: "liability", group: true, desc: "Obligations to third parties." },
  { code: "2100", name: "Current Liabilities", type: "liability", group: true, desc: "Payable within a year." },
  { code: "2110", name: "Accounts Payable — Vendors", type: "liability", desc: "Approved vendor bills awaiting payment." },
  { code: "2120", name: "Accounts Payable — Utilities", type: "liability", desc: "DESCO, WASA and gas bills." },
  { code: "2130", name: "Security Deposits — Tenants", type: "liability", desc: "Refundable tenancy deposits." },
  { code: "2140", name: "Provider Payable — Marketplace", type: "liability", desc: "Settlements owed to service providers." },
  { code: "2150", name: "Salaries and Wages Payable", type: "liability", desc: "Accrued staff payroll." },
  { code: "2160", name: "VAT and Tax Payable", type: "liability", desc: "Withheld VAT and income tax." },
  { code: "3000", name: "Equity and Funds", type: "equity", group: true, desc: "Community funds and surplus." },
  { code: "3100", name: "General Fund", type: "equity", desc: "Accumulated general surplus." },
  { code: "3200", name: "Sinking Fund", type: "equity", desc: "Reserved for major replacements." },
  { code: "3300", name: "Retained Surplus", type: "equity", desc: "Prior-year retained surplus." },
  { code: "4000", name: "Revenue", type: "revenue", group: true, desc: "All community income streams." },
  { code: "4100", name: "Service Charge Income", type: "revenue", desc: "Monthly service charge billing." },
  { code: "4200", name: "Rent Income", type: "revenue", desc: "Rent from tenanted flats and shops." },
  { code: "4300", name: "Parking Income", type: "revenue", desc: "Parking allocation and visitor parking." },
  { code: "4400", name: "Facility Booking Income", type: "revenue", desc: "Community hall, courts, guest suites." },
  { code: "4500", name: "Marketplace Commission", type: "revenue", desc: "Commission on marketplace orders." },
  { code: "4600", name: "Utility Recovery", type: "revenue", desc: "Recovery of metered utility usage." },
  { code: "4700", name: "Penalty and Late Fee", type: "revenue", desc: "Late payment penalties." },
  { code: "5000", name: "Expenses", type: "expense", group: true, desc: "Operating and capital expenditure." },
  { code: "5100", name: "Salaries and Wages", type: "expense", desc: "Security, caretaker, cleaning, office staff." },
  { code: "5200", name: "Electricity", type: "expense", desc: "DESCO bills, common area and lifts." },
  { code: "5210", name: "Water and Sewerage", type: "expense", desc: "WASA billing and tanker supply." },
  { code: "5220", name: "Gas", type: "expense", desc: "Titas gas consumption." },
  { code: "5300", name: "Repairs and Maintenance", type: "expense", desc: "Reactive and planned maintenance." },
  { code: "5310", name: "Lift and Generator AMC", type: "expense", desc: "Annual maintenance contracts." },
  { code: "5400", name: "Cleaning and Waste Management", type: "expense", desc: "Cleaning contracts and waste removal." },
  { code: "5500", name: "Security Operations", type: "expense", desc: "Guarding contracts, equipment, patrols." },
  { code: "5600", name: "Landscaping and Environment", type: "expense", desc: "Gardening, plantation, pest control." },
  { code: "5700", name: "Administrative Expenses", type: "expense", desc: "Office, printing, communications." },
  { code: "5800", name: "Insurance and Compliance", type: "expense", desc: "Insurance premiums, licences, audit." },
  { code: "5900", name: "Depreciation Expense", type: "expense", desc: "Periodic depreciation charge." },
];

export const accounts: Account[] = COA_SEED.map((s) => {
  const level = s.code.endsWith("000") ? 1 : s.code.endsWith("00") ? 2 : 3;
  const parentCode =
    level === 1 ? null : level === 2 ? `${s.code[0]}000` : COA_SEED.slice().reverse().find(
      (p) => p.group && p.code[0] === s.code[0] && p.code < s.code,
    )?.code ?? `${s.code[0]}000`;
  const normal: Account["normalBalance"] =
    s.type === "asset" || s.type === "expense" ? "debit" : "credit";
  return {
    id: `ACC-${s.code}`,
    code: s.code,
    name: s.name,
    type: s.type,
    parentId: parentCode ? `ACC-${parentCode}` : null,
    level,
    isGroup: Boolean(s.group),
    normalBalance: normal,
    status: "active",
    description: s.desc,
    balance: s.group ? 0 : money(180000, 24000000, 1000),
    currency: "BDT",
  };
});

const leafByCode = (code: string) => accounts.find((a) => a.code === code)!;

// Roll group balances up from their children.
for (const group of accounts.filter((a) => a.isGroup).sort((a, b) => b.level - a.level)) {
  group.balance = accounts
    .filter((a) => a.parentId === group.id)
    .reduce((s, a) => s + a.balance, 0);
}

/* ================================ Fiscal periods ============================== */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const fiscalPeriods: FiscalPeriod[] = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(Date.UTC(2025, 6 + i, 1));
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const isCurrent = y === 2026 && m === 7;
  const isFuture = y > 2026 || (y === 2026 && m > 7);
  return {
    id: `FP-${y}-${pad(m + 1, 2)}`,
    fiscalYear: m >= 6 ? `FY ${y}-${String(y + 1).slice(2)}` : `FY ${y - 1}-${String(y).slice(2)}`,
    name: `${MONTHS[m]} ${y}`,
    startDate: `${y}-${pad(m + 1, 2)}-01`,
    endDate: `${y}-${pad(m + 1, 2)}-${pad(last, 2)}`,
    status: isFuture ? "open" : isCurrent ? "open" : m % 6 === 0 ? "locked" : "closed",
    closedOn: isCurrent || isFuture ? undefined : `${y}-${pad(m + 1, 2)}-${pad(last, 2)}`,
    closedBy: isCurrent || isFuture ? undefined : "Accounts Controller",
  };
});

const currentPeriod = fiscalPeriods.find((p) => p.id === "FP-2026-08")!;

/* ================================ Cost centers ================================ */

const CC_SEED = [
  ["CC-SEC", "Security Operations", 42000000],
  ["CC-MNT", "Maintenance and Engineering", 38000000],
  ["CC-CLN", "Cleaning and Waste", 21000000],
  ["CC-ENV", "Landscaping and Environment", 12000000],
  ["CC-ADM", "Administration", 16000000],
  ["CC-UTL", "Utilities", 54000000],
  ["CC-MKT", "Marketplace Operations", 8000000],
  ["CC-GOV", "Welfare and Governance", 6500000],
] as const;

export const costCenters: CostCenter[] = CC_SEED.map(([code, name, budget]) => {
  const actual = Math.round(budget * (0.62 + rnd() * 0.5));
  return {
    id: code,
    code,
    name,
    head: person(),
    budget,
    actual,
    variance: budget - actual,
    status: "active",
  };
});

/* ================================ Journal entries ============================= */

const ENTRY_TEMPLATES: {
  source: SourceModule; desc: string; debit: string; credit: string; route?: string; min: number; max: number;
}[] = [
  { source: "invoice", desc: "Service charge billed for the month", debit: "1140", credit: "4100", route: "/finance/invoices", min: 400000, max: 2600000 },
  { source: "payment", desc: "Service charge collection received", debit: "1120", credit: "1140", route: "/finance/payments", min: 300000, max: 2200000 },
  { source: "rent", desc: "Rent invoiced to tenants", debit: "1150", credit: "4200", route: "/building/rent", min: 250000, max: 1800000 },
  { source: "payment", desc: "Rent received via bank transfer", debit: "1120", credit: "1150", route: "/building/rent", min: 200000, max: 1500000 },
  { source: "utility", desc: "DESCO electricity bill accrued", debit: "5200", credit: "2120", route: "/building/utilities", min: 180000, max: 1400000 },
  { source: "utility", desc: "WASA water and sewerage bill accrued", debit: "5210", credit: "2120", route: "/building/utilities", min: 60000, max: 420000 },
  { source: "expense", desc: "Security guarding contract expense", debit: "5500", credit: "2110", route: "/finance/expenses", min: 220000, max: 900000 },
  { source: "expense", desc: "Cleaning and waste management expense", debit: "5400", credit: "2110", route: "/finance/expenses", min: 90000, max: 380000 },
  { source: "vendor_bill", desc: "Lift AMC vendor bill booked", debit: "5310", credit: "2110", route: "/building/vendors", min: 60000, max: 320000 },
  { source: "procurement", desc: "Maintenance stores purchase received", debit: "1170", credit: "2110", route: "/inventory/items", min: 40000, max: 260000 },
  { source: "expense", desc: "Staff salary and wages posted", debit: "5100", credit: "2150", route: "/building/staff", min: 400000, max: 1600000 },
  { source: "payment", desc: "Vendor payment released", debit: "2110", credit: "1120", route: "/accounts/payables", min: 80000, max: 900000 },
  { source: "service_order", desc: "Marketplace commission earned", debit: "1140", credit: "4500", route: "/services/orders", min: 8000, max: 74000 },
  { source: "service_order", desc: "Provider settlement payable recognised", debit: "2140", credit: "1120", route: "/accounts/settlements", min: 20000, max: 180000 },
  { source: "depreciation", desc: "Monthly depreciation charge", debit: "5900", credit: "1290", route: "/accounts/depreciation", min: 120000, max: 640000 },
  { source: "petty_cash", desc: "Petty cash replenishment", debit: "1110", credit: "1120", route: "/accounts/petty-cash", min: 10000, max: 60000 },
  { source: "invoice", desc: "Parking allocation billed", debit: "1140", credit: "4300", route: "/parking", min: 30000, max: 210000 },
  { source: "invoice", desc: "Facility booking income billed", debit: "1140", credit: "4400", route: "/bookings", min: 12000, max: 120000 },
  { source: "adjustment", desc: "Late payment penalty applied", debit: "1140", credit: "4700", route: "/accounts/adjustments", min: 4000, max: 42000 },
  { source: "expense", desc: "Repairs and maintenance expense", debit: "5300", credit: "2110", route: "/work-orders", min: 40000, max: 480000 },
];

export const journalEntries: JournalEntry[] = Array.from({ length: 168 }, (_, i) => {
  const t = ENTRY_TEMPLATES[i % ENTRY_TEMPLATES.length]!;
  const offset = -Math.floor(i * 2.1);
  const date = day(offset);
  const amount = money(t.min, t.max, 100);
  const bId = buildingId();
  const cc = pick(costCenters);
  const dr = leafByCode(t.debit);
  const cr = leafByCode(t.credit);
  const entryNo = `JV-2026-${pad(1000 + i, 4)}`;
  const status: JournalEntry["status"] = i < 4 ? "draft" : i % 41 === 0 ? "reversed" : "posted";
  const lines: JournalLine[] = [
    {
      id: `${entryNo}-L1`, accountId: dr.id, accountCode: dr.code, accountName: dr.name,
      debit: amount, credit: 0, buildingId: bId, costCenterId: cc.id, memo: t.desc,
    },
    {
      id: `${entryNo}-L2`, accountId: cr.id, accountCode: cr.code, accountName: cr.name,
      debit: 0, credit: amount, buildingId: bId, costCenterId: cc.id, memo: t.desc,
    },
  ];
  const period = fiscalPeriods.find((p) => date >= p.startDate && date <= p.endDate) ?? currentPeriod;
  return {
    id: entryNo,
    entryNo,
    date,
    description: t.desc,
    reference: `${t.source.toUpperCase().slice(0, 3)}-${pad(int(1000, 9999), 4)}`,
    status,
    source: t.source,
    sourceRef: `${t.source}/${pad(int(100, 999), 3)}`,
    sourceRoute: t.route,
    buildingId: bId,
    costCenterId: cc.id,
    fiscalPeriodId: period.id,
    lines,
    totalDebit: amount,
    totalCredit: amount,
    createdBy: person(),
    createdAt: `${date} ${pad(int(9, 19), 2)}:${pad(int(0, 5) * 10, 2)}`,
  };
});

/* ==================================== AR / AP ================================= */

const agingOf = (days: number): Receivable["aging"] =>
  days <= 0 ? "current" : days <= 30 ? "1-30" : days <= 60 ? "31-60" : days <= 90 ? "61-90" : "90+";

const AR_SOURCES: Receivable["source"][] = [
  "service_charge", "rent", "parking", "utility_recovery", "facility_booking", "community_service", "other",
];

export const receivables: Receivable[] = Array.from({ length: 180 }, (_, i) => {
  const amount = money(3500, 240000, 500);
  const ratio = pick([0, 0, 0.25, 0.5, 0.75, 1, 1] as const);
  const received = Math.round(amount * ratio);
  const outstanding = amount - received;
  const dueOffset = int(-140, 20);
  const daysOverdue = outstanding > 0 ? Math.max(0, -dueOffset) : 0;
  return {
    id: `AR-${pad(3000 + i, 4)}`,
    invoiceNo: `INV-2026-${pad(4000 + i, 4)}`,
    party: person(),
    partyType: pick(["tenant", "owner", "resident"] as const),
    flat: flatCode(),
    buildingId: buildingId(),
    source: AR_SOURCES[i % AR_SOURCES.length]!,
    amount,
    received,
    outstanding,
    issuedOn: day(dueOffset - 30),
    dueOn: day(dueOffset),
    daysOverdue,
    aging: agingOf(daysOverdue),
    status: outstanding === 0 ? "paid" : i % 37 === 0 ? "written_off" : daysOverdue > 0 ? "overdue" : received > 0 ? "partially_paid" : "open",
  };
});

const AP_CATEGORIES = [
  "Security contract", "Cleaning contract", "Lift AMC", "Generator AMC", "Electricity",
  "Water and sewerage", "Gas", "Plumbing works", "Civil works", "Landscaping", "IT and CCTV",
  "Stationery", "Insurance premium",
];

export const payables: Payable[] = Array.from({ length: 140 }, (_, i) => {
  const amount = money(12000, 1800000, 500);
  const ratio = pick([0, 0, 0.4, 1, 1] as const);
  const paid = Math.round(amount * ratio);
  const outstanding = amount - paid;
  const dueOffset = int(-110, 26);
  const daysOverdue = outstanding > 0 ? Math.max(0, -dueOffset) : 0;
  return {
    id: `AP-${pad(2000 + i, 4)}`,
    billNo: `BILL-2026-${pad(700 + i, 4)}`,
    vendor: vendors[i % vendors.length]?.company ?? `${pick(LAST)} Enterprise`,
    vendorType: pick(["vendor", "contractor", "utility", "supplier", "service_provider"] as const),
    buildingId: buildingId(),
    category: AP_CATEGORIES[i % AP_CATEGORIES.length]!,
    amount,
    paid,
    outstanding,
    billedOn: day(dueOffset - 30),
    dueOn: day(dueOffset),
    daysOverdue,
    aging: agingOf(daysOverdue),
    status: outstanding === 0 ? "paid" : i % 29 === 0 ? "on_hold" : daysOverdue > 0 ? "overdue" : paid > 0 ? "partially_paid" : "open",
    poRef: `PO-2026-${pad(300 + i, 4)}`,
  };
});

/* ================================= Cash and bank ============================== */

export const cashBankAccounts: CashBankAccount[] = [
  { id: "CB-01", name: "Operating Account — Community", kind: "bank", bank: "BRAC Bank", accountNo: "1501-2049-8834", branch: "Bashundhara Branch", scope: "Community-wide", openingBalance: 42000000, balance: 58412500, lastReconciledOn: day(-6), reconciliationStatus: "reconciled", status: "active" },
  { id: "CB-02", name: "Reserve and Sinking Fund", kind: "bank", bank: "Dutch-Bangla Bank", accountNo: "2210-9987-4410", branch: "Baridhara Branch", scope: "Community-wide", openingBalance: 120000000, balance: 141250000, lastReconciledOn: day(-14), reconciliationStatus: "in_progress", status: "active" },
  { id: "CB-03", name: "Building ERP Collections", kind: "bank", bank: "City Bank", accountNo: "3320-4471-2280", branch: "Bashundhara Branch", scope: "Buildings A1–D6", openingBalance: 18000000, balance: 23890400, lastReconciledOn: day(-3), reconciliationStatus: "reconciled", status: "active" },
  { id: "CB-04", name: "Marketplace Settlement Account", kind: "bank", bank: "Eastern Bank", accountNo: "4408-1122-9931", branch: "Gulshan Branch", scope: "Marketplace", openingBalance: 6000000, balance: 8115600, lastReconciledOn: day(-9), reconciliationStatus: "pending", status: "active" },
  { id: "CB-05", name: "Community Office Petty Cash", kind: "cash", scope: "Community office", openingBalance: 300000, balance: 184300, lastReconciledOn: day(-1), reconciliationStatus: "reconciled", status: "active" },
  { id: "CB-06", name: "Security Control Room Petty Cash", kind: "cash", scope: "Control room", openingBalance: 150000, balance: 61200, lastReconciledOn: day(-2), reconciliationStatus: "in_progress", status: "active" },
];

export const cashTransactions: CashTransaction[] = cashBankAccounts.flatMap((acc, ai) => {
  let bal = acc.balance;
  return Array.from({ length: 16 }, (_, i) => {
    const kind = pick(["deposit", "withdrawal", "transfer_in", "transfer_out"] as const);
    const amount = money(8000, acc.kind === "cash" ? 45000 : 900000, 100);
    const row: CashTransaction = {
      id: `CT-${ai}-${pad(i, 3)}`,
      accountId: acc.id,
      date: day(-i * 2),
      description: pick([
        "Service charge collection batch", "Vendor payment release", "Payroll disbursement",
        "Utility bill payment", "Marketplace settlement", "Fund transfer to reserve",
        "Facility booking receipt", "Petty cash replenishment",
      ] as const),
      reference: `TRX-${pad(int(10000, 99999), 5)}`,
      kind,
      amount,
      balance: bal,
      matched: i % 7 !== 0,
    };
    bal -= kind === "deposit" || kind === "transfer_in" ? amount : -amount;
    return row;
  });
});

export const bankStatementLines: BankStatementLine[] = cashTransactions
  .filter((t) => t.accountId !== "CB-05" && t.accountId !== "CB-06")
  .map((t, i) => ({
    id: `BSL-${pad(i, 4)}`,
    accountId: t.accountId,
    date: t.date,
    description: t.description,
    reference: t.reference,
    debit: t.kind === "withdrawal" || t.kind === "transfer_out" ? t.amount : 0,
    credit: t.kind === "deposit" || t.kind === "transfer_in" ? t.amount : 0,
    matchStatus: t.matched ? "matched" : i % 3 === 0 ? "resolved" : "unmatched",
    matchedTxnId: t.matched ? t.id : undefined,
  }));

export const pettyCashEntries: PettyCashEntry[] = (() => {
  let bal = 260000;
  return Array.from({ length: 96 }, (_, i) => {
    const kind = i % 9 === 0 ? "replenishment" : "expense";
    const amount = kind === "replenishment" ? money(20000, 60000, 1000) : money(300, 9500, 100);
    bal += kind === "replenishment" ? amount : -amount;
    return {
      id: `PC-${pad(1000 + i, 4)}`,
      date: day(-i),
      buildingId: buildingId(),
      purpose: pick([
        "Cleaning supplies", "Plumbing spares", "Tea and refreshments for meeting", "Courier charges",
        "Photocopy and printing", "Light bulbs replacement", "Fuel for generator top-up",
        "Emergency electrician call-out", "Gate register books", "First aid restock",
      ] as const),
      category: pick(["Maintenance", "Administration", "Cleaning", "Security", "Utilities"] as const),
      kind,
      amount,
      balanceAfter: bal,
      submittedBy: person(),
      receiptRef: `RCPT-${pad(int(1000, 9999), 4)}`,
      approvalStatus: i % 11 === 0 ? "pending" : i % 23 === 0 ? "rejected" : "approved",
      approver: "Accounts Controller",
    };
  });
})();

/* ============================== Fixed assets =============================== */

const ASSET_SEED = [
  ["Passenger Lift", "Lift", 4200000, 20], ["Service Lift", "Lift", 3600000, 20],
  ["Diesel Generator 250kVA", "Generator", 5400000, 15], ["Substation Transformer", "Electrical", 6800000, 25],
  ["Water Pump Set", "Pump", 720000, 10], ["Deep Tube Well", "Water", 3200000, 25],
  ["CCTV Camera Array", "Security", 1450000, 8], ["Boom Barrier", "Security", 480000, 10],
  ["Fire Pump System", "Fire Safety", 2100000, 15], ["Solar Panel Array", "Environment", 2600000, 20],
  ["STP Plant", "Environment", 4800000, 20], ["Community Hall AC System", "HVAC", 1900000, 12],
] as const;

export const fixedAssets: FixedAsset[] = Array.from({ length: 96 }, (_, i) => {
  const [name, category, baseCost, life] = ASSET_SEED[i % ASSET_SEED.length]!;
  const cost = Math.round(baseCost * (0.85 + rnd() * 0.4));
  const months = int(4, life * 12 - 12);
  const salvage = Math.round(cost * 0.08);
  const monthly = (cost - salvage) / (life * 12);
  const accumulated = Math.round(monthly * months);
  return {
    id: `FA-${pad(1000 + i, 4)}`,
    name: `${name} — ${buildings[i % buildings.length]!.name}`,
    category,
    buildingId: buildings[i % buildings.length]!.id,
    vendor: vendors[i % vendors.length]?.company ?? "Bashundhara Engineering",
    purchaseCost: cost,
    purchaseDate: day(-months * 30),
    usefulLifeYears: life,
    method: i % 5 === 0 ? "reducing_balance" : "straight_line",
    salvageValue: salvage,
    monthsInService: months,
    accumulatedDepreciation: accumulated,
    bookValue: cost - accumulated,
    warrantyUntil: day(int(-400, 700)),
    condition: pick(["excellent", "good", "good", "fair", "poor"] as const),
    lifecycle: pick(["capitalized", "assigned", "assigned", "in_maintenance", "received"] as const),
    status: i % 31 === 0 ? "inactive" : "active",
  };
});

export const depreciationRows: DepreciationRow[] = fixedAssets.map((a, i) => ({
  id: `DEP-${pad(1000 + i, 4)}`,
  assetId: a.id,
  asset: a.name,
  category: a.category,
  buildingId: a.buildingId,
  cost: a.purchaseCost,
  usefulLifeYears: a.usefulLifeYears,
  method: a.method,
  monthlyDepreciation: Math.round((a.purchaseCost - a.salvageValue) / (a.usefulLifeYears * 12)),
  accumulated: a.accumulatedDepreciation,
  netBookValue: a.bookValue,
  lastPostedOn: day(-int(1, 30)),
  status: i % 6 === 0 ? "scheduled" : "posted",
}));

/* =============================== Projects (job cost) ========================== */

export const accountingProjects: AccountingProject[] = Array.from({ length: 26 }, (_, i) => {
  const budget = money(1500000, 42000000, 50000);
  const purchases = Math.round(budget * (0.15 + rnd() * 0.25));
  const labor = Math.round(budget * (0.1 + rnd() * 0.2));
  const vendorCost = Math.round(budget * (0.1 + rnd() * 0.3));
  const otherExpense = Math.round(budget * rnd() * 0.1);
  const actual = purchases + labor + vendorCost + otherExpense;
  return {
    id: `PRJ-${pad(400 + i, 4)}`,
    name: pick([
      "Lift modernisation", "Road resurfacing", "Drainage upgrade", "CCTV expansion",
      "Rooftop solar installation", "Facade repainting", "Fire safety retrofit",
      "Playground renovation", "STP capacity upgrade", "Substation replacement",
      "Community hall refurbishment", "Water reservoir cleaning programme",
    ] as const) + ` — Phase ${int(1, 3)}`,
    buildingId: buildingId(),
    category: pick(["Civil", "Electrical", "Mechanical", "Safety", "Environment"] as const),
    startDate: day(-int(60, 420)),
    endDate: day(int(-30, 260)),
    budget,
    purchases,
    labor,
    vendorCost,
    otherExpense,
    actual,
    remaining: budget - actual,
    variance: budget - actual,
    status: pick(["planning", "in_progress", "in_progress", "on_hold", "completed"] as const),
  };
});

/* ================================ Settlements ================================= */

export const settlements: Settlement[] = serviceOrders.slice(0, 64).map((o, i) => {
  const orderAmount = (o as { amount?: number }).amount ?? money(500, 18000, 100);
  const rate = pick([8, 10, 12, 15] as const);
  const commission = Math.round((orderAmount * rate) / 100);
  const refund = i % 13 === 0 ? Math.round(orderAmount * 0.25) : 0;
  return {
    id: `STL-${pad(1000 + i, 4)}`,
    orderId: o.id,
    provider: (o as { providerName?: string }).providerName ?? `Provider ${i + 1}`,
    resident: person(),
    flat: flatCode(),
    orderAmount,
    commissionRate: rate,
    commission,
    providerPayable: orderAmount - commission - refund,
    communityShare: commission,
    refund,
    status: pick(["pending", "held", "approved", "settled", "settled", "refunded", "disputed"] as const),
    settlementDate: day(-int(0, 60)),
    method: pick(["bank_transfer", "mobile_wallet", "cash"] as const),
  };
});

export const adjustments: Adjustment[] = Array.from({ length: 72 }, (_, i) => {
  const original = money(1500, 220000, 500);
  const kind = pick([
    "full_refund", "partial_refund", "credit_note", "debit_note", "overpayment",
    "deposit_refund", "cancellation", "payment_reversal",
  ] as const);
  const amount = kind === "full_refund" ? original : Math.round(original * (0.2 + rnd() * 0.6));
  return {
    id: `ADJ-${pad(1000 + i, 4)}`,
    date: day(-int(0, 180)),
    kind,
    reference: pick([`INV-2026-${pad(4000 + i, 4)}`, `ORD-${pad(1000 + i, 4)}`, `BILL-2026-${pad(700 + i, 4)}`]),
    party: person(),
    originalAmount: original,
    amount,
    reason: pick([
      "Service not delivered as agreed", "Duplicate payment received", "Tenant moved out early",
      "Booking cancelled within free window", "Billing correction after meter re-read",
      "Dispute resolved in favour of resident", "Vendor overbilled against PO",
    ] as const),
    status: pick(["requested", "approved", "posted", "posted", "rejected"] as const),
    postedEntry: i % 3 === 0 ? `JV-2026-${pad(1000 + i, 4)}` : undefined,
  };
});

/* =============================== Accounting audit ============================= */

export const accountingAudit: AccountingAuditEvent[] = Array.from({ length: 140 }, (_, i) => {
  const action = pick([
    "journal.posted", "journal.reversed", "journal.draft_saved", "period.closed", "period.reopened",
    "account.created", "account.updated", "payment.recorded", "bill.approved", "refund.approved",
    "reconciliation.completed", "budget.revised", "asset.capitalized", "depreciation.run",
  ] as const);
  return {
    id: `AAU-${pad(1000 + i, 4)}`,
    timestamp: stamp(-Math.floor(i / 3)),
    user: person(),
    role: pick(["Accountant", "Finance Manager", "Super Admin", "Building Manager", "Auditor"] as const),
    action,
    entity: action.split(".")[0]!,
    entityId: `JV-2026-${pad(1000 + i, 4)}`,
    source: pick(["manual", "invoice", "payment", "expense", "depreciation", "procurement"] as const),
    before: pick(["draft", "open", "unposted", "৳0", "pending"] as const),
    after: pick(["posted", "closed", "approved", "reconciled", "capitalized"] as const),
  };
});

/* ======================= Identity: unified person registry ==================== */

const REL_KINDS: RelationshipKind[] = [
  "owner", "tenant", "resident", "family_member", "domestic_worker",
  "service_provider", "security_officer", "building_staff", "caretaker", "vendor_contact",
];

export const people: Person[] = Array.from({ length: 260 }, (_, i) => {
  const primary = REL_KINDS[i % REL_KINDS.length]!;
  const name = person();
  const relCount = int(1, 3);
  const relationships: PersonRelationship[] = Array.from({ length: relCount }, (_, r) => ({
    id: `PRL-${pad(i, 4)}-${r}`,
    kind: r === 0 ? primary : pick(REL_KINDS),
    target: r === 0 ? flatCode() : pick([flatCode(), buildingId(), "Bashundhara R/A"]),
    targetType: r === 0 ? "flat" : pick(["flat", "building", "household", "organization", "community"] as const),
    since: day(-int(60, 2200)),
    until: r > 0 && rnd() > 0.7 ? day(int(30, 500)) : undefined,
    status: "active",
  }));
  return {
    id: `PSN-${pad(1000 + i, 4)}`,
    name,
    nameBn: personBn(),
    phone: phone(),
    email: `${name.split(" ")[0]!.toLowerCase()}.${pad(i, 3)}@bashundhara-ra.bd`,
    nid: nid(),
    dob: `${int(1955, 2012)}-${pad(int(1, 12), 2)}-${pad(int(1, 28), 2)}`,
    gender: pick(["male", "female"] as const),
    photoInitials: name.split(" ").map((p) => p[0]).join(""),
    primaryRole: primary,
    relationships,
    households: [`HH-${pad(int(1, 180), 4)}`],
    occupancies: [flatCode()],
    accessLevel: pick(["permanent", "permanent", "temporary", "restricted", "none"] as const),
    verification: i % 9 === 0 ? "pending" : i % 47 === 0 ? "rejected" : "verified",
    status: i % 29 === 0 ? "inactive" : "active",
    registeredOn: day(-int(30, 1800)),
  };
});

/* =============================== Metering ==================================== */

export const meters: Meter[] = Array.from({ length: 200 }, (_, i) => {
  const type = pick(["electricity", "water", "gas", "generator"] as const);
  const rate = type === "electricity" ? 9.2 : type === "water" ? 18.5 : type === "gas" ? 26 : 14.5;
  const previous = int(1200, 68000);
  const consumption = int(35, 780);
  const current = previous + consumption;
  return {
    id: `MTR-${pad(1000 + i, 4)}`,
    serial: `${type.slice(0, 2).toUpperCase()}-${pad(int(100000, 999999), 6)}`,
    type,
    scope: pick(["flat", "flat", "common", "building"] as const),
    buildingId: buildingId(),
    flat: flatCode(),
    installedOn: day(-int(200, 2000)),
    previousReading: previous,
    currentReading: current,
    consumption,
    rate,
    amount: Math.round(consumption * rate),
    lastReadOn: day(-int(0, 32)),
    billingStatus: pick(["unbilled", "billed", "billed", "paid"] as const),
    status: i % 33 === 0 ? "inactive" : "active",
  };
});

export const meterReadings: MeterReading[] = meters.flatMap((m, mi) =>
  Array.from({ length: 6 }, (_, k) => {
    const consumption = int(30, 720);
    return {
      id: `MRD-${pad(mi, 4)}-${k}`,
      meterId: m.id,
      readOn: day(-k * 30 - int(0, 4)),
      reading: m.currentReading - k * consumption,
      consumption,
      readBy: person(),
      amount: Math.round(consumption * m.rate),
    };
  }),
);

/* ================================= Inventory ================================== */

export const warehouses: Warehouse[] = [
  { id: "WH-01", name: "Central Maintenance Store", location: "Block C Service Yard", keeper: person(), itemCount: 0, stockValue: 0, status: "active" },
  { id: "WH-02", name: "Electrical Store", location: "Substation Building", keeper: person(), itemCount: 0, stockValue: 0, status: "active" },
  { id: "WH-03", name: "Plumbing and Sanitary Store", location: "Block G Basement", keeper: person(), itemCount: 0, stockValue: 0, status: "active" },
  { id: "WH-04", name: "Cleaning and Consumables Store", location: "Community Office", keeper: person(), itemCount: 0, stockValue: 0, status: "active" },
  { id: "WH-05", name: "Security Equipment Store", location: "Control Room Annex", keeper: person(), itemCount: 0, stockValue: 0, status: "active" },
];

const ITEM_SEED = [
  ["LED Tube Light 20W", "Electrical", "pcs", 320], ["Circuit Breaker 32A", "Electrical", "pcs", 1450],
  ["Copper Cable 2.5mm", "Electrical", "meter", 92], ["PVC Pipe 4 inch", "Plumbing", "meter", 480],
  ["Ball Valve 1 inch", "Plumbing", "pcs", 640], ["Submersible Pump Seal", "Plumbing", "pcs", 2200],
  ["Floor Cleaner 5L", "Cleaning", "can", 780], ["Garbage Bag Roll", "Cleaning", "roll", 260],
  ["Hand Sanitizer 500ml", "Cleaning", "bottle", 340], ["Fire Extinguisher Refill", "Safety", "unit", 2600],
  ["Smoke Detector", "Safety", "pcs", 1850], ["CCTV Camera Dome", "Security", "pcs", 8400],
  ["Access Card Blank", "Security", "pcs", 120], ["Walkie Talkie Battery", "Security", "pcs", 1400],
  ["Lift Door Roller", "Mechanical", "pcs", 3100], ["Generator Oil Filter", "Mechanical", "pcs", 1750],
  ["Paint Emulsion 20L", "Civil", "bucket", 6200], ["Cement Bag 50kg", "Civil", "bag", 560],
  ["Sand (cft)", "Civil", "cft", 48], ["Gate Register Book", "Administration", "pcs", 180],
] as const;

export const inventoryItems: InventoryItem[] = Array.from({ length: 120 }, (_, i) => {
  const [name, category, unit, cost] = ITEM_SEED[i % ITEM_SEED.length]!;
  const wh = warehouses[i % warehouses.length]!;
  const minimum = int(10, 60);
  const reorder = minimum + int(10, 40);
  const quantity = pick([0, int(1, minimum - 1), int(minimum, reorder), int(reorder, reorder + 400)]);
  const unitCost = Math.round(cost * (0.9 + rnd() * 0.3));
  return {
    id: `ITM-${pad(1000 + i, 4)}`,
    sku: `SKU-${category.slice(0, 3).toUpperCase()}-${pad(100 + i, 4)}`,
    name,
    category,
    unit,
    warehouse: wh.name,
    quantity,
    minimumStock: minimum,
    reorderLevel: reorder,
    unitCost,
    stockValue: quantity * unitCost,
    stockStatus: quantity === 0 ? "out_of_stock" : quantity < minimum ? "low" : quantity <= reorder ? "reorder" : "in_stock",
    status: "active",
  };
});

for (const wh of warehouses) {
  const items = inventoryItems.filter((it) => it.warehouse === wh.name);
  wh.itemCount = items.length;
  wh.stockValue = items.reduce((s, it) => s + it.stockValue, 0);
}

export const stockMovements: StockMovement[] = Array.from({ length: 220 }, (_, i) => {
  const item = inventoryItems[i % inventoryItems.length]!;
  const kind = pick(["purchase", "issue", "consumption", "adjustment", "transfer"] as const);
  const quantity = int(1, 40);
  return {
    id: `STM-${pad(1000 + i, 4)}`,
    date: day(-int(0, 120)),
    itemId: item.id,
    item: item.name,
    warehouse: item.warehouse,
    kind,
    quantity: kind === "purchase" ? quantity : -quantity,
    balanceAfter: Math.max(0, item.quantity + int(-20, 20)),
    reference: kind === "purchase" ? `GRN-2026-${pad(200 + i, 4)}` : `WO-${pad(1000 + i, 4)}`,
    actor: person(),
  };
});

/* ================================ Procurement ================================= */

export const procurementRecords: ProcurementRecord[] = Array.from({ length: 88 }, (_, i) => {
  const stage = pick(["request", "approval", "purchase_order", "goods_receipt", "vendor_bill", "payable", "paid"] as const);
  return {
    id: `PRC-${pad(1000 + i, 4)}`,
    title: pick([
      "Lift spare parts procurement", "Annual cleaning supplies", "CCTV camera replacement lot",
      "Generator servicing kit", "Fire extinguisher refill batch", "Landscaping plants and soil",
      "Security uniforms", "Water pump overhaul parts", "Paint and civil materials",
      "Office stationery quarterly", "Access card printer consumables",
    ] as const),
    vendor: vendors[i % vendors.length]?.company ?? "Bashundhara Traders",
    buildingId: buildingId(),
    category: pick(["Electrical", "Mechanical", "Civil", "Cleaning", "Security", "Administration"] as const),
    amount: money(18000, 2600000, 500),
    requestedBy: person(),
    requestedOn: day(-int(1, 180)),
    stage,
    poNo: `PO-2026-${pad(300 + i, 4)}`,
    grnNo: `GRN-2026-${pad(200 + i, 4)}`,
    billNo: `BILL-2026-${pad(700 + i, 4)}`,
    capitalized: i % 6 === 0,
    status: stage === "paid" ? "completed" : i % 19 === 0 ? "rejected" : "open",
  };
});

/* ============================== SLA and escalation ============================ */

const SLA_SEED: [string, string, SlaRule["priority"], number][] = [
  ["Emergency SOS response", "Emergency", "emergency", 5],
  ["Fire alarm response", "Fire Safety", "emergency", 8],
  ["Security incident response", "Security", "critical", 15],
  ["Lift entrapment rescue", "Maintenance", "critical", 20],
  ["Water supply failure", "Maintenance", "high", 120],
  ["Power outage — common area", "Maintenance", "high", 90],
  ["Plumbing leak", "Maintenance", "normal", 240],
  ["Electrical complaint", "Maintenance", "normal", 240],
  ["Cleaning complaint", "Housekeeping", "low", 480],
  ["Visitor approval turnaround", "Security", "normal", 10],
  ["Service order acceptance", "Marketplace", "normal", 30],
  ["Handover pickup confirmation", "Marketplace", "high", 45],
  ["Invoice dispute resolution", "Finance", "normal", 2880],
  ["Purchase approval", "Procurement", "normal", 1440],
];

export const slaRules: SlaRule[] = SLA_SEED.map(([name, module, priority, target], i) => ({
  id: `SLA-${pad(100 + i, 3)}`,
  name,
  module,
  priority,
  targetMinutes: target,
  escalationChain: pick([
    ["Supervisor", "Manager", "Super Admin"],
    ["Team Lead", "Department Head", "Community Admin"],
    ["Caretaker", "Building Manager", "Property Manager"],
  ] as const).slice(),
  businessHoursOnly: priority === "low" || module === "Finance",
  status: "active",
}));

export const slaTickets: SlaTicket[] = Array.from({ length: 140 }, (_, i) => {
  const rule = slaRules[i % slaRules.length]!;
  const elapsed = int(1, Math.round(rule.targetMinutes * 2.4));
  const breached = elapsed > rule.targetMinutes;
  return {
    id: `TKT-${pad(4000 + i, 4)}`,
    subject: `${rule.name} — ${flatCode()}`,
    module: rule.module,
    priority: rule.priority,
    department: pick(["Security", "Maintenance", "Housekeeping", "Finance", "Marketplace", "Administration"] as const),
    team: pick(["Team Alpha", "Team Bravo", "Team Charlie", "Night Shift", "Rapid Response"] as const),
    openedAt: stamp(-int(0, 20)),
    targetMinutes: rule.targetMinutes,
    elapsedMinutes: elapsed,
    remainingMinutes: rule.targetMinutes - elapsed,
    breached,
    escalationLevel: breached ? int(1, 3) : 0,
    status: pick(["open", "in_progress", "in_progress", "resolved", "closed"] as const),
  };
});

export const escalationRules: EscalationRule[] = Array.from({ length: 18 }, (_, i) => ({
  id: `ESC-${pad(100 + i, 3)}`,
  name: pick([
    "Unacknowledged emergency", "SLA breach — maintenance", "Overdue visitor approval",
    "Handover not confirmed", "Unresolved dispute", "Overdue payable", "Stalled purchase approval",
    "Repeat complaint from same flat", "Patrol checkpoint missed",
  ] as const) + ` L${int(1, 3)}`,
  module: pick(["Emergency", "Maintenance", "Security", "Marketplace", "Finance", "Procurement"] as const),
  trigger: pick(["no_acknowledgement", "sla_breach", "repeat_incident", "threshold_exceeded"] as const),
  afterMinutes: pick([5, 15, 30, 60, 120, 480, 1440] as const),
  levels: [
    { level: 1, role: "Supervisor", action: "Notify and reassign" },
    { level: 2, role: "Department Manager", action: "Take ownership" },
    { level: 3, role: "Community Admin", action: "Executive review" },
  ],
  status: "active",
}));

/* =============================== Workflow engine ============================== */

const WF_TYPES = [
  "Purchase request", "Budget revision", "Vendor onboarding", "Refund approval",
  "Tenant move-in", "Tenant move-out", "Domestic worker pass", "Service provider verification",
  "Journal posting", "Period close", "Expense claim", "Construction NOC",
];

export const workflowInstances = Array.from({ length: 84 }, (_, i) => {
  const chain = [
    { role: "Requester", action: "review" as const },
    { role: "Department Head", action: "approve" as const },
    { role: "Finance Manager", action: "verify" as const },
    { role: "Community Admin", action: "approve" as const },
  ];
  const current = int(1, chain.length);
  const rejected = i % 17 === 0;
  return {
    id: `WFI-${pad(1000 + i, 4)}`,
    type: WF_TYPES[i % WF_TYPES.length]!,
    subject: pick([
      "Lift spare parts", "Q3 security budget", "New cleaning vendor", "Order refund request",
      "Flat B-704 move-in", "Domestic worker pass renewal", "August depreciation run",
      "Facade painting contract", "CCTV expansion phase 2",
    ] as const),
    requestedBy: person(),
    requestedOn: day(-int(0, 60)),
    amount: money(5000, 3200000, 500),
    currentStep: current,
    steps: chain.map((c, si) => ({
      step: si + 1,
      role: c.role,
      action: si < current ? c.action : "pending",
      actor: si < current ? person() : "—",
      comment: si < current ? pick(["Verified and forwarded.", "Within approved budget.", "Quotation comparison attached.", "Requires vendor tax certificate."] as const) : "",
      timestamp: si < current ? stamp(-int(0, 30)) : "",
      state: rejected && si === current - 1 ? ("rejected" as const)
        : si < current - 1 ? ("completed" as const)
        : si === current - 1 ? ("current" as const)
        : ("upcoming" as const),
    })),
    status: rejected ? ("rejected" as const) : current === chain.length ? ("approved" as const) : ("pending" as const),
  };
});

/* ================================= Access model =============================== */

export const accessZones: AccessZone[] = [
  { id: "ZN-COM", name: "Bashundhara R/A", kind: "community", parent: "—", restricted: false, description: "Whole community perimeter.", status: "active" },
  ...["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].map((b) => ({
    id: `ZN-BLK-${b}`, name: `Block ${b}`, kind: "block" as const, parent: "Bashundhara R/A",
    restricted: false, description: `Residential block ${b} with internal roads.`, status: "active" as const,
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `ZN-GATE-${i + 1}`, name: `Gate ${i + 1}`, kind: "gate" as const, parent: "Bashundhara R/A",
    restricted: true, description: `Controlled entry point ${i + 1} with barrier and ANPR.`, status: "active" as const,
  })),
  ...buildings.slice(0, 12).map((b) => ({
    id: `ZN-${b.id}`, name: b.name, kind: "building" as const, parent: "Block A",
    restricted: false, description: "Building lobby, lifts and floors.", status: "active" as const,
  })),
  { id: "ZN-CP-1", name: "Collection Point — North", kind: "collection_point", parent: "Block C", restricted: true, description: "Marketplace handover collection point.", status: "active" },
  { id: "ZN-CP-2", name: "Collection Point — South", kind: "collection_point", parent: "Block G", restricted: true, description: "Marketplace handover collection point.", status: "active" },
  { id: "ZN-PRK-1", name: "Visitor Parking Zone", kind: "parking", parent: "Bashundhara R/A", restricted: false, description: "Time-limited visitor parking.", status: "active" },
  { id: "ZN-RST-1", name: "Substation and Plant Room", kind: "restricted", parent: "Bashundhara R/A", restricted: true, description: "Authorised engineering staff only.", status: "active" },
  { id: "ZN-RST-2", name: "Control Room", kind: "restricted", parent: "Bashundhara R/A", restricted: true, description: "Security control room, CCTV wall.", status: "active" },
];

export const accessPolicies: AccessPolicy[] = Array.from({ length: 96 }, (_, i) => ({
  id: `APL-${pad(1000 + i, 4)}`,
  name: pick([
    "Domestic worker daily access", "Service provider pickup window", "Delivery rider gate access",
    "Contractor works access", "Guest overnight access", "Vendor maintenance visit",
    "Tenant permanent access", "Event supplier access",
  ] as const),
  personType: pick(["Domestic worker", "Service provider", "Delivery rider", "Contractor", "Guest", "Vendor", "Tenant"] as const),
  purpose: pick(["Household work", "Order pickup", "Delivery", "Repair works", "Social visit", "AMC servicing"] as const),
  property: flatCode(),
  gate: `Gate ${int(1, 6)}`,
  allowedZones: [pick(accessZones).name, pick(accessZones).name],
  deniedZones: ["Substation and Plant Room", "Control Room"],
  validFrom: day(-int(1, 200)),
  validTo: day(int(-20, 300)),
  windowStart: `${pad(int(6, 10), 2)}:00`,
  windowEnd: `${pad(int(17, 22), 2)}:00`,
  days: pick(["Sat–Thu", "Everyday", "Fri only", "Mon–Fri"] as const),
  oneTime: i % 7 === 0,
  status: i % 11 === 0 ? "expired" : i % 23 === 0 ? "suspended" : "active",
}));

/* ============================== Cost allocation =============================== */

export const allocationRules: AllocationRule[] = Array.from({ length: 34 }, (_, i) => {
  const method = pick(["equal", "flat_size", "meter_consumption", "percentage", "fixed", "custom"] as const);
  return {
    id: `ALR-${pad(100 + i, 4)}`,
    name: pick([
      "Common area electricity", "Lift running cost", "Generator fuel", "Water pumping cost",
      "Security guarding share", "Cleaning contract share", "Landscaping share", "Waste removal share",
      "Building insurance share", "Sinking fund contribution",
    ] as const),
    costType: pick(["Utility", "Contract", "Maintenance", "Fund", "Administration"] as const),
    method,
    buildingId: buildingId(),
    amount: money(40000, 1800000, 500),
    targets: int(12, 96),
    lastRunOn: day(-int(1, 40)),
    posted: i % 3 !== 0,
    status: "active",
  };
});

export const allocationResults: AllocationResult[] = allocationRules.flatMap((r, ri) =>
  Array.from({ length: 8 }, (_, k) => {
    const share = Math.round((100 / 8) * (0.7 + rnd() * 0.6) * 100) / 100;
    return {
      id: `ALO-${pad(ri, 3)}-${k}`,
      ruleId: r.id,
      flat: flatCode(),
      basis: r.method === "flat_size" ? `${int(900, 2400)} sqft`
        : r.method === "meter_consumption" ? `${int(40, 620)} units`
        : r.method === "equal" ? "1 of 8 flats" : `${share}%`,
      share,
      amount: Math.round((r.amount * share) / 100),
    };
  }),
);

/* ============================ Emergency dispatch ============================== */

export const dispatchRecords: DispatchRecord[] = Array.from({ length: 58 }, (_, i) => {
  const reportedAt = stamp(-int(0, 30));
  const responseMinutes = int(2, 34);
  const stage = pick(["reported", "classified", "dispatched", "acknowledged", "responding", "on_scene", "resolved", "closed"] as const);
  return {
    id: `DSP-${pad(1000 + i, 4)}`,
    sosRef: `SOS-${pad(500 + i, 4)}`,
    category: pick(["medical", "fire", "security", "accident", "other"] as const),
    severity: pick(["critical", "high", "medium"] as const),
    reportedBy: person(),
    location: `${flatCode()} · Block ${pick(["A", "B", "C", "D", "E", "F", "G"] as const)}`,
    reportedAt,
    team: pick(["Rapid Response A", "Rapid Response B", "Medical Team", "Fire Team", "Patrol Unit 3"] as const),
    officer: person(),
    stage,
    responseMinutes,
    outcome: pick([
      "Ambulance dispatched to Apollo Hospital", "Fire contained, no casualties",
      "Trespasser handed to police", "Minor injury treated on site", "False alarm, system reset",
    ] as const),
    timeline: [
      { at: reportedAt, label: "SOS received", actor: "Control Room" },
      { at: reportedAt, label: "Classified and prioritised", actor: "Duty Officer" },
      { at: reportedAt, label: "Team dispatched", actor: "Dispatcher" },
      { at: reportedAt, label: "On scene", actor: "Response Team" },
      { at: reportedAt, label: "Resolved and logged", actor: "Duty Officer" },
    ],
  };
});

/* ================================= Compliance ================================= */

export const complianceDocuments: ComplianceDocument[] = Array.from({ length: 120 }, (_, i) => {
  const daysToExpiry = int(-120, 420);
  return {
    id: `CDX-${pad(1000 + i, 4)}`,
    name: pick([
      "Fire safety certificate", "Lift operation licence", "Generator emission clearance",
      "Trade licence", "Vendor tax certificate (BIN)", "Insurance policy", "Building occupancy certificate",
      "Service provider verification", "Security guard licence", "Environmental clearance",
      "Tenancy agreement", "AMC contract",
    ] as const),
    category: pick(["Licence", "Certificate", "Contract", "Insurance", "Verification"] as const),
    entity: pick([`Building ${pick(["A1", "B2", "C3", "D4"] as const)}`, vendors[i % vendors.length]?.company ?? "Vendor", flatCode()]),
    entityType: pick(["Building", "Vendor", "Flat", "Provider", "Community"] as const),
    issuedOn: day(daysToExpiry - 365),
    expiresOn: day(daysToExpiry),
    daysToExpiry,
    state: daysToExpiry < 0 ? "expired" : daysToExpiry <= 45 ? "expiring_soon" : "valid",
    owner: person(),
    status: "active",
  };
});

/* ========================== Notification and routing ========================== */

export const notificationRules: NotificationRule[] = Array.from({ length: 26 }, (_, i) => ({
  id: `NRL-${pad(100 + i, 3)}`,
  event: pick([
    "visitor.approval_requested", "emergency.raised", "invoice.issued", "payment.received",
    "complaint.created", "complaint.sla_breached", "order.handover_ready", "pass.expiring",
    "document.expiring", "budget.threshold_exceeded", "journal.posted", "meeting.scheduled",
    "poll.published", "workflow.approval_pending",
  ] as const),
  audience: pick([
    ["Resident"], ["Resident", "Caretaker"], ["Security Officer", "Security Admin"],
    ["Finance Manager", "Accountant"], ["Community Admin", "Super Admin"], ["Building Manager", "Building Owner"],
  ] as const).slice(),
  channels: pick([
    ["in_app", "push"], ["in_app", "sms"], ["in_app", "push", "sms"], ["in_app", "email"],
  ] as const).slice(),
  template: pick(["Standard", "Urgent", "Digest", "Reminder"] as const),
  throttle: pick(["Immediate", "Max 1/hour", "Daily digest", "Max 3/day"] as const),
  status: i % 13 === 0 ? "inactive" : "active",
}));

export const routingRules: RoutingRule[] = Array.from({ length: 22 }, (_, i) => ({
  id: `RRL-${pad(100 + i, 3)}`,
  category: pick([
    "Electrical", "Plumbing", "Lift", "Cleaning", "Security", "Waste", "Landscaping",
    "Water supply", "Structural", "Pest control", "IT and network",
  ] as const),
  department: pick(["Maintenance", "Housekeeping", "Security", "Engineering", "Administration"] as const),
  team: pick(["Team Alpha", "Team Bravo", "Team Charlie", "Night Shift", "Rapid Response"] as const),
  slaPriority: pick(["emergency", "critical", "high", "normal", "low"] as const),
  escalation: pick(["Supervisor → Manager → Admin", "Team Lead → Head → Admin"] as const),
  status: "active",
}));
