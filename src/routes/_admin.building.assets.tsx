import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { buildingAssetService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/building/assets")({
  head: () => ({
    meta: [
      { title: "Building Assets — Bashundhara R/A" },
      { name: "description", content: "Lifts, generators, pumps, CCTV and fire equipment with warranty, condition and maintenance schedule." },
      { property: "og:title", content: "Building Assets — Bashundhara R/A" },
      { property: "og:description", content: "Lifts, generators, pumps, CCTV and fire equipment with warranty, condition and maintenance schedule." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Asset ID", className: "tabular" },
  { key: "name", header: "Asset", render: (r) => <span className="font-medium">{r.name}</span> },
  { key: "category", header: "Category", render: (r) => <StatusBadge value={String(r.category ?? "—")} /> },
  { key: "buildingId", header: "Building" },
  { key: "location", header: "Location", hideOnMobile: true },
  { key: "cost", header: "Cost", render: (r) => <span className="tabular">{bdt(Number(r.cost ?? 0))}</span>, value: (r) => Number(r.cost ?? 0), hideOnMobile: true },
  { key: "warrantyUntil", header: "Warranty", hideOnMobile: true },
  { key: "condition", header: "Condition", render: (r) => <StatusBadge value={String(r.condition ?? "—")} /> },
  { key: "nextMaintenance", header: "Next service" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "category", label: "Category", options: ["lift", "generator", "pump", "water_tank", "cctv", "fire_extinguisher", "fire_pump", "ac", "solar", "electrical", "furniture", "appliance"] }, { key: "status", label: "Status", options: ["operational", "under_maintenance", "faulty", "retired"] }];

function Page() {
  return (
    <ModulePage
      title="Building Assets"
      description="Lifts, generators, pumps, CCTV and fire equipment with warranty, condition and maintenance schedule."
      breadcrumb={["Building", "Assets"]}
      service={buildingAssetService as never}
      queryKey="building-assets"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
