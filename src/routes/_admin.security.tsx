import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { gateService } from "@/services";
import { StatusBadge } from "@/components/app/primitives";
import type { Column } from "@/components/app/data-table";

export const Route = createFileRoute("/_admin/security")({
  head: () => ({
    meta: [
      { title: "Security Control Room — Bashundhara R/A" },
      { name: "description", content: "Live gate throughput, patrol status and camera health across all gates." },
      { property: "og:title", content: "Security Control Room — Bashundhara R/A" },
      { property: "og:description", content: "Live gate throughput, patrol status and camera health across all gates." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
  { key: "name", header: "Gate" },
  { key: "entriesToday", header: "Entries" },
  { key: "exitsToday", header: "Exits" },
  { key: "waiting", header: "Waiting" },
  { key: "officers", header: "Officers" },
  { key: "cctv", header: "CCTV", render: (r) => <StatusBadge value={String(r.cctv)} /> },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Security Control Room"
      description="Live gate throughput, patrol status and camera health across all gates."
      breadcrumb={["Security", "Control Room"]}
      service={gateService as never}
      queryKey="gates-control"
      columns={columns}
    />
  );
}
