import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { gateService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/security/gates")({
  head: () => ({
    meta: [
      { title: "Gates — Bashundhara R/A" },
      { name: "description", content: "Gate configuration, staffing and live entry/exit throughput." },
      { property: "og:title", content: "Gates — Bashundhara R/A" },
      { property: "og:description", content: "Gate configuration, staffing and live entry/exit throughput." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Gate ID", className: "tabular" },
    { key: "name", header: "Gate", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "block", header: "Coverage" },
    { key: "entriesToday", header: "Entries", className: "tabular" },
    { key: "exitsToday", header: "Exits", className: "tabular" },
    { key: "waiting", header: "Waiting", className: "tabular", hideOnMobile: true },
    { key: "officers", header: "Officers", className: "tabular", hideOnMobile: true },
    { key: "cctv", header: "CCTV", render: (r) => <StatusBadge value={String(r.cctv)} /> },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "status", label: "Status", options: ["open", "restricted", "closed"] },
];

function Page() {
  return (
    <ModulePage
      title="Gates"
      description="Gate configuration, staffing and live entry/exit throughput."
      breadcrumb={["Security", "Gates"]}
      service={gateService as never}
      queryKey="gates"
      columns={columns}
      filters={filters}
    />
  );
}
