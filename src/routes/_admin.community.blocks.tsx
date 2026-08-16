import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { blockService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/community/blocks")({
  head: () => ({
    meta: [
      { title: "Blocks — Bashundhara R/A" },
      { name: "description", content: "All residential blocks in Bashundhara R/A with roads, plots and resident counts." },
      { property: "og:title", content: "Blocks — Bashundhara R/A" },
      { property: "og:description", content: "All residential blocks in Bashundhara R/A with roads, plots and resident counts." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Block ID", className: "tabular" },
    { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "roads", header: "Roads", className: "tabular" },
    { key: "properties", header: "Properties", className: "tabular" },
    { key: "residents", header: "Residents", className: "tabular", hideOnMobile: true },
    { key: "gate", header: "Nearest gate", hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "status", label: "Status", options: ["active", "under_development"] },
];

function Page() {
  return (
    <ModulePage
      title="Blocks"
      description="All residential blocks in Bashundhara R/A with roads, plots and resident counts."
      breadcrumb={["Community", "Blocks"]}
      service={blockService as never}
      queryKey="blocks"
      columns={columns}
      filters={filters}
    />
  );
}
