import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { ownerService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/owners")({
  head: () => ({
    meta: [
      { title: "Flat Owners — Bashundhara R/A" },
      { name: "description", content: "Ownership register — owners are tracked separately from tenants, with share, tenure and documents." },
      { property: "og:title", content: "Flat Owners — Bashundhara R/A" },
      { property: "og:description", content: "Ownership register — owners are tracked separately from tenants, with share, tenure and documents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Owner ID", className: "tabular" },
  { key: "name", header: "Owner", render: (r) => <span className="font-medium">{r.name}</span> },
  { key: "nameBn", header: "Bangla name", hideOnMobile: true },
  { key: "phone", header: "Phone", className: "tabular", hideOnMobile: true },
  { key: "flatId", header: "Flat" },
  { key: "buildingId", header: "Building", hideOnMobile: true },
  { key: "ownershipPct", header: "Share %" },
  { key: "ownershipStart", header: "Since", hideOnMobile: true },
  { key: "occupancy", header: "Occupancy", render: (r) => <StatusBadge value={String(r.occupancy ?? "—")} /> },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "occupancy", label: "Occupancy", options: ["living_in", "renting_out", "partial", "vacant"] }, { key: "status", label: "Status", options: ["active", "transferred", "inactive"] }];

function Page() {
  return (
    <ModulePage
      title="Flat Owners"
      description="Ownership register — owners are tracked separately from tenants, with share, tenure and documents."
      breadcrumb={["People", "Owners"]}
      service={ownerService as never}
      queryKey="owners"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
