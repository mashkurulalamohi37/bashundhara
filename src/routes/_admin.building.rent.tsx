import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { buildingIncomeService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/building/rent")({
  head: () => ({
    meta: [
      { title: "Rent & Building Income — Bashundhara R/A" },
      { name: "description", content: "Rent, parking, commercial rent, service charges and other building income with collection status." },
      { property: "og:title", content: "Rent & Building Income — Bashundhara R/A" },
      { property: "og:description", content: "Rent, parking, commercial rent, service charges and other building income with collection status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Entry ID", className: "tabular" },
  { key: "buildingId", header: "Building" },
  { key: "source", header: "Source", render: (r) => <StatusBadge value={String(r.source ?? "—")} /> },
  { key: "flatId", header: "Flat", hideOnMobile: true },
  { key: "payer", header: "Payer", render: (r) => <span className="font-medium">{r.payer}</span> },
  { key: "month", header: "Month", hideOnMobile: true },
  { key: "amount", header: "Amount", render: (r) => <span className="tabular">{bdt(Number(r.amount ?? 0))}</span>, value: (r) => Number(r.amount ?? 0) },
  { key: "method", header: "Method", hideOnMobile: true },
  { key: "date", header: "Date", hideOnMobile: true },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "source", label: "Source", options: ["rent", "parking_rent", "commercial_rent", "service_charge", "late_fee", "security_deposit", "other"] }, { key: "status", label: "Status", options: ["received", "pending", "overdue"] }];

function Page() {
  return (
    <ModulePage
      title="Rent & Building Income"
      description="Rent, parking, commercial rent, service charges and other building income with collection status."
      breadcrumb={["Building", "Rent"]}
      service={buildingIncomeService as never}
      queryKey="building-income"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
