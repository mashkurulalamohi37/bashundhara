import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { blockService } from "@/services";
import { StatusBadge } from "@/components/app/primitives";
import type { Column } from "@/components/app/data-table";

export const Route = createFileRoute("/_admin/community/")({
  head: () => ({
    meta: [
      { title: "Community Overview — Bashundhara R/A" },
      { name: "description", content: "Blocks, roads and property distribution across Bashundhara R/A." },
      { property: "og:title", content: "Community Overview — Bashundhara R/A" },
      { property: "og:description", content: "Blocks, roads and property distribution across Bashundhara R/A." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
  { key: "name", header: "Block" },
  { key: "roads", header: "Roads" },
  { key: "properties", header: "Properties" },
  { key: "residents", header: "Residents" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Community Overview"
      description="Blocks, roads and property distribution across Bashundhara R/A."
      breadcrumb={["Community", "Overview"]}
      service={blockService as never}
      queryKey="blocks-overview"
      columns={columns}
    />
  );
}
