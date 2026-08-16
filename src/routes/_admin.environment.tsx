import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { infrastructureService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/environment")({
  head: () => ({
    meta: [
      { title: "Environment & Sanitation — Bashundhara R/A" },
      { name: "description", content: "Waste collection, mosquito fogging, parks and green-space operations." },
      { property: "og:title", content: "Environment & Sanitation — Bashundhara R/A" },
      { property: "og:description", content: "Waste collection, mosquito fogging, parks and green-space operations." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Asset ID", className: "tabular" },
    { key: "name", header: "Programme", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "kind", header: "Kind", render: (r) => <StatusBadge value={String(r.kind)} /> },
    { key: "block", header: "Block" },
    { key: "nextService", header: "Next service", hideOnMobile: true },
    { key: "responsible", header: "Responsible", hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "kind", label: "Kind", options: ["waste", "park", "fogging", "drain"] },
  { key: "status", label: "Status", options: ["operational", "degraded", "down", "scheduled"] },
];

function Page() {
  return (
    <ModulePage
      title="Environment & Sanitation"
      description="Waste collection, mosquito fogging, parks and green-space operations."
      breadcrumb={["Operations", "Environment"]}
      service={infrastructureService as never}
      queryKey="environment"
      columns={columns}
      filters={filters}
    />
  );
}
