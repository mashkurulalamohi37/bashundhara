import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { buildingService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/buildings")({
  head: () => ({
    meta: [
      { title: "Buildings — Bashundhara R/A" },
      { name: "description", content: "Every building in Bashundhara R/A with ownership, occupancy and monthly financial position." },
      { property: "og:title", content: "Buildings — Bashundhara R/A" },
      { property: "og:description", content: "Every building in Bashundhara R/A with ownership, occupancy and monthly financial position." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Building ID", className: "tabular" },
  { key: "name", header: "Building", render: (r) => <span className="font-medium">{r.name}</span> },
  { key: "address", header: "Address", hideOnMobile: true },
  { key: "block", header: "Block" },
  { key: "floors", header: "Floors", hideOnMobile: true },
  { key: "flats", header: "Flats" },
  { key: "occupiedFlats", header: "Occupied", hideOnMobile: true },
  { key: "ownerName", header: "Owner" },
  { key: "monthlyIncome", header: "Income", render: (r) => <span className="tabular">{bdt(Number(r.monthlyIncome ?? 0))}</span>, value: (r) => Number(r.monthlyIncome ?? 0) },
  { key: "monthlyExpense", header: "Expense", render: (r) => <span className="tabular">{bdt(Number(r.monthlyExpense ?? 0))}</span>, value: (r) => Number(r.monthlyExpense ?? 0), hideOnMobile: true },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "status", label: "Status", options: ["active", "under_construction", "renovation"] }, { key: "type", label: "Type", options: ["residential", "commercial", "mixed"] }];

function Page() {
  return (
    <ModulePage
      title="Buildings"
      description="Every building in Bashundhara R/A with ownership, occupancy and monthly financial position."
      breadcrumb={["Community", "Buildings"]}
      service={buildingService as never}
      queryKey="buildings"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
