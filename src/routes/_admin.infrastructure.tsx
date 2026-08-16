import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { infrastructureService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/infrastructure")({
  head: () => ({
    meta: [
      { title: "Infrastructure — Bashundhara R/A" },
      { name: "description", content: "Roads, drains, streetlights, water and waste assets with service schedule." },
      { property: "og:title", content: "Infrastructure — Bashundhara R/A" },
      { property: "og:description", content: "Roads, drains, streetlights, water and waste assets with service schedule." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Asset ID", className: "tabular" },
    { key: "name", header: "Asset", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "kind", header: "Kind", render: (r) => <StatusBadge value={String(r.kind)} /> },
    { key: "block", header: "Block" },
    { key: "location", header: "Location", hideOnMobile: true },
    { key: "lastService", header: "Last service", hideOnMobile: true },
    { key: "nextService", header: "Next service", hideOnMobile: true },
    { key: "responsible", header: "Owner", hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "kind", label: "Asset kind", options: ["road", "drain", "streetlight", "water", "waste", "park", "fogging"] },
  { key: "status", label: "Status", options: ["operational", "degraded", "down", "scheduled"] },
];

function Page() {
  return (
    <ModulePage
      title="Infrastructure"
      description="Roads, drains, streetlights, water and waste assets with service schedule."
      breadcrumb={["Operations", "Infrastructure"]}
      service={infrastructureService as never}
      queryKey="infrastructure"
      columns={columns}
      filters={filters}
    />
  );
}
