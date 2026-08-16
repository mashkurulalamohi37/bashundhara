import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { propertyService } from "@/services";
import type { Column } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/properties")({
  head: () => ({
    meta: [
      { title: "Properties — Bashundhara R/A" },
      { name: "description", content: "Plot, building and apartment registry with ownership, occupancy and outstanding dues." },
      { property: "og:title", content: "Properties — Bashundhara R/A" },
      { property: "og:description", content: "Plot, building and apartment registry with ownership, occupancy and outstanding dues." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Property ID", className: "tabular" },
    { key: "address", header: "Address", render: (r) => <span className="font-medium">{r.address}</span> },
    { key: "block", header: "Block" },
    { key: "type", header: "Type", render: (r) => <StatusBadge value={String(r.type)} /> },
    { key: "flats", header: "Flats", className: "tabular", hideOnMobile: true },
    { key: "owner", header: "Owner", hideOnMobile: true },
    { key: "occupancy", header: "Occupancy", render: (r) => <StatusBadge value={String(r.occupancy)} /> },
    { key: "dues", header: "Dues", render: (r) => <span className="tabular">{bdt(r.dues as number)}</span>, value: (r) => r.dues as number },
];

const filters = [
  { key: "block", label: "Block", options: ["Block A", "Block B", "Block C", "Block D", "Block E"] },
  { key: "type", label: "Type", options: ["apartment", "duplex", "commercial", "plot"] },
  { key: "occupancy", label: "Occupancy", options: ["occupied", "vacant", "partial"] },
];

const createFields: FieldDef[] = [
  { name: "address", label: "Address", type: "text", required: true, placeholder: "House 42, Road 7, Block C" },
  { name: "block", label: "Block", type: "select", required: true, options: ["Block A", "Block B", "Block C", "Block D", "Block E"] },
  { name: "type", label: "Property type", type: "select", required: true, options: ["apartment", "duplex", "commercial", "plot"] },
  { name: "flats", label: "Number of flats", type: "number" },
  { name: "owner", label: "Owner name", type: "text", required: true },
  { name: "road", label: "Road", type: "text", placeholder: "Road 7" },
];

function Page() {
  return (
    <ModulePage
      title="Properties"
      description="Plot, building and apartment registry with ownership, occupancy and outstanding dues."
      breadcrumb={["Community", "Properties"]}
      service={propertyService as never}
      queryKey="properties"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Add property"
      detailTitle={(r: any) => r.address}
    />
  );
}
