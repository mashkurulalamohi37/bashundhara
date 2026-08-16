import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { roadService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/community/roads")({
  head: () => ({
    meta: [
      { title: "Roads & Streets — Bashundhara R/A" },
      { name: "description", content: "Road inventory with surface condition, streetlight coverage and last repair date." },
      { property: "og:title", content: "Roads & Streets — Bashundhara R/A" },
      { property: "og:description", content: "Road inventory with surface condition, streetlight coverage and last repair date." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Road ID", className: "tabular" },
    { key: "name", header: "Road", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "block", header: "Block" },
    { key: "lengthM", header: "Length (m)", className: "tabular" },
    { key: "streetlights", header: "Streetlights", className: "tabular", hideOnMobile: true },
    { key: "lastRepair", header: "Last repair", hideOnMobile: true },
    { key: "condition", header: "Condition", render: (r) => <StatusBadge value={String(r.condition)} /> },
];

const filters = [
  { key: "block", label: "Block", options: ["Block A", "Block B", "Block C", "Block D", "Block E"] },
  { key: "condition", label: "Condition", options: ["good", "fair", "poor"] },
];

function Page() {
  return (
    <ModulePage
      title="Roads & Streets"
      description="Road inventory with surface condition, streetlight coverage and last repair date."
      breadcrumb={["Community", "Roads"]}
      service={roadService as never}
      queryKey="roads"
      columns={columns}
      filters={filters}
    />
  );
}
