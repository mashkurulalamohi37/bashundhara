import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { facilityService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/facilities")({
  head: () => ({
    meta: [
      { title: "Facilities — Bashundhara R/A" },
      { name: "description", content: "Community halls, playgrounds, sports and meeting spaces available for booking." },
      { property: "og:title", content: "Facilities — Bashundhara R/A" },
      { property: "og:description", content: "Community halls, playgrounds, sports and meeting spaces available for booking." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Facility ID", className: "tabular" },
    { key: "name", header: "Facility", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "kind", header: "Type", render: (r) => <StatusBadge value={String(r.kind)} /> },
    { key: "block", header: "Block" },
    { key: "capacity", header: "Capacity", className: "tabular", hideOnMobile: true },
    { key: "hourlyFee", header: "Hourly fee", render: (r) => <span className="tabular">{bdt(r.hourlyFee as number)}</span>, value: (r) => r.hourlyFee as number },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "kind", label: "Type", options: ["hall", "playground", "sports", "meeting", "event", "park"] },
  { key: "status", label: "Status", options: ["available", "booked", "maintenance"] },
];

function Page() {
  return (
    <ModulePage
      title="Facilities"
      description="Community halls, playgrounds, sports and meeting spaces available for booking."
      breadcrumb={["Services", "Facilities"]}
      service={facilityService as never}
      queryKey="facilities"
      columns={columns}
      filters={filters}
    />
  );
}
