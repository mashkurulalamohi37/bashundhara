import {
  AlertTriangle, Banknote, Bell, Building2, BusFront, Camera, CalendarDays, ClipboardList,
  Construction, ContactRound, FileText, FileBarChart2, Flame, Gauge, HardHat, Handshake,
  Home, Landmark, LayoutGrid, LifeBuoy, ListChecks, Map, MapPinned, Megaphone, PackageCheck,
  ParkingSquare, Radio, Receipt, Route as RouteIcon, ScrollText, Settings, ShieldCheck,
  Siren, Sprout, Stethoscope, Trees, Truck, UserCog, Users, Wallet, Wrench,
  BadgeCheck, Boxes, Building, Coins, Gavel, HeartHandshake, KeyRound, Layers, MessageSquare,
  Newspaper, PiggyBank, Plug, ShoppingBag, Sparkles, Store, Tags, Timer, UserSquare2, Zap,
  FileWarning, BarChart2,
} from "lucide-react";
import type { Role } from "@/types";

export interface NavItem {
  to: string;
  label: keyof typeof LABEL_KEYS | string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

const LABEL_KEYS = {} as Record<string, string>;

const ALL: Role[] = [
  "super_admin", "community_admin", "security_admin", "security_officer", "property_manager",
  "maintenance_manager", "finance_manager", "contractor", "welfare_admin", "building_owner",
  "building_manager", "accountant", "caretaker", "maintenance_staff", "service_provider",
];
const ADMIN: Role[] = ["super_admin", "community_admin", "welfare_admin"];
const BUILDING: Role[] = ["super_admin", "community_admin", "building_owner", "building_manager", "property_manager", "accountant"];
const CARE: Role[] = ["super_admin", "community_admin", "building_manager", "caretaker"];
const MARKET: Role[] = ["super_admin", "community_admin", "property_manager", "caretaker", "service_provider", "security_admin"];
const SECURITY: Role[] = ["super_admin", "community_admin", "security_admin", "security_officer"];
const PROPERTY: Role[] = ["super_admin", "community_admin", "property_manager", "building_manager", "building_owner"];
const OPS: Role[] = ["super_admin", "community_admin", "maintenance_manager", "maintenance_staff"];
const FINANCE: Role[] = ["super_admin", "community_admin", "finance_manager", "accountant"];
const BUILD: Role[] = ["super_admin", "community_admin", "maintenance_manager", "contractor"];

export const NAV: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { to: "/dashboard", label: "Command Center", icon: Gauge, roles: ALL },
      { to: "/map", label: "Community Map", icon: Map, roles: ALL },
    ],
  },
  {
    title: "Community",
    items: [
      { to: "/community", label: "Community Overview", icon: LayoutGrid, roles: PROPERTY },
      { to: "/community/blocks", label: "Blocks", icon: MapPinned, roles: PROPERTY },
      { to: "/community/roads", label: "Roads", icon: RouteIcon, roles: PROPERTY },
      { to: "/buildings", label: "Buildings", icon: Building, roles: PROPERTY },
      { to: "/properties", label: "Properties", icon: Building2, roles: PROPERTY },
      { to: "/flats", label: "Flats & Occupancy", icon: Home, roles: PROPERTY },
      { to: "/community/feed", label: "Community Feed", icon: Newspaper, roles: ALL },
      { to: "/nearby", label: "Nearby Shops & Services", icon: Store, roles: ALL },
    ],
  },
  {
    title: "People",
    items: [
      { to: "/residents", label: "Residents", icon: Users, roles: PROPERTY },
      { to: "/property-claims", label: "Property Claims", icon: BadgeCheck, roles: [...ADMIN, ...PROPERTY] },
      { to: "/families", label: "Families", icon: ContactRound, roles: PROPERTY },
      { to: "/owners", label: "Flat Owners", icon: UserSquare2, roles: PROPERTY },
      { to: "/tenants", label: "Tenants & Leases", icon: KeyRound, roles: PROPERTY },
      { to: "/households", label: "Households", icon: HeartHandshake, roles: PROPERTY },
      { to: "/family-members", label: "Family Members", icon: ContactRound, roles: PROPERTY },
      { to: "/authorized-residents", label: "Authorized Residents", icon: BadgeCheck, roles: PROPERTY },
      { to: "/domestic-workers", label: "Domestic Workers", icon: UserCog, roles: [...PROPERTY, "security_admin"] },
      { to: "/workers", label: "Community Workers", icon: HardHat, roles: [...PROPERTY, "security_admin"] },
    ],
  },
  {
    title: "Building Management",
    items: [
      { to: "/building/overview", label: "Owner Dashboard", icon: Gauge, roles: BUILDING },
      { to: "/building/staff", label: "Building Staff", icon: Users, roles: BUILDING },
      { to: "/building/vendors", label: "Vendors", icon: Handshake, roles: BUILDING },
      { to: "/building/assets", label: "Assets", icon: Boxes, roles: BUILDING },
      { to: "/building/utilities", label: "Utilities", icon: Plug, roles: BUILDING },
      { to: "/building/rent", label: "Rent & Income", icon: Coins, roles: BUILDING },
      { to: "/building/expenses", label: "Building Expenses", icon: Receipt, roles: BUILDING },
      { to: "/building/budget", label: "Budget", icon: PiggyBank, roles: BUILDING },
      { to: "/building/procurement", label: "Procurement", icon: ShoppingBag, roles: BUILDING },
      { to: "/building/pnl", label: "P&L", icon: FileBarChart2, roles: BUILDING },
    ],
  },
  {
    title: "Services Marketplace",
    items: [
      { to: "/services/marketplace", label: "Marketplace", icon: Sparkles, roles: MARKET },
      { to: "/services/providers", label: "Service Providers", icon: Store, roles: MARKET },
      { to: "/services/requests", label: "Service Requests", icon: ClipboardList, roles: MARKET },
      { to: "/services/bids", label: "Bids & Quotes", icon: Tags, roles: MARKET },
      { to: "/services/orders", label: "Service Orders", icon: PackageCheck, roles: MARKET },
      { to: "/services/handovers", label: "Handover Tracking", icon: Timer, roles: MARKET },
      { to: "/services/caretaker", label: "Caretaker Tasks", icon: Layers, roles: CARE },
      { to: "/caretaker/console", label: "Caretaker Console", icon: ClipboardList, roles: CARE },
      { to: "/services/reviews", label: "Reviews", icon: MessageSquare, roles: MARKET },
      { to: "/services/disputes", label: "Disputes", icon: Gavel, roles: MARKET },
    ],
  },
  {
    title: "Security",
    items: [
      { to: "/security", label: "Control Room", icon: Radio, roles: SECURITY },
      { to: "/security/gate-desk", label: "Gate Desk", icon: ShieldCheck, roles: SECURITY },
      { to: "/security/gates", label: "Gates", icon: LifeBuoy, roles: SECURITY },
      { to: "/visitors", label: "Visitors", icon: ClipboardList, roles: SECURITY },
      { to: "/vehicles", label: "Vehicles", icon: Truck, roles: SECURITY },
      { to: "/parking", label: "Parking", icon: ParkingSquare, roles: [...SECURITY, "property_manager"] },
      { to: "/security/domestic-access", label: "Domestic Worker Access", icon: UserCog, roles: SECURITY },
      { to: "/security/service-access", label: "Service Provider Access", icon: BadgeCheck, roles: [...SECURITY, "caretaker"] },
      { to: "/security/access-history", label: "Access History", icon: ScrollText, roles: SECURITY },
      { to: "/security/patrols", label: "Patrols", icon: ListChecks, roles: SECURITY },
      { to: "/security/cctv", label: "CCTV", icon: Camera, roles: SECURITY },
      { to: "/incidents", label: "Incidents", icon: AlertTriangle, roles: SECURITY },
      { to: "/emergency", label: "Emergency", icon: Siren, roles: SECURITY },
      { to: "/fire-safety", label: "Fire Safety", icon: Flame, roles: [...SECURITY, "maintenance_manager"] },
      { to: "/deliveries", label: "Deliveries", icon: PackageCheck, roles: SECURITY },
    ],
  },
  {
    title: "Operations",
    items: [
      { to: "/maintenance", label: "Complaints", icon: Wrench, roles: OPS },
      { to: "/work-orders", label: "Work Orders", icon: ClipboardList, roles: OPS },
      { to: "/infrastructure", label: "Infrastructure", icon: Sprout, roles: OPS },
      { to: "/environment", label: "Environment", icon: Trees, roles: OPS },
      { to: "/transport", label: "Transport", icon: BusFront, roles: OPS },
    ],
  },
  {
    title: "Development",
    items: [
      { to: "/construction", label: "Construction", icon: Construction, roles: BUILD },
      { to: "/contractors", label: "Contractors", icon: Handshake, roles: BUILD },
    ],
  },
  {
    title: "Finance",
    items: [
      { to: "/finance", label: "Finance Overview", icon: Wallet, roles: FINANCE },
      { to: "/finance/invoices", label: "Invoices", icon: Receipt, roles: FINANCE },
      { to: "/finance/payments", label: "Payments", icon: Banknote, roles: FINANCE },
      { to: "/finance/expenses", label: "Expenses", icon: FileText, roles: FINANCE },
    ],
  },
  {
    title: "Community Services",
    items: [
      { to: "/facilities", label: "Facilities", icon: Landmark, roles: ADMIN },
      { to: "/bookings", label: "Bookings", icon: CalendarDays, roles: ADMIN },
      { to: "/events", label: "Events", icon: CalendarDays, roles: ADMIN },
      { to: "/announcements", label: "Announcements", icon: Megaphone, roles: ADMIN },
      { to: "/directory", label: "Health Directory", icon: Stethoscope, roles: ALL },
    ],
  },
  {
    title: "Governance",
    items: [
      { to: "/governance", label: "Welfare Society", icon: Landmark, roles: ADMIN },
      { to: "/governance/committee", label: "Committee", icon: Users, roles: ADMIN },
      { to: "/governance/meetings", label: "Meetings", icon: ScrollText, roles: ADMIN },
    ],
  },
  {
    title: "Accounts",
    items: [
      { to: "/accounts", label: "Accounts Dashboard", icon: Gauge, roles: FINANCE },
      { to: "/accounts/chart", label: "Chart of Accounts", icon: Layers, roles: FINANCE },
      { to: "/accounts/journal", label: "Journal Entries", icon: ScrollText, roles: FINANCE },
      { to: "/accounts/ledger", label: "General Ledger", icon: FileText, roles: FINANCE },
      { to: "/accounts/trial-balance", label: "Trial Balance", icon: FileBarChart2, roles: FINANCE },
      { to: "/accounts/profit-loss", label: "Income & Expenditure", icon: FileBarChart2, roles: FINANCE },
      { to: "/accounts/balance-sheet", label: "Balance Sheet", icon: Landmark, roles: FINANCE },
      { to: "/accounts/cash-flow", label: "Cash Flow", icon: Banknote, roles: FINANCE },
      { to: "/accounts/receivables", label: "Receivables", icon: Receipt, roles: FINANCE },
      { to: "/accounts/payables", label: "Payables", icon: FileText, roles: FINANCE },
      { to: "/accounts/cash-bank", label: "Cash & Bank", icon: Wallet, roles: FINANCE },
      { to: "/accounts/reconciliation", label: "Reconciliation", icon: Coins, roles: FINANCE },
      { to: "/accounts/petty-cash", label: "Petty Cash", icon: PiggyBank, roles: FINANCE },
      { to: "/accounts/assets", label: "Fixed Assets", icon: Boxes, roles: FINANCE },
      { to: "/accounts/depreciation", label: "Depreciation", icon: Timer, roles: FINANCE },
      { to: "/accounts/projects", label: "Project Costing", icon: Construction, roles: FINANCE },
      { to: "/accounts/cost-centers", label: "Cost Centers", icon: Building, roles: FINANCE },
      { to: "/accounts/allocation", label: "Cost Allocation", icon: Layers, roles: FINANCE },
      { to: "/accounts/settlements", label: "Settlements", icon: Handshake, roles: FINANCE },
      { to: "/accounts/adjustments", label: "Refunds & Adjustments", icon: Tags, roles: FINANCE },
      { to: "/accounts/periods", label: "Fiscal Periods", icon: CalendarDays, roles: FINANCE },
      { to: "/accounts/audit", label: "Accounting Audit", icon: ScrollText, roles: FINANCE },
    ],
  },
  {
    title: "Facility Core Service",
    items: [
      { to: "/facility/dashboard", label: "Facility Control Center", icon: Gauge, roles: ALL },
      { to: "/facility/control-room", label: "Live Control Room", icon: Radio, roles: ALL },
      { to: "/facility/assets", label: "Asset Directory", icon: Building2, roles: ALL },
      { to: "/facility/asset-lifecycle", label: "Asset Lifecycle", icon: Layers, roles: ALL },
      { to: "/facility/work-orders", label: "Facility Work Orders", icon: Wrench, roles: ALL },
      { to: "/facility/maintenance", label: "Maintenance Routines", icon: Wrench, roles: ALL },
      { to: "/facility/preventive-maintenance", label: "Preventive Maintenance", icon: Timer, roles: ALL },
      { to: "/facility/utilities", label: "Utility Monitoring", icon: Zap, roles: ALL },
      { to: "/facility/housekeeping", label: "Housekeeping & Waste", icon: Sparkles, roles: ALL },
      { to: "/facility/vendors", label: "Facility Vendors", icon: Handshake, roles: ALL },
      { to: "/facility/amc", label: "AMC & Contracts", icon: ShieldCheck, roles: ALL },
      { to: "/facility/compliance", label: "Compliance & Safety", icon: FileWarning, roles: ALL },
      { to: "/facility/inspections", label: "Inspections & Audits", icon: BadgeCheck, roles: ALL },
      { to: "/facility/biomedical", label: "Biomedical Equipment", icon: Stethoscope, roles: ALL },
      { to: "/facility/inventory", label: "Spare Parts Stock", icon: Boxes, roles: ALL },
      { to: "/facility/costing", label: "Costing & Accounts", icon: Wallet, roles: ALL },
      { to: "/facility/budget", label: "OPEX / CAPEX Budget", icon: PiggyBank, roles: ALL },
      { to: "/facility/documents", label: "Facility Documents", icon: FileText, roles: ALL },
      { to: "/facility/alerts", label: "Alert Center", icon: AlertTriangle, roles: ALL },
      { to: "/facility/analytics", label: "Facility Analytics", icon: BarChart2, roles: ALL },
      { to: "/facility/structure", label: "Location Hierarchy", icon: MapPinned, roles: ALL },
    ],
  },
  {
    title: "Inventory & Procurement",
    items: [
      { to: "/inventory/items", label: "Stock Items", icon: Boxes, roles: OPS },
      { to: "/inventory/movements", label: "Stock Movements", icon: PackageCheck, roles: OPS },
      { to: "/inventory/warehouses", label: "Warehouses", icon: Store, roles: OPS },
      { to: "/inventory/procurement", label: "Procurement", icon: ShoppingBag, roles: [...OPS, "finance_manager", "accountant"] },
    ],
  },
  {
    title: "Enterprise Control",
    items: [
      { to: "/control", label: "Control Center", icon: Gauge, roles: ADMIN },
      { to: "/control/ops-board", label: "Live Ops Board", icon: Radio, roles: ALL },
      { to: "/control/people", label: "Person Registry", icon: ContactRound, roles: ADMIN },
      { to: "/control/zones", label: "Access Zones", icon: MapPinned, roles: [...ADMIN, "security_admin"] },
      { to: "/control/access-policies", label: "Access Policies", icon: ShieldCheck, roles: [...ADMIN, "security_admin"] },
      { to: "/control/workflows", label: "Approval Workflows", icon: ListChecks, roles: ADMIN },
      { to: "/control/sla", label: "SLA Rules", icon: Timer, roles: ADMIN },
      { to: "/control/escalations", label: "Escalation Matrix", icon: Siren, roles: ADMIN },
      { to: "/control/routing", label: "Department Routing", icon: RouteIcon, roles: ADMIN },
      { to: "/control/dispatch", label: "Emergency Dispatch", icon: Radio, roles: [...ADMIN, "security_admin"] },
      { to: "/control/meters", label: "Meters & Readings", icon: Plug, roles: [...ADMIN, "maintenance_manager"] },
      { to: "/control/compliance", label: "Compliance & Documents", icon: BadgeCheck, roles: ADMIN },
      { to: "/control/notifications", label: "Notification Rules", icon: Bell, roles: ADMIN },
    ],
  },
  {
    title: "Insight",
    items: [
      { to: "/reports", label: "Reports", icon: FileBarChart2, roles: ALL },
      { to: "/analytics", label: "Analytics", icon: Gauge, roles: ALL },
      { to: "/documents", label: "Documents", icon: FileText, roles: ALL },
      { to: "/audit-logs", label: "Audit Logs", icon: ScrollText, roles: ADMIN },
    ],
  },
  {
    title: "System",
    items: [
      { to: "/notifications", label: "Notifications", icon: Bell, roles: ALL },
      { to: "/settings", label: "Settings", icon: Settings, roles: ADMIN },
      { to: "/profile", label: "My Profile", icon: UserCog, roles: ALL },
    ],
  },
];

export function navForRole(role: Role): NavGroup[] {
  return NAV.map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(role)) })).filter(
    (g) => g.items.length > 0,
  );
}