import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { infrastructureService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import type { InfrastructureAsset } from "@/types";

export const Route = createFileRoute("/_admin/infrastructure/drainage")({
  head: () => ({
    meta: [
      { title: "Drainage — Bashundhara R/A" },
      { name: "description", content: "Drain lines, silt clearing schedule and monsoon readiness." },
      { property: "og:title", content: "Drainage — Bashundhara R/A" },
      { property: "og:description", content: "Drain lines, silt clearing schedule and monsoon readiness." },
    ],
  }),
  component: Page,
});

const service = {
  ...infrastructureService,
  all: async () => (await infrastructureService.all()).filter((a) => a.kind === "drain"),
};

const columns: Column<InfrastructureAsset>[] = [
  { key: "id", header: "Asset ID", className: "tabular" },
  { key: "name", header: "Asset", render: (r) => <span className="font-medium">{r.name}</span> },
  { key: "block", header: "Block" },
  { key: "location", header: "Location", hideOnMobile: true },
  { key: "lastService", header: "Last service", hideOnMobile: true },
  { key: "nextService", header: "Next service", hideOnMobile: true },
  { key: "responsible", header: "Responsible", hideOnMobile: true },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

function Page() {
  return (
    <ModulePage<InfrastructureAsset>
      title="Drainage"
      description="Drain lines, silt clearing schedule and monsoon readiness."
      breadcrumb={["Infrastructure", "Drainage"]}
      service={service as never}
      queryKey="infrastructure-drainage"
      columns={columns}
      filters={[{ key: "status", label: "Status", options: ["operational", "degraded", "down", "scheduled"] }]}
      createFields={[
        { name: "name", label: "Asset name", required: true },
        { name: "block", label: "Block", required: true },
        { name: "location", label: "Location", required: true },
        { name: "responsible", label: "Responsible team", required: true },
        { name: "nextService", label: "Next service", type: "date" },
      ]}
      createLabel="Add asset"
    />
  );
}
