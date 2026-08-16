import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { accessPolicyService } from "@/services";
import type { Column, FilterDef } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/control/access-policies")({
  head: () => ({
    meta: [
      { title: "Access Policies — Bashundhara R/A" },
      { name: "description", content: "Who may enter which zone, through which gate, for what purpose and when." },
      { property: "og:title", content: "Access Policies — Bashundhara R/A" },
      { property: "og:description", content: "Who may enter which zone, through which gate, for what purpose and when." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Policy" },
  { key: "name", header: "Policy name" },
  { key: "personType", header: "Person type" },
  { key: "purpose", header: "Purpose" },
  { key: "property", header: "Property" },
  { key: "gate", header: "Gate" },
  { key: "windowStart", header: "From" },
  { key: "windowEnd", header: "To" },
  { key: "days", header: "Days" },
  { key: "validTo", header: "Valid until" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
];

const filters: FilterDef[] = [
  { key: "status", label: "Status", options: ["active", "expired", "suspended"] },
  { key: "personType", label: "Person type", options: ["Domestic worker", "Service provider", "Delivery rider", "Contractor", "Guest", "Vendor", "Tenant"] },
];

const createFields: FieldDef[] = [
  { name: "name", label: "Policy name", required: true },
  { name: "personType", label: "Person type", type: "select", options: ["Domestic worker", "Service provider", "Delivery rider", "Contractor", "Guest", "Vendor", "Tenant"], required: true },
  { name: "purpose", label: "Purpose", required: true },
  { name: "property", label: "Property / flat", required: true },
  { name: "gate", label: "Gate", type: "select", options: ["Gate 1", "Gate 2", "Gate 3", "Gate 4", "Gate 5", "Gate 6"], required: true },
  { name: "windowStart", label: "Window start (HH:MM)", required: true },
  { name: "windowEnd", label: "Window end (HH:MM)", required: true },
  { name: "validTo", label: "Valid until", type: "date", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Access Policies"
      description="Who may enter which zone, through which gate, for what purpose and when."
      breadcrumb={["Control", "Access Policies"]}
      service={accessPolicyService as never}
      queryKey="ctl-access-policies"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Create policy"
    />
  );
}
