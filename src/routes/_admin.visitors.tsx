import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { visitorService } from "@/services";
import type { Column } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/visitors")({
  head: () => ({
    meta: [
      { title: "Visitor Management — Bashundhara R/A" },
      { name: "description", content: "Pre-approvals, gate check-ins and visitor pass lifecycle across all gates." },
      { property: "og:title", content: "Visitor Management — Bashundhara R/A" },
      { property: "og:description", content: "Pre-approvals, gate check-ins and visitor pass lifecycle across all gates." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Visit ID", className: "tabular" },
    { key: "name", header: "Visitor", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "phone", header: "Phone", className: "tabular", hideOnMobile: true },
    { key: "category", header: "Category", render: (r) => <StatusBadge value={String(r.category)} /> },
    { key: "host", header: "Host" },
    { key: "block", header: "Block", hideOnMobile: true },
    { key: "gate", header: "Gate", hideOnMobile: true },
    { key: "date", header: "Date", className: "tabular" },
    { key: "passCode", header: "Pass", className: "tabular", hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "category", label: "Category", options: ["guest", "family", "delivery", "courier", "service", "driver", "contractor", "domestic_worker", "emergency"] },
  { key: "status", label: "Status", options: ["pending", "approved", "rejected", "checked_in", "checked_out", "expired"] },
  { key: "gate", label: "Gate", options: ["Gate 1", "Gate 2", "Gate 3", "Gate 4", "Gate 5", "Gate 6"] },
];

const createFields: FieldDef[] = [
  { name: "name", label: "Visitor name", type: "text", required: true },
  { name: "phone", label: "Mobile number", type: "tel", required: true },
  { name: "category", label: "Visitor category", type: "select", required: true, options: ["guest", "family", "delivery", "courier", "service", "driver", "contractor", "domestic_worker", "emergency"] },
  { name: "host", label: "Host resident", type: "text", required: true },
  { name: "propertyId", label: "Property ID", type: "text", placeholder: "PRP-0012" },
  { name: "gate", label: "Entry gate", type: "select", required: true, options: ["Gate 1", "Gate 2", "Gate 3", "Gate 4", "Gate 5", "Gate 6"] },
  { name: "date", label: "Visit date", type: "date", required: true },
  { name: "time", label: "Expected time", type: "text" },
  { name: "vehicle", label: "Vehicle registration", type: "text", placeholder: "Dhaka Metro Ga 21-4567" },
  { name: "purpose", label: "Purpose of visit", type: "textarea", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Visitor Management"
      description="Pre-approvals, gate check-ins and visitor pass lifecycle across all gates."
      breadcrumb={["Security", "Visitors"]}
      service={visitorService as never}
      queryKey="visitors"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Pre-approve visitor"
      detailTitle={(r: any) => r.name}
    />
  );
}
