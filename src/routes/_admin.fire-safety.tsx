import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { fireSafetyService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/fire-safety")({
  head: () => ({
    meta: [
      { title: "Fire Safety — Bashundhara R/A" },
      { name: "description", content: "Extinguishers, hydrants, alarms and sprinklers with inspection schedule." },
      { property: "og:title", content: "Fire Safety — Bashundhara R/A" },
      { property: "og:description", content: "Extinguishers, hydrants, alarms and sprinklers with inspection schedule." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Asset ID", className: "tabular" },
    { key: "type", header: "Type", render: (r) => <StatusBadge value={String(r.type)} /> },
    { key: "location", header: "Location", render: (r) => <span className="font-medium">{r.location}</span> },
    { key: "block", header: "Block" },
    { key: "lastInspection", header: "Last inspection", hideOnMobile: true },
    { key: "nextInspection", header: "Next inspection", hideOnMobile: true },
    { key: "team", header: "Team", hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "type", label: "Asset type", options: ["extinguisher", "hydrant", "alarm", "sprinkler"] },
  { key: "status", label: "Status", options: ["ok", "due", "faulty"] },
];

function Page() {
  return (
    <ModulePage
      title="Fire Safety"
      description="Extinguishers, hydrants, alarms and sprinklers with inspection schedule."
      breadcrumb={["Security", "Fire Safety"]}
      service={fireSafetyService as never}
      queryKey="fire-assets"
      columns={columns}
      filters={filters}
    />
  );
}
