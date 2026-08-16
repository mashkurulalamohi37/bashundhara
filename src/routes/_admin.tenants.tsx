import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { tenantService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/tenants")({
  head: () => ({
    meta: [
      { title: "Tenants & Leases — Bashundhara R/A" },
      { name: "description", content: "Tenancy register with lease term, rent, deposit and payment position — separate from ownership." },
      { property: "og:title", content: "Tenants & Leases — Bashundhara R/A" },
      { property: "og:description", content: "Tenancy register with lease term, rent, deposit and payment position — separate from ownership." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Tenant ID", className: "tabular" },
  { key: "name", header: "Tenant", render: (r) => <span className="font-medium">{r.name}</span> },
  { key: "flatId", header: "Flat" },
  { key: "ownerName", header: "Owner", hideOnMobile: true },
  { key: "leaseStart", header: "Lease start", hideOnMobile: true },
  { key: "leaseEnd", header: "Lease end" },
  { key: "monthlyRent", header: "Rent", render: (r) => <span className="tabular">{bdt(Number(r.monthlyRent ?? 0))}</span>, value: (r) => Number(r.monthlyRent ?? 0) },
  { key: "securityDeposit", header: "Deposit", render: (r) => <span className="tabular">{bdt(Number(r.securityDeposit ?? 0))}</span>, value: (r) => Number(r.securityDeposit ?? 0), hideOnMobile: true },
  { key: "paymentStatus", header: "Payment", render: (r) => <StatusBadge value={String(r.paymentStatus ?? "—")} /> },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "paymentStatus", label: "Payment", options: ["paid", "due", "overdue", "partial"] }, { key: "status", label: "Status", options: ["active", "notice_period", "moved_out"] }];

function Page() {
  return (
    <ModulePage
      title="Tenants & Leases"
      description="Tenancy register with lease term, rent, deposit and payment position — separate from ownership."
      breadcrumb={["People", "Tenants"]}
      service={tenantService as never}
      queryKey="tenants"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
