/**
 * API-ready service interfaces for the Digital Community OS layers.
 * Every method maps 1:1 to a future REST endpoint; only `request()` changes
 * when the backend is wired up.
 */
import * as cdb from "@/mock/community";
import { createResourceService, type ResourceService } from "./resourceService";
import { request } from "./api";
import type {
  AccessEvent, AccessPass, AuthorizedResident, Budget, Building, BuildingAsset,
  BuildingExpense, BuildingIncome, BuildingStaff, CaretakerTask, CommunityPost,
  DomesticWorker, DomesticWorkerEmployment, FamilyMember, Floor, Household, Lease,
  NearbyPlace, Owner, Poll, PurchaseRequest, ServiceBid, ServiceDispute, ServiceHandover,
  ServiceItem, ServiceOrder, ServiceProvider, ServiceRequest, ServiceReview, Tenant,
  UtilityBill, Vendor,
} from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
const res = <T extends { id: string }>(path: string, source: () => T[]) =>
  createResourceService<any>(path, source as any) as ResourceService<T>;

export const buildingService = res<Building>("/buildings", () => cdb.buildings);
export const floorService = res<Floor>("/floors", () => cdb.floors);
export const ownerService = res<Owner>("/owners", () => cdb.owners);
export const tenantService = res<Tenant>("/tenants", () => cdb.tenants);
export const leaseService = res<Lease>("/leases", () => cdb.leases);
export const householdService = res<Household>("/households", () => cdb.households);
export const familyMemberService = res<FamilyMember>("/family-members", () => cdb.familyMembers);
export const authorizedResidentService = res<AuthorizedResident>("/authorized-residents", () => cdb.authorizedResidents);
export const domesticWorkerService = res<DomesticWorker>("/domestic-workers", () => cdb.domesticWorkers);
export const domesticWorkerEmploymentService = res<DomesticWorkerEmployment>("/domestic-worker-employments", () => cdb.domesticWorkerEmployments);
export const buildingStaffService = res<BuildingStaff>("/building-staff", () => cdb.buildingStaff);
export const vendorService = res<Vendor>("/vendors", () => cdb.vendors);
export const buildingAssetService = res<BuildingAsset>("/building-assets", () => cdb.buildingAssets);
export const utilityBillService = res<UtilityBill>("/utility-bills", () => cdb.utilityBills);
export const buildingExpenseService = res<BuildingExpense>("/building-expenses", () => cdb.buildingExpenses);
export const buildingIncomeService = res<BuildingIncome>("/building-income", () => cdb.buildingIncome);
export const budgetService = res<Budget>("/budgets", () => cdb.budgets);
export const purchaseRequestService = res<PurchaseRequest>("/purchase-requests", () => cdb.purchaseRequests);
export const serviceProviderService = res<ServiceProvider>("/service-providers", () => cdb.serviceProviders);
export const serviceRequestService = res<ServiceRequest>("/service-requests", () => cdb.serviceRequests);
export const serviceBidService = res<ServiceBid>("/service-bids", () => cdb.serviceBids);
export const serviceOrderService = res<ServiceOrder>("/service-orders", () => cdb.serviceOrders);
export const serviceItemService = res<ServiceItem>("/service-items", () => cdb.serviceItems);
export const serviceHandoverService = res<ServiceHandover>("/service-handovers", () => cdb.serviceHandovers);
export const serviceDisputeService = res<ServiceDispute>("/service-disputes", () => cdb.serviceDisputes);
export const serviceReviewService = res<ServiceReview>("/service-reviews", () => cdb.serviceReviews);
export const caretakerTaskService = res<CaretakerTask>("/caretaker-tasks", () => cdb.caretakerTasks);
export const accessPassService = res<AccessPass>("/access-passes", () => cdb.accessPasses);
export const accessEventService = res<AccessEvent>("/access-events", () => cdb.accessEvents);
export const communityPostService = res<CommunityPost>("/community-posts", () => cdb.communityPosts);
export const pollService = res<Poll>("/polls", () => cdb.polls);
export const nearbyPlaceService = res<NearbyPlace>("/nearby-places", () => cdb.nearbyPlaces);

/* ------------------------------ Composite reads ------------------------------- */

export interface FlatDossier {
  flatId: string;
  owners: Owner[];
  tenants: Tenant[];
  households: Household[];
  familyMembers: FamilyMember[];
  authorizedResidents: AuthorizedResident[];
  domesticWorkers: DomesticWorker[];
  serviceOrders: ServiceOrder[];
}

export const flatDossierService = {
  get: (flatId: string): Promise<FlatDossier> =>
    request(`/flats/${flatId}/dossier`, {
      flatId,
      owners: cdb.owners.filter((o) => o.flatId === flatId),
      tenants: cdb.tenants.filter((t) => t.flatId === flatId),
      households: cdb.households.filter((h) => h.flatId === flatId),
      familyMembers: cdb.familyMembers.filter((m) => m.flatId === flatId),
      authorizedResidents: cdb.authorizedResidents.filter((a) => a.flatId === flatId),
      domesticWorkers: cdb.domesticWorkers.filter((w) => w.flatId === flatId),
      serviceOrders: cdb.serviceOrders.filter((o) => o.flatId === flatId),
    }),
};

export interface ServiceOrderDetail {
  order: ServiceOrder;
  provider: ServiceProvider | undefined;
  items: ServiceItem[];
  handovers: ServiceHandover[];
  reviews: ServiceReview[];
  disputes: ServiceDispute[];
  pass: AccessPass | undefined;
}

export const serviceOrderDetailService = {
  get: (id: string): Promise<ServiceOrderDetail | null> => {
    const order = cdb.serviceOrders.find((o) => o.id === id);
    if (!order) return request(`/service-orders/${id}/detail`, null);
    return request(`/service-orders/${id}/detail`, {
      order,
      provider: cdb.serviceProviders.find((p) => p.id === order.providerId),
      items: cdb.serviceItems.filter((i) => i.orderId === id),
      handovers: cdb.serviceHandovers.filter((h) => h.orderId === id).sort((a, b) => a.sequence - b.sequence),
      reviews: cdb.serviceReviews.filter((r) => r.orderId === id),
      disputes: cdb.serviceDisputes.filter((d) => d.orderId === id),
      pass: cdb.accessPasses.find((p) => p.orderId === id),
    });
  },
};

export interface BuildingPnl {
  buildingId: string;
  revenue: { label: string; amount: number }[];
  expenses: { label: string; amount: number }[];
  totalRevenue: number;
  totalExpense: number;
  net: number;
  pendingRent: number;
  utilityDue: number;
  vendorDue: number;
  staffSalary: number;
  monthly: { month: string; revenue: number; expense: number }[];
}

const sum = (rows: { amount: number }[]) => rows.reduce((s, r) => s + r.amount, 0);

export const buildingFinanceService = {
  pnl: (buildingId: string | "all"): Promise<BuildingPnl> => {
    const scope = <T extends { buildingId: string }>(rows: T[]) =>
      buildingId === "all" ? rows : rows.filter((r) => r.buildingId === buildingId);
    const income = scope(cdb.buildingIncome);
    const expense = scope(cdb.buildingExpenses);
    const groupBy = <T extends { amount: number }>(rows: T[], key: (r: T) => string) => {
      const map = new Map<string, number>();
      for (const r of rows) map.set(key(r), (map.get(key(r)) ?? 0) + r.amount);
      return [...map.entries()].map(([label, amount]) => ({ label, amount })).sort((a, b) => b.amount - a.amount);
    };
    const totalRevenue = sum(income);
    const totalExpense = sum(expense);
    const staff = scope(cdb.buildingStaff).reduce((s, r) => s + r.monthlySalary, 0);
    return request(`/buildings/${buildingId}/pnl`, {
      buildingId,
      revenue: groupBy(income, (r) => r.source.replace(/_/g, " ")),
      expenses: groupBy(expense, (r) => r.category).slice(0, 10),
      totalRevenue,
      totalExpense,
      net: totalRevenue - totalExpense,
      pendingRent: income.filter((r) => r.status !== "received").reduce((s, r) => s + r.amount, 0),
      utilityDue: scope(cdb.utilityBills).filter((u) => u.status !== "paid").reduce((s, u) => s + u.amount, 0),
      vendorDue: scope(cdb.vendors).reduce((s, v) => s + v.outstanding, 0),
      staffSalary: staff,
      monthly: ["2026-04", "2026-05", "2026-06", "2026-07", "2026-08"].map((month, i) => ({
        month: month.slice(5),
        revenue: Math.round(totalRevenue / 5) + i * 12000,
        expense: Math.round(totalExpense / 5) + i * 4000,
      })),
    });
  },
};

export interface MarketplaceSummary {
  providers: number;
  verifiedProviders: number;
  openRequests: number;
  activeBids: number;
  liveOrders: number;
  handoversToday: number;
  openDisputes: number;
  avgRating: number;
}

export const marketplaceService = {
  summary: (): Promise<MarketplaceSummary> =>
    request("/marketplace/summary", {
      providers: cdb.serviceProviders.length,
      verifiedProviders: cdb.serviceProviders.filter((p) => p.verification === "verified").length,
      openRequests: cdb.serviceRequests.filter((r) => r.status === "open" || r.status === "receiving_bids").length,
      activeBids: cdb.serviceBids.filter((b) => b.status === "submitted" || b.status === "shortlisted").length,
      liveOrders: cdb.serviceOrders.filter((o) => !["completed", "cancelled", "rejected", "no_show"].includes(o.status)).length,
      handoversToday: cdb.serviceHandovers.length,
      openDisputes: cdb.serviceDisputes.filter((d) => d.status !== "resolved" && d.status !== "rejected").length,
      avgRating: Number((cdb.serviceProviders.reduce((s, p) => s + p.rating, 0) / cdb.serviceProviders.length).toFixed(2)),
    }),
};

export interface CaretakerSummary {
  pending: number;
  inProgress: number;
  completedToday: number;
  pickups: number;
  returns: number;
  urgent: number;
}

export const caretakerService = {
  summary: (): Promise<CaretakerSummary> =>
    request("/caretaker/summary", {
      pending: cdb.caretakerTasks.filter((t) => t.status === "pending").length,
      inProgress: cdb.caretakerTasks.filter((t) => t.status === "in_progress" || t.status === "accepted").length,
      completedToday: cdb.caretakerTasks.filter((t) => t.status === "completed").length,
      pickups: cdb.caretakerTasks.filter((t) => t.type === "service_pickup").length,
      returns: cdb.caretakerTasks.filter((t) => t.type === "service_return").length,
      urgent: cdb.caretakerTasks.filter((t) => t.priority === "urgent").length,
    }),
  advanceTask: (id: string, action: "accept" | "collect" | "handover" | "deliver" | "complete") => {
    const task = cdb.caretakerTasks.find((t) => t.id === id);
    if (task) {
      if (action === "accept") {
        task.status = "accepted" as any;
      } else if (action === "collect" || action === "handover") {
        task.status = "in_progress" as any;
      } else if (action === "deliver" || action === "complete") {
        task.status = "completed" as any;
      }
    }
    return request(`/caretaker-tasks/${id}/${action}`, { id, action, ok: true }, 200);
  },
  verifyOtp: (id: string, otp: string) => {
    const verified = otp.length === 6;
    if (verified) {
      const task = cdb.caretakerTasks.find((t) => t.id === id);
      if (task) {
        task.status = "completed" as any;
      }
    }
    return request(`/caretaker-tasks/${id}/otp`, { id, verified }, 200);
  },
};

export const accessControlService = {
  verifyPass: (code: string) =>
    request(`/access-passes/${code}/verify`, {
      code,
      verified: true,
      zoneAccess: "Gate → Collection point only",
    }, 320),
  decide: (id: string, decision: "allow" | "deny") =>
    request(`/access-passes/${id}/decision`, { id, decision, ok: true }, 300),
};
