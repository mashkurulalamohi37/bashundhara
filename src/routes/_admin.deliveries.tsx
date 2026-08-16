import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { deliveryService } from "@/services";
import type { Column } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/deliveries")({
  head: () => ({
    meta: [
      { title: "Deliveries & Parcels — Bashundhara R/A" },
      { name: "description", content: "Courier parcels held at gate, recipient notification and handover status." },
      { property: "og:title", content: "Deliveries & Parcels — Bashundhara R/A" },
      { property: "og:description", content: "Courier parcels held at gate, recipient notification and handover status." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Delivery ID", className: "tabular" },
    { key: "courier", header: "Courier", render: (r) => <span className="font-medium">{r.courier}</span> },
    { key: "parcelCode", header: "Parcel code", className: "tabular" },
    { key: "recipient", header: "Recipient" },
    { key: "propertyId", header: "Property", className: "tabular", hideOnMobile: true },
    { key: "gate", header: "Gate", hideOnMobile: true },
    { key: "receivedAt", header: "Received", hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "status", label: "Status", options: ["at_gate", "notified", "delivered", "returned"] },
  { key: "gate", label: "Gate", options: ["Gate 1", "Gate 2", "Gate 3", "Gate 4", "Gate 5", "Gate 6"] },
];

const createFields: FieldDef[] = [
  { name: "courier", label: "Courier company", type: "select", required: true, options: ["Pathao", "Steadfast", "RedX", "Sundarban", "eCourier", "Daraz Express"] },
  { name: "personnel", label: "Delivery personnel", type: "text", required: true },
  { name: "parcelCode", label: "Parcel code", type: "text", required: true },
  { name: "recipient", label: "Recipient name", type: "text", required: true },
  { name: "propertyId", label: "Property ID", type: "text", required: true },
  { name: "gate", label: "Gate", type: "select", required: true, options: ["Gate 1", "Gate 2", "Gate 3", "Gate 4", "Gate 5", "Gate 6"] },
];

function Page() {
  return (
    <ModulePage
      title="Deliveries & Parcels"
      description="Courier parcels held at gate, recipient notification and handover status."
      breadcrumb={["Security", "Deliveries"]}
      service={deliveryService as never}
      queryKey="deliveries"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Log parcel"
      detailTitle={(r: any) => r.parcelCode}
    />
  );
}
