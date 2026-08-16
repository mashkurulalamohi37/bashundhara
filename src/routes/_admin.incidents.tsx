import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { incidentService } from "@/services";
import type { Column } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/incidents")({
  head: () => ({
    meta: [
      { title: "Incident Register — Bashundhara R/A" },
      { name: "description", content: "Security incidents with severity, assignment and investigation status." },
      { property: "og:title", content: "Incident Register — Bashundhara R/A" },
      { property: "og:description", content: "Security incidents with severity, assignment and investigation status." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Incident ID", className: "tabular" },
    { key: "title", header: "Incident", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "category", header: "Category", render: (r) => <StatusBadge value={String(r.category)} /> },
    { key: "location", header: "Location", hideOnMobile: true },
    { key: "block", header: "Block" },
    { key: "assignedTo", header: "Assigned to", hideOnMobile: true },
    { key: "reportedAt", header: "Reported", className: "tabular", hideOnMobile: true },
    { key: "severity", header: "Severity", render: (r) => <StatusBadge value={String(r.severity)} /> },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "category", label: "Category", options: ["security", "accident", "fire", "medical", "theft", "unauthorized_access", "vehicle", "property_damage", "infrastructure", "other"] },
  { key: "severity", label: "Severity", options: ["low", "medium", "high", "critical"] },
  { key: "status", label: "Status", options: ["open", "investigating", "resolved", "closed"] },
];

const createFields: FieldDef[] = [
  { name: "title", label: "Incident title", type: "text", required: true },
  { name: "category", label: "Category", type: "select", required: true, options: ["security", "accident", "fire", "medical", "theft", "unauthorized_access", "vehicle", "property_damage", "infrastructure", "other"] },
  { name: "location", label: "Location", type: "text", required: true },
  { name: "block", label: "Block", type: "select", required: true, options: ["Block A", "Block B", "Block C", "Block D", "Block E"] },
  { name: "severity", label: "Severity", type: "select", required: true, options: ["low", "medium", "high", "critical"] },
  { name: "assignedTo", label: "Assign to officer", type: "text" },
  { name: "description", label: "Description", type: "textarea", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Incident Register"
      description="Security incidents with severity, assignment and investigation status."
      breadcrumb={["Security", "Incidents"]}
      service={incidentService as never}
      queryKey="incidents"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Log incident"
      detailTitle={(r: any) => r.title}
    />
  );
}
