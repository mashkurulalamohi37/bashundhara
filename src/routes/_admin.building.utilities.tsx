import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { utilityBillService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/building/utilities")({
  head: () => ({
    meta: [
      { title: "Building Utilities — Bashundhara R/A" },
      { name: "description", content: "Electricity, water, gas, generator and internet meters at common-area and flat level." },
      { property: "og:title", content: "Building Utilities — Bashundhara R/A" },
      { property: "og:description", content: "Electricity, water, gas, generator and internet meters at common-area and flat level." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Bill ID", className: "tabular" },
  { key: "buildingId", header: "Building" },
  { key: "utility", header: "Utility", render: (r) => <StatusBadge value={String(r.utility ?? "—")} /> },
  { key: "meter", header: "Meter", className: "tabular", hideOnMobile: true },
  { key: "scope", header: "Scope", render: (r) => <StatusBadge value={String(r.scope ?? "—")} /> },
  { key: "flatId", header: "Flat", hideOnMobile: true },
  { key: "month", header: "Month" },
  { key: "units", header: "Units", hideOnMobile: true },
  { key: "amount", header: "Amount", render: (r) => <span className="tabular">{bdt(Number(r.amount ?? 0))}</span>, value: (r) => Number(r.amount ?? 0) },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "utility", label: "Utility", options: ["electricity", "water", "gas", "generator", "internet"] }, { key: "scope", label: "Scope", options: ["common_area", "flat"] }, { key: "status", label: "Status", options: ["paid", "due", "overdue"] }];

function Page() {
  return (
    <ModulePage
      title="Building Utilities"
      description="Electricity, water, gas, generator and internet meters at common-area and flat level."
      breadcrumb={["Building", "Utilities"]}
      service={utilityBillService as never}
      queryKey="utility-bills"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
