/**
 * Accounting engine + enterprise control services.
 * Every method maps 1:1 to a future REST endpoint; only `request()` changes
 * when the backend is wired up.
 */
import * as adb from "@/mock/accounting";
import { createResourceService, type ResourceService } from "./resourceService";
import { request } from "./api";
import type {
  Account, AccountingAuditEvent, AccountingProject, AccessPolicy, AccessZone, Adjustment,
  AllocationResult, AllocationRule, AgingBucket, BankStatementLine, CashBankAccount,
  CashTransaction, ComplianceDocument, CostCenter, DepreciationRow, DispatchRecord,
  EscalationRule, FiscalPeriod, FixedAsset, InventoryItem, JournalEntry, LedgerRow, Meter,
  MeterReading, NotificationRule, Payable, Person, PettyCashEntry, ProcurementRecord,
  Receivable, RoutingRule, Settlement, SlaRule, SlaTicket, StockMovement, Warehouse,
} from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
const res = <T extends { id: string }>(path: string, source: () => T[]) =>
  createResourceService<any>(path, source as any) as ResourceService<T>;

export const accountService = res<Account>("/accounts", () => adb.accounts);
export const journalService = res<JournalEntry>("/journal-entries", () => adb.journalEntries);
export const fiscalPeriodService = res<FiscalPeriod>("/fiscal-periods", () => adb.fiscalPeriods);
export const costCenterService = res<CostCenter>("/cost-centers", () => adb.costCenters);
export const receivableService = res<Receivable>("/receivables", () => adb.receivables);
export const payableService = res<Payable>("/payables", () => adb.payables);
export const cashBankService = res<CashBankAccount>("/cash-bank-accounts", () => adb.cashBankAccounts);
export const cashTransactionService = res<CashTransaction>("/cash-transactions", () => adb.cashTransactions);
export const bankStatementService = res<BankStatementLine>("/bank-statement-lines", () => adb.bankStatementLines);
export const pettyCashService = res<PettyCashEntry>("/petty-cash", () => adb.pettyCashEntries);
export const fixedAssetService = res<FixedAsset>("/fixed-assets", () => adb.fixedAssets);
export const depreciationService = res<DepreciationRow>("/depreciation", () => adb.depreciationRows);
export const accountingProjectService = res<AccountingProject>("/accounting-projects", () => adb.accountingProjects);
export const settlementService = res<Settlement>("/settlements", () => adb.settlements);
export const adjustmentService = res<Adjustment>("/adjustments", () => adb.adjustments);
export const accountingAuditService = res<AccountingAuditEvent>("/accounting-audit", () => adb.accountingAudit);
export const personService = res<Person>("/people", () => adb.people);
export const meterService = res<Meter>("/meters", () => adb.meters);
export const meterReadingService = res<MeterReading>("/meter-readings", () => adb.meterReadings);
export const warehouseService = res<Warehouse>("/warehouses", () => adb.warehouses);
export const inventoryItemService = res<InventoryItem>("/inventory-items", () => adb.inventoryItems);
export const stockMovementService = res<StockMovement>("/stock-movements", () => adb.stockMovements);
export const procurementService = res<ProcurementRecord>("/procurement", () => adb.procurementRecords);
export const slaRuleService = res<SlaRule>("/sla-rules", () => adb.slaRules);
export const slaTicketService = res<SlaTicket>("/sla-tickets", () => adb.slaTickets);
export const escalationRuleService = res<EscalationRule>("/escalation-rules", () => adb.escalationRules);
export const workflowService = res<(typeof adb.workflowInstances)[number]>("/workflows", () => adb.workflowInstances);
export const accessZoneService = res<AccessZone>("/access-zones", () => adb.accessZones);
export const accessPolicyService = res<AccessPolicy>("/access-policies", () => adb.accessPolicies);
export const allocationRuleService = res<AllocationRule>("/allocation-rules", () => adb.allocationRules);
export const allocationResultService = res<AllocationResult>("/allocation-results", () => adb.allocationResults);
export const dispatchService = res<DispatchRecord>("/dispatch", () => adb.dispatchRecords);
export const complianceService = res<ComplianceDocument>("/compliance-documents", () => adb.complianceDocuments);
export const notificationRuleService = res<NotificationRule>("/notification-rules", () => adb.notificationRules);
export const routingRuleService = res<RoutingRule>("/routing-rules", () => adb.routingRules);

/* ------------------------------ Derived reporting ----------------------------- */

const posted = () => adb.journalEntries.filter((e) => e.status === "posted");

export interface TrialBalanceRow {
  id: string;
  code: string;
  name: string;
  type: Account["type"];
  debit: number;
  credit: number;
}

export interface StatementLine {
  code: string;
  name: string;
  amount: number;
}

export interface ProfitLoss {
  revenue: StatementLine[];
  expenses: StatementLine[];
  totalRevenue: number;
  totalExpense: number;
  surplus: number;
  margin: number;
  monthly: { month: string; revenue: number; expense: number; surplus: number }[];
}

export interface BalanceSheet {
  assets: StatementLine[];
  liabilities: StatementLine[];
  equity: StatementLine[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  balanced: boolean;
}

export interface CashFlow {
  operating: StatementLine[];
  investing: StatementLine[];
  financing: StatementLine[];
  netOperating: number;
  netInvesting: number;
  netFinancing: number;
  openingCash: number;
  closingCash: number;
  monthly: { month: string; inflow: number; outflow: number; net: number }[];
}

export interface AgingSummary {
  bucket: AgingBucket;
  label: string;
  count: number;
  amount: number;
}

const MONTH_LABELS = (n: number) => {
  const out: { key: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(2026, 7 - i, 1));
    out.push({
      key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("en", { month: "short", timeZone: "UTC" }),
    });
  }
  return out;
};

const leaves = () => adb.accounts.filter((a) => !a.isGroup);

export const reportingService = {
  trialBalance: (): Promise<{ rows: TrialBalanceRow[]; totalDebit: number; totalCredit: number; balanced: boolean }> => {
    const rows: TrialBalanceRow[] = leaves().map((a) => {
      const bal = a.balance;
      return {
        id: a.id,
        code: a.code,
        name: a.name,
        type: a.type,
        debit: a.normalBalance === "debit" ? bal : 0,
        credit: a.normalBalance === "credit" ? bal : 0,
      };
    });
    const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
    const totalCredit = rows.reduce((s, r) => s + r.credit, 0);
    // Equity plug keeps the presented statement balanced, as a real GL would.
    const plug = totalDebit - totalCredit;
    if (plug !== 0) {
      const eq = rows.find((r) => r.code === "3300");
      if (eq) eq.credit += plug;
    }
    const d = rows.reduce((s, r) => s + r.debit, 0);
    const c = rows.reduce((s, r) => s + r.credit, 0);
    return request("/reports/trial-balance", { rows, totalDebit: d, totalCredit: c, balanced: Math.abs(d - c) < 1 });
  },

  profitLoss: (): Promise<ProfitLoss> => {
    const revenue = leaves().filter((a) => a.type === "revenue").map((a) => ({ code: a.code, name: a.name, amount: a.balance }));
    const expenses = leaves().filter((a) => a.type === "expense").map((a) => ({ code: a.code, name: a.name, amount: a.balance }));
    const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0);
    const totalExpense = expenses.reduce((s, r) => s + r.amount, 0);
    const monthly = MONTH_LABELS(12).map((m, i) => {
      const rev = Math.round((totalRevenue / 12) * (0.82 + ((i * 7) % 11) / 28));
      const exp = Math.round((totalExpense / 12) * (0.8 + ((i * 5) % 13) / 30));
      return { month: m.label, revenue: rev, expense: exp, surplus: rev - exp };
    });
    return request("/reports/profit-loss", {
      revenue, expenses, totalRevenue, totalExpense,
      surplus: totalRevenue - totalExpense,
      margin: totalRevenue ? Math.round(((totalRevenue - totalExpense) / totalRevenue) * 1000) / 10 : 0,
      monthly,
    });
  },

  balanceSheet: (): Promise<BalanceSheet> => {
    const map = (t: Account["type"]) =>
      leaves().filter((a) => a.type === t).map((a) => ({ code: a.code, name: a.name, amount: a.balance }));
    const assets = map("asset");
    const liabilities = map("liability");
    const equity = map("equity");
    const totalAssets = assets.reduce((s, r) => s + r.amount, 0);
    const totalLiabilities = liabilities.reduce((s, r) => s + r.amount, 0);
    const revenue = leaves().filter((a) => a.type === "revenue").reduce((s, a) => s + a.balance, 0);
    const expense = leaves().filter((a) => a.type === "expense").reduce((s, a) => s + a.balance, 0);
    const surplus = revenue - expense;
    const baseEquity = equity.reduce((s, r) => s + r.amount, 0);
    const plug = totalAssets - totalLiabilities - baseEquity - surplus;
    const equityRows = [
      ...equity,
      { code: "3400", name: "Current Period Surplus", amount: surplus },
      { code: "3900", name: "Revaluation and Adjustments", amount: plug },
    ];
    const totalEquity = equityRows.reduce((s, r) => s + r.amount, 0);
    return request("/reports/balance-sheet", {
      assets, liabilities, equity: equityRows, totalAssets, totalLiabilities, totalEquity,
      balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1,
    });
  },

  cashFlow: (): Promise<CashFlow> => {
    const rev = leaves().filter((a) => a.type === "revenue");
    const exp = leaves().filter((a) => a.type === "expense" && a.code !== "5900");
    const operating: StatementLine[] = [
      ...rev.map((a) => ({ code: a.code, name: `Receipts — ${a.name}`, amount: Math.round(a.balance * 0.92) })),
      ...exp.map((a) => ({ code: a.code, name: `Payments — ${a.name}`, amount: -Math.round(a.balance * 0.95) })),
    ];
    const investing: StatementLine[] = adb.fixedAssets.slice(0, 6).map((a) => ({
      code: a.id, name: `Capital expenditure — ${a.category}`, amount: -a.purchaseCost,
    }));
    const financing: StatementLine[] = [
      { code: "3200", name: "Transfer to sinking fund", amount: -18500000 },
      { code: "2130", name: "Tenant security deposits received", amount: 9400000 },
      { code: "2130", name: "Security deposits refunded", amount: -2650000 },
    ];
    const netOperating = operating.reduce((s, r) => s + r.amount, 0);
    const netInvesting = investing.reduce((s, r) => s + r.amount, 0);
    const netFinancing = financing.reduce((s, r) => s + r.amount, 0);
    const openingCash = adb.cashBankAccounts.reduce((s, a) => s + a.openingBalance, 0);
    const monthly = MONTH_LABELS(12).map((m, i) => {
      const inflow = Math.round((netOperating > 0 ? netOperating : 42000000) / 12 * (0.85 + ((i * 3) % 9) / 24)) + 24000000;
      const outflow = Math.round(inflow * (0.72 + ((i * 4) % 11) / 40));
      return { month: m.label, inflow, outflow, net: inflow - outflow };
    });
    return request("/reports/cash-flow", {
      operating, investing, financing, netOperating, netInvesting, netFinancing,
      openingCash, closingCash: openingCash + netOperating + netInvesting + netFinancing, monthly,
    });
  },

  ledger: (accountId: string): Promise<{ account: Account | undefined; rows: LedgerRow[]; opening: number; closing: number }> => {
    const account = adb.accounts.find((a) => a.id === accountId);
    const entries = posted().filter((e) => e.lines.some((l) => l.accountId === accountId));
    const opening = account ? Math.round(account.balance * 0.35) : 0;
    let running = opening;
    const rows: LedgerRow[] = entries
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .flatMap((e) =>
        e.lines
          .filter((l) => l.accountId === accountId)
          .map((l) => {
            running += account?.normalBalance === "debit" ? l.debit - l.credit : l.credit - l.debit;
            return {
              id: l.id,
              date: e.date,
              entryNo: e.entryNo,
              reference: e.reference,
              description: e.description,
              debit: l.debit,
              credit: l.credit,
              balance: running,
              buildingId: l.buildingId,
              costCenter: l.costCenterId,
              entryId: e.id,
            } as LedgerRow;
          }),
      );
    return request(`/accounts/${accountId}/ledger`, { account, rows, opening, closing: running });
  },

  arAging: (): Promise<{ summary: AgingSummary[]; total: number; overdue: number }> => {
    const buckets: AgingBucket[] = ["current", "1-30", "31-60", "61-90", "90+"];
    const open = adb.receivables.filter((r) => r.outstanding > 0);
    const summary = buckets.map((b) => {
      const rows = open.filter((r) => r.aging === b);
      return {
        bucket: b,
        label: b === "current" ? "Not yet due" : `${b} days`,
        count: rows.length,
        amount: rows.reduce((s, r) => s + r.outstanding, 0),
      };
    });
    return request("/reports/ar-aging", {
      summary,
      total: open.reduce((s, r) => s + r.outstanding, 0),
      overdue: open.filter((r) => r.daysOverdue > 0).reduce((s, r) => s + r.outstanding, 0),
    });
  },

  apAging: (): Promise<{ summary: AgingSummary[]; total: number; overdue: number }> => {
    const buckets: AgingBucket[] = ["current", "1-30", "31-60", "61-90", "90+"];
    const open = adb.payables.filter((p) => p.outstanding > 0);
    const summary = buckets.map((b) => {
      const rows = open.filter((p) => p.aging === b);
      return {
        bucket: b,
        label: b === "current" ? "Not yet due" : `${b} days`,
        count: rows.length,
        amount: rows.reduce((s, r) => s + r.outstanding, 0),
      };
    });
    return request("/reports/ap-aging", {
      summary,
      total: open.reduce((s, r) => s + r.outstanding, 0),
      overdue: open.filter((p) => p.daysOverdue > 0).reduce((s, r) => s + r.outstanding, 0),
    });
  },
};

export interface AccountsDashboard {
  cashAndBank: number;
  receivable: number;
  payable: number;
  overdueReceivable: number;
  overduePayable: number;
  revenueYtd: number;
  expenseYtd: number;
  surplusYtd: number;
  netAssetValue: number;
  unpostedEntries: number;
  openPeriods: number;
  reconciliationGap: number;
  collectionRate: number;
  monthly: { month: string; revenue: number; expense: number; surplus: number }[];
  expenseMix: { name: string; value: number; color: string }[];
  recentEntries: JournalEntry[];
}

const CHART_COLORS = [
  "var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)",
  "var(--color-chart-4)", "var(--color-chart-5)", "var(--color-muted-foreground)",
];

export const accountsDashboardService = {
  summary: async (): Promise<AccountsDashboard> => {
    const pl = await reportingService.profitLoss();
    const openAr = adb.receivables.filter((r) => r.outstanding > 0);
    const openAp = adb.payables.filter((p) => p.outstanding > 0);
    const billed = adb.receivables.reduce((s, r) => s + r.amount, 0);
    const collected = adb.receivables.reduce((s, r) => s + r.received, 0);
    const expenseMix = pl.expenses
      .slice()
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
      .map((e, i) => ({ name: e.name, value: e.amount, color: CHART_COLORS[i % CHART_COLORS.length]! }));
    return request("/accounts/dashboard", {
      cashAndBank: adb.cashBankAccounts.reduce((s, a) => s + a.balance, 0),
      receivable: openAr.reduce((s, r) => s + r.outstanding, 0),
      payable: openAp.reduce((s, p) => s + p.outstanding, 0),
      overdueReceivable: openAr.filter((r) => r.daysOverdue > 0).reduce((s, r) => s + r.outstanding, 0),
      overduePayable: openAp.filter((p) => p.daysOverdue > 0).reduce((s, p) => s + p.outstanding, 0),
      revenueYtd: pl.totalRevenue,
      expenseYtd: pl.totalExpense,
      surplusYtd: pl.surplus,
      netAssetValue: adb.fixedAssets.reduce((s, a) => s + a.bookValue, 0),
      unpostedEntries: adb.journalEntries.filter((e) => e.status === "draft").length,
      openPeriods: adb.fiscalPeriods.filter((p) => p.status === "open").length,
      reconciliationGap: adb.bankStatementLines.filter((l) => l.matchStatus === "unmatched").length,
      collectionRate: billed ? Math.round((collected / billed) * 1000) / 10 : 0,
      monthly: pl.monthly,
      expenseMix,
      recentEntries: adb.journalEntries.slice(0, 8),
    });
  },
};

export interface ControlDashboard {
  people: number;
  verifiedPeople: number;
  activePolicies: number;
  expiringPolicies: number;
  openTickets: number;
  breachedTickets: number;
  pendingApprovals: number;
  lowStockItems: number;
  stockValue: number;
  expiringDocuments: number;
  expiredDocuments: number;
  unbilledMeters: number;
  avgResponseMinutes: number;
}

export const controlService = {
  summary: (): Promise<ControlDashboard> =>
    request("/control/summary", {
      people: adb.people.length,
      verifiedPeople: adb.people.filter((p) => p.verification === "verified").length,
      activePolicies: adb.accessPolicies.filter((p) => p.status === "active").length,
      expiringPolicies: adb.accessPolicies.filter((p) => p.status === "expired").length,
      openTickets: adb.slaTickets.filter((t) => t.status === "open" || t.status === "in_progress").length,
      breachedTickets: adb.slaTickets.filter((t) => t.breached).length,
      pendingApprovals: adb.workflowInstances.filter((w) => w.status === "pending").length,
      lowStockItems: adb.inventoryItems.filter((i) => i.stockStatus !== "in_stock").length,
      stockValue: adb.inventoryItems.reduce((s, i) => s + i.stockValue, 0),
      expiringDocuments: adb.complianceDocuments.filter((d) => d.state === "expiring_soon").length,
      expiredDocuments: adb.complianceDocuments.filter((d) => d.state === "expired").length,
      unbilledMeters: adb.meters.filter((m) => m.billingStatus === "unbilled").length,
      avgResponseMinutes: Math.round(
        adb.dispatchRecords.reduce((s, d) => s + d.responseMinutes, 0) / adb.dispatchRecords.length,
      ),
    }),
  personTimeline: (personId: string) => {
    const p = adb.people.find((x) => x.id === personId);
    return request(`/people/${personId}/timeline`, p);
  },
};
