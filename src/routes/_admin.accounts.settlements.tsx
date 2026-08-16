import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, KpiCard, StatusBadge } from "@/components/app/primitives";
import { DataTable, type Column, type FilterDef } from "@/components/app/data-table";
import { settlementService } from "@/services";
import { humanizeError } from "@/services/api";
import { bdt, titleize } from "@/lib/format";
import type { Settlement } from "@/types";

export const Route = createFileRoute("/_admin/accounts/settlements")({
  head: () => ({
    meta: [
      { title: "Marketplace Settlements — Bashundhara R/A" },
      { name: "description", content: "Provider payouts, community commission, refunds and settlement status per service order." },
      { property: "og:title", content: "Marketplace Settlements — Bashundhara R/A" },
      { property: "og:description", content: "Provider payouts, community commission, refunds and settlement status per service order." },
    ],
  }),
  component: Page,
});

const filters: FilterDef[] = [
  { key: "status", label: "Status", options: ["pending", "held", "approved", "settled", "refunded", "disputed"] },
  { key: "method", label: "Method", options: ["bank_transfer", "mobile_wallet", "cash"] },
];

function Page() {
  const rows = useQuery({ queryKey: ["settlements"], queryFn: () => settlementService.all() });
  const data = rows.data ?? [];
  const sum = (k: keyof Settlement) => data.reduce((s, r) => s + (r[k] as number), 0);

  const columns: Column<Settlement>[] = [
    { key: "id", header: "Settlement" },
    { key: "orderId", header: "Order" },
    { key: "provider", header: "Provider" },
    { key: "resident", header: "Resident", render: (r) => <>{r.resident}<span className="block text-xs text-muted-foreground">{r.flat}</span></>, hideOnMobile: true },
    { key: "orderAmount", header: "Order value", render: (r) => <span className="tabular">{bdt(r.orderAmount)}</span>, value: (r) => r.orderAmount },
    { key: "commission", header: "Commission", render: (r) => <span className="tabular">{bdt(r.commission)} <span className="text-xs text-muted-foreground">({r.commissionRate}%)</span></span>, value: (r) => r.commission },
    { key: "refund", header: "Refund", render: (r) => <span className="tabular">{r.refund ? bdt(r.refund) : "—"}</span>, value: (r) => r.refund },
    { key: "providerPayable", header: "Payable to provider", render: (r) => <span className="tabular font-medium">{bdt(r.providerPayable)}</span>, value: (r) => r.providerPayable },
    { key: "method", header: "Method", render: (r) => titleize(r.method), hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Marketplace Settlements"
        description="Money flow for every service order: resident payment, community commission and provider payout."
        breadcrumb={["Accounts", "Settlements"]}
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border lg:grid-cols-4">
          <KpiCard label="Order value" value={bdt(sum("orderAmount"), true)} tone="primary" />
          <KpiCard label="Community commission" value={bdt(sum("commission"), true)} tone="success" />
          <KpiCard label="Provider payable" value={bdt(sum("providerPayable"), true)} tone="warning" />
          <KpiCard label="Refunds issued" value={bdt(sum("refund"), true)} tone="danger" />
        </div>
        <DataTable<Settlement>
          rows={data}
          columns={columns}
          loading={rows.isLoading}
          error={rows.isError ? humanizeError(rows.error) : null}
          onRetry={() => void rows.refetch()}
          filters={filters}
          exportName="settlements"
          searchPlaceholder="Search settlement, order or provider…"
          rowActions={[
            { label: "Approve settlement", onSelect: (r) => toast.success(`${r.id} approved for payout`) },
            { label: "Hold funds", onSelect: (r) => toast.success(`${r.id} held pending dispute review`) },
            { label: "Issue refund", onSelect: (r) => toast.success(`Refund raised for ${r.orderId}`), destructive: true },
          ]}
          bulkActions={[{ label: "Create payout batch", onSelect: (ids) => toast.success(`Payout batch created for ${ids.length} settlements`) }]}
        />
      </div>
    </>
  );
}
