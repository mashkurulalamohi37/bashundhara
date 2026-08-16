import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { flatService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/flats/")({
  head: () => ({
    meta: [
      { title: "Flats & Occupancy — Bashundhara R/A" },
      { name: "description", content: "Flat-level registry with size, occupancy status and monthly service charge." },
      { property: "og:title", content: "Flats & Occupancy — Bashundhara R/A" },
      { property: "og:description", content: "Flat-level registry with size, occupancy status and monthly service charge." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Flat ID", className: "tabular" },
    { key: "number", header: "Flat", render: (r) => <span className="font-medium">{r.number}</span> },
    { key: "propertyId", header: "Property", className: "tabular" },
    { key: "block", header: "Block" },
    { key: "sizeSqft", header: "Size (sqft)", className: "tabular", hideOnMobile: true },
    { key: "bedrooms", header: "Beds", className: "tabular", hideOnMobile: true },
    { key: "monthlyCharge", header: "Monthly charge", render: (r) => <span className="tabular">{bdt(r.monthlyCharge as number)}</span>, value: (r) => r.monthlyCharge as number },
    { key: "occupancy", header: "Occupancy", render: (r) => <StatusBadge value={String(r.occupancy)} /> },
];

const filters = [
  { key: "block", label: "Block", options: ["Block A", "Block B", "Block C", "Block D", "Block E"] },
  { key: "occupancy", label: "Occupancy", options: ["occupied", "vacant"] },
];

function Page() {
  return (
    <ModulePage
      title="Flats & Occupancy"
      description="Flat-level registry with size, occupancy status and monthly service charge."
      breadcrumb={["Community", "Flats"]}
      service={flatService as never}
      queryKey="flats"
      columns={columns}
      filters={filters}
    />
  );
}
