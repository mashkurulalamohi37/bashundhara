import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { parkingService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/parking")({
  head: () => ({
    meta: [
      { title: "Parking Management — Bashundhara R/A" },
      { name: "description", content: "Parking zones, slot allocation and monthly parking fees by block." },
      { property: "og:title", content: "Parking Management — Bashundhara R/A" },
      { property: "og:description", content: "Parking zones, slot allocation and monthly parking fees by block." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Slot ID", className: "tabular" },
    { key: "code", header: "Slot", render: (r) => <span className="font-medium">{r.code}</span> },
    { key: "block", header: "Block" },
    { key: "zone", header: "Zone" },
    { key: "type", header: "Type", render: (r) => <StatusBadge value={String(r.type)} /> },
    { key: "allocatedTo", header: "Allocated to", hideOnMobile: true },
    { key: "monthlyFee", header: "Monthly fee", render: (r) => <span className="tabular">{bdt(r.monthlyFee as number)}</span>, value: (r) => r.monthlyFee as number },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "block", label: "Block", options: ["Block A", "Block B", "Block C", "Block D", "Block E"] },
  { key: "type", label: "Type", options: ["resident", "visitor", "commercial"] },
  { key: "status", label: "Status", options: ["available", "occupied", "reserved", "maintenance"] },
];

function Page() {
  return (
    <ModulePage
      title="Parking Management"
      description="Parking zones, slot allocation and monthly parking fees by block."
      breadcrumb={["Security", "Parking"]}
      service={parkingService as never}
      queryKey="parking"
      columns={columns}
      filters={filters}
    />
  );
}
