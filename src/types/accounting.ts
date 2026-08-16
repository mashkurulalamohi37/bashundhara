/**
 * Accounting engine + enterprise control layer types.
 * Frontend-only contracts, shaped 1:1 with the future REST API.
 */

/* ----------------------------- Chart of accounts ---------------------------- */

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";
export type NormalBalance = "debit" | "credit";
export type RecordStatus = "active" | "inactive" | "archived" | "suspended" | "expired";

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentId: string | null;
  level: number;
  isGroup: boolean;
  normalBalance: NormalBalance;
  status: RecordStatus;
  description: string;
  balance: number;
  currency: "BDT";
}

/* ------------------------------ Journal entries ----------------------------- */

export type JournalStatus = "draft" | "posted" | "reversed" | "void";
export type SourceModule =
  | "manual" | "rent" | "invoice" | "payment" | "expense" | "vendor_bill"
  | "procurement" | "service_order" | "depreciation" | "utility" | "petty_cash"
  | "adjustment" | "opening";

export interface JournalLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  buildingId?: string | undefined;
  costCenterId?: string | undefined;
  projectId?: string | undefined;
  memo?: string | undefined;
}

export interface JournalEntry {
  id: string;
  entryNo: string;
  date: string;
  description: string;
  reference: string;
  status: JournalStatus;
  source: SourceModule;
  sourceRef?: string | undefined;
  sourceRoute?: string | undefined;
  buildingId?: string | undefined;
  costCenterId?: string | undefined;
  projectId?: string | undefined;
  fiscalPeriodId: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  createdBy: string;
  createdAt: string;
  reversalOf?: string | undefined;
}

export interface LedgerRow {
  id: string;
  date: string;
  entryNo: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  buildingId?: string | undefined;
  costCenter?: string;
  entryId: string;
}

/* --------------------------------- AR / AP ---------------------------------- */

export type AgingBucket = "current" | "1-30" | "31-60" | "61-90" | "90+";
export type ReceivableSource =
  | "rent" | "service_charge" | "parking" | "utility_recovery" | "facility_booking"
  | "community_service" | "other";

export interface Receivable {
  id: string;
  invoiceNo: string;
  party: string;
  partyType: "tenant" | "owner" | "resident" | "vendor" | "other";
  flat: string;
  buildingId: string;
  source: ReceivableSource;
  amount: number;
  received: number;
  outstanding: number;
  issuedOn: string;
  dueOn: string;
  daysOverdue: number;
  aging: AgingBucket;
  status: "open" | "partially_paid" | "paid" | "overdue" | "written_off";
}

export interface Payable {
  id: string;
  billNo: string;
  vendor: string;
  vendorType: "vendor" | "contractor" | "utility" | "supplier" | "service_provider" | "other";
  buildingId: string;
  category: string;
  amount: number;
  paid: number;
  outstanding: number;
  billedOn: string;
  dueOn: string;
  daysOverdue: number;
  aging: AgingBucket;
  status: "open" | "partially_paid" | "paid" | "overdue" | "on_hold";
  poRef?: string | undefined;
}

/* ------------------------------- Cash and bank ------------------------------ */

export interface CashBankAccount {
  id: string;
  name: string;
  kind: "bank" | "cash";
  bank?: string | undefined;
  accountNo?: string | undefined;
  branch?: string | undefined;
  scope: string;
  openingBalance: number;
  balance: number;
  lastReconciledOn: string;
  reconciliationStatus: "reconciled" | "in_progress" | "pending";
  status: RecordStatus;
}

export interface CashTransaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  reference: string;
  kind: "deposit" | "withdrawal" | "transfer_in" | "transfer_out";
  amount: number;
  balance: number;
  matched: boolean;
}

export interface BankStatementLine {
  id: string;
  accountId: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  matchStatus: "matched" | "unmatched" | "resolved";
  matchedTxnId?: string | undefined;
}

export interface PettyCashEntry {
  id: string;
  date: string;
  buildingId: string;
  purpose: string;
  category: string;
  kind: "expense" | "replenishment" | "opening";
  amount: number;
  balanceAfter: number;
  submittedBy: string;
  receiptRef: string;
  approvalStatus: "pending" | "approved" | "rejected";
  approver: string;
}

/* --------------------------- Reporting / structure -------------------------- */

export interface FiscalPeriod {
  id: string;
  fiscalYear: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "open" | "closed" | "locked";
  closedOn?: string | undefined;
  closedBy?: string | undefined;
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  head: string;
  budget: number;
  actual: number;
  variance: number;
  status: RecordStatus;
}

export interface AccountingProject {
  id: string;
  name: string;
  buildingId: string;
  category: string;
  startDate: string;
  endDate: string;
  budget: number;
  purchases: number;
  labor: number;
  vendorCost: number;
  otherExpense: number;
  actual: number;
  remaining: number;
  variance: number;
  status: "planning" | "in_progress" | "on_hold" | "completed";
}

export interface FixedAsset {
  id: string;
  name: string;
  category: string;
  buildingId: string;
  vendor: string;
  purchaseCost: number;
  purchaseDate: string;
  usefulLifeYears: number;
  method: "straight_line" | "reducing_balance";
  salvageValue: number;
  monthsInService: number;
  accumulatedDepreciation: number;
  bookValue: number;
  warrantyUntil: string;
  condition: "excellent" | "good" | "fair" | "poor";
  lifecycle: "requested" | "purchased" | "received" | "capitalized" | "assigned" | "in_maintenance" | "disposed";
  status: RecordStatus;
}

export interface DepreciationRow {
  id: string;
  assetId: string;
  asset: string;
  category: string;
  buildingId: string;
  cost: number;
  usefulLifeYears: number;
  method: FixedAsset["method"];
  monthlyDepreciation: number;
  accumulated: number;
  netBookValue: number;
  lastPostedOn: string;
  status: "scheduled" | "posted";
}

export interface AccountingAuditEvent {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  entity: string;
  entityId: string;
  source: SourceModule;
  before: string;
  after: string;
}

/* --------------------------- Settlement / refunds --------------------------- */

export type SettlementStatus = "pending" | "held" | "approved" | "settled" | "refunded" | "disputed";

export interface Settlement {
  id: string;
  orderId: string;
  provider: string;
  resident: string;
  flat: string;
  orderAmount: number;
  commissionRate: number;
  commission: number;
  providerPayable: number;
  communityShare: number;
  refund: number;
  status: SettlementStatus;
  settlementDate: string;
  method: "bank_transfer" | "mobile_wallet" | "cash";
}

export interface Adjustment {
  id: string;
  date: string;
  kind: "full_refund" | "partial_refund" | "credit_note" | "debit_note" | "overpayment" | "deposit_refund" | "cancellation" | "payment_reversal";
  reference: string;
  party: string;
  originalAmount: number;
  amount: number;
  reason: string;
  status: "requested" | "approved" | "posted" | "rejected";
  postedEntry?: string | undefined;
}

/* ---------------------- Enterprise control layer (Part B) ------------------- */

export type RelationshipKind =
  | "owner" | "tenant" | "resident" | "family_member" | "domestic_worker"
  | "service_provider" | "security_officer" | "building_staff" | "caretaker" | "vendor_contact";

export interface PersonRelationship {
  id: string;
  kind: RelationshipKind;
  target: string;
  targetType: "flat" | "building" | "household" | "organization" | "community";
  since: string;
  until?: string | undefined;
  status: RecordStatus;
}

export interface Person {
  id: string;
  name: string;
  nameBn: string;
  phone: string;
  email: string;
  nid: string;
  dob: string;
  gender: "male" | "female";
  photoInitials: string;
  primaryRole: RelationshipKind;
  relationships: PersonRelationship[];
  households: string[];
  occupancies: string[];
  accessLevel: "permanent" | "temporary" | "restricted" | "none";
  verification: "verified" | "pending" | "rejected";
  status: RecordStatus;
  registeredOn: string;
}

export interface Meter {
  id: string;
  serial: string;
  type: "electricity" | "water" | "gas" | "generator";
  scope: "flat" | "common" | "building";
  buildingId: string;
  flat: string;
  installedOn: string;
  previousReading: number;
  currentReading: number;
  consumption: number;
  rate: number;
  amount: number;
  lastReadOn: string;
  billingStatus: "unbilled" | "billed" | "paid";
  status: RecordStatus;
}

export interface MeterReading {
  id: string;
  meterId: string;
  readOn: string;
  reading: number;
  consumption: number;
  readBy: string;
  amount: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  warehouse: string;
  quantity: number;
  minimumStock: number;
  reorderLevel: number;
  unitCost: number;
  stockValue: number;
  stockStatus: "in_stock" | "low" | "reorder" | "out_of_stock";
  status: RecordStatus;
}

export interface StockMovement {
  id: string;
  date: string;
  itemId: string;
  item: string;
  warehouse: string;
  kind: "purchase" | "issue" | "consumption" | "adjustment" | "transfer";
  quantity: number;
  balanceAfter: number;
  reference: string;
  actor: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  keeper: string;
  itemCount: number;
  stockValue: number;
  status: RecordStatus;
}

export interface ProcurementRecord {
  id: string;
  title: string;
  vendor: string;
  buildingId: string;
  category: string;
  amount: number;
  requestedBy: string;
  requestedOn: string;
  stage: "request" | "approval" | "purchase_order" | "goods_receipt" | "vendor_bill" | "payable" | "paid";
  poNo: string;
  grnNo: string;
  billNo: string;
  capitalized: boolean;
  status: "open" | "completed" | "rejected";
}

export type SlaPriority = "emergency" | "critical" | "high" | "normal" | "low";

export interface SlaRule {
  id: string;
  name: string;
  module: string;
  priority: SlaPriority;
  targetMinutes: number;
  escalationChain: string[];
  businessHoursOnly: boolean;
  status: RecordStatus;
}

export interface SlaTicket {
  id: string;
  subject: string;
  module: string;
  priority: SlaPriority;
  department: string;
  team: string;
  openedAt: string;
  targetMinutes: number;
  elapsedMinutes: number;
  remainingMinutes: number;
  breached: boolean;
  escalationLevel: number;
  status: "open" | "in_progress" | "resolved" | "closed";
}

export interface EscalationRule {
  id: string;
  name: string;
  module: string;
  trigger: string;
  afterMinutes: number;
  levels: { level: number; role: string; action: string }[];
  status: RecordStatus;
}

export interface WorkflowStep {
  step: number;
  role: string;
  action: "approve" | "reject" | "review" | "verify" | "pending";
  actor: string;
  comment: string;
  timestamp: string;
  state: "completed" | "current" | "upcoming" | "rejected";
}

export interface WorkflowInstance {
  id: string;
  type: string;
  subject: string;
  requestedBy: string;
  requestedOn: string;
  amount: number;
  currentStep: number;
  steps: WorkflowStep[];
  status: "pending" | "approved" | "rejected";
}

export interface AccessZone {
  id: string;
  name: string;
  kind: "community" | "block" | "road" | "gate" | "building" | "floor" | "flat" | "collection_point" | "parking" | "restricted";
  parent: string;
  restricted: boolean;
  description: string;
  status: RecordStatus;
}

export interface AccessPolicy {
  id: string;
  name: string;
  personType: string;
  purpose: string;
  property: string;
  gate: string;
  allowedZones: string[];
  deniedZones: string[];
  validFrom: string;
  validTo: string;
  windowStart: string;
  windowEnd: string;
  days: string;
  oneTime: boolean;
  status: RecordStatus;
}

export type AllocationMethod = "equal" | "flat_size" | "meter_consumption" | "percentage" | "fixed" | "custom";

export interface AllocationRule {
  id: string;
  name: string;
  costType: string;
  method: AllocationMethod;
  buildingId: string;
  amount: number;
  targets: number;
  lastRunOn: string;
  posted: boolean;
  status: RecordStatus;
}

export interface AllocationResult {
  id: string;
  ruleId: string;
  flat: string;
  basis: string;
  share: number;
  amount: number;
}

export interface DispatchRecord {
  id: string;
  sosRef: string;
  category: "medical" | "fire" | "security" | "accident" | "other";
  severity: "critical" | "high" | "medium";
  reportedBy: string;
  location: string;
  reportedAt: string;
  team: string;
  officer: string;
  stage: "reported" | "classified" | "dispatched" | "acknowledged" | "responding" | "on_scene" | "resolved" | "closed";
  responseMinutes: number;
  outcome: string;
  timeline: { at: string; label: string; actor: string }[];
}

export interface ComplianceDocument {
  id: string;
  name: string;
  category: string;
  entity: string;
  entityType: string;
  issuedOn: string;
  expiresOn: string;
  daysToExpiry: number;
  state: "valid" | "expiring_soon" | "expired";
  owner: string;
  status: RecordStatus;
}

export interface NotificationRule {
  id: string;
  event: string;
  audience: string[];
  channels: ("in_app" | "push" | "sms" | "email")[];
  template: string;
  throttle: string;
  status: RecordStatus;
}

export interface RoutingRule {
  id: string;
  category: string;
  department: string;
  team: string;
  slaPriority: SlaPriority;
  escalation: string;
  status: RecordStatus;
}

export interface TimelineEvent {
  id: string;
  at: string;
  title: string;
  detail: string;
  actor: string;
  role: string;
  kind: "identity" | "access" | "service" | "finance" | "accounting" | "maintenance" | "security" | "governance";
  to?: string;
}
