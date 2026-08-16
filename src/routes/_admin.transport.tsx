import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { transportService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/transport")({
  head: () => ({
    meta: [
      { title: "Transport & Shuttle — Bashundhara R/A" },
      { name: "description", content: "School buses, community shuttles and staff transport routes." },
      { property: "og:title", content: "Transport & Shuttle — Bashundhara R/A" },
      { property: "og:description", content: "School buses, community shuttles and staff transport routes." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Route ID", className: "tabular" },
    { key: "name", header: "Route", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "kind", header: "Type", render: (r) => <StatusBadge value={String(r.kind)} /> },
    { key: "vehicle", header: "Vehicle", className: "tabular" },
    { key: "driver", header: "Driver", hideOnMobile: true },
    { key: "stops", header: "Stops", className: "tabular", hideOnMobile: true },
    { key: "passengers", header: "Passengers", className: "tabular" },
    { key: "departure", header: "Departure", hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "kind", label: "Type", options: ["school", "shuttle", "staff"] },
  { key: "status", label: "Status", options: ["on_route", "idle", "maintenance"] },
];

function Page() {
  return (
    <ModulePage
      title="Transport & Shuttle"
      description="School buses, community shuttles and staff transport routes."
      breadcrumb={["Operations", "Transport"]}
      service={transportService as never}
      queryKey="transport"
      columns={columns}
      filters={filters}
    />
  );
}
