import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { vehicleService } from "@/services";
import type { Column } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/vehicles")({
  head: () => ({
    meta: [
      { title: "Vehicle Registry — Bashundhara R/A" },
      { name: "description", content: "Resident, visitor and commercial vehicles with sticker validity and parking allocation." },
      { property: "og:title", content: "Vehicle Registry — Bashundhara R/A" },
      { property: "og:description", content: "Resident, visitor and commercial vehicles with sticker validity and parking allocation." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Vehicle ID", className: "tabular" },
    { key: "registration", header: "Registration", render: (r) => <span className="font-medium">{r.registration}</span> },
    { key: "type", header: "Type", render: (r) => <StatusBadge value={String(r.type)} /> },
    { key: "brand", header: "Brand", hideOnMobile: true },
    { key: "ownerName", header: "Owner" },
    { key: "block", header: "Block", hideOnMobile: true },
    { key: "sticker", header: "Sticker", className: "tabular", hideOnMobile: true },
    { key: "parkingSlot", header: "Slot", className: "tabular", hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "type", label: "Vehicle type", options: ["car", "microbus", "motorcycle", "bicycle", "truck", "ambulance"] },
  { key: "category", label: "Category", options: ["resident", "visitor", "commercial", "service"] },
  { key: "status", label: "Status", options: ["active", "expired", "blocked"] },
];

const createFields: FieldDef[] = [
  { name: "registration", label: "Registration number", type: "text", required: true, placeholder: "Dhaka Metro Ga 21-4567" },
  { name: "type", label: "Vehicle type", type: "select", required: true, options: ["car", "microbus", "motorcycle", "bicycle", "truck", "ambulance"] },
  { name: "brand", label: "Brand", type: "text" },
  { name: "model", label: "Model", type: "text" },
  { name: "color", label: "Colour", type: "text" },
  { name: "ownerName", label: "Owner name", type: "text", required: true },
  { name: "block", label: "Block", type: "select", required: true, options: ["Block A", "Block B", "Block C", "Block D", "Block E"] },
  { name: "category", label: "Category", type: "select", required: true, options: ["resident", "visitor", "commercial", "service"] },
];

function Page() {
  return (
    <ModulePage
      title="Vehicle Registry"
      description="Resident, visitor and commercial vehicles with sticker validity and parking allocation."
      breadcrumb={["Security", "Vehicles"]}
      service={vehicleService as never}
      queryKey="vehicles"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Register vehicle"
      detailTitle={(r: any) => r.registration}
    />
  );
}
