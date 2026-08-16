import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { complaintService } from "@/services";
import type { Column } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/maintenance")({
  head: () => ({
    meta: [
      { title: "Complaints — Bashundhara R/A" },
      { name: "description", content: "Resident complaints routed by department with SLA tracking and escalation." },
      { property: "og:title", content: "Complaints — Bashundhara R/A" },
      { property: "og:description", content: "Resident complaints routed by department with SLA tracking and escalation." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Ticket", className: "tabular" },
    { key: "title", header: "Complaint", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "category", header: "Category", render: (r) => <StatusBadge value={String(r.category)} /> },
    { key: "block", header: "Block" },
    { key: "department", header: "Department", hideOnMobile: true },
    { key: "assignedTo", header: "Assigned to", hideOnMobile: true },
    { key: "slaHours", header: "SLA (h)", className: "tabular", hideOnMobile: true },
    { key: "priority", header: "Priority", render: (r) => <StatusBadge value={String(r.priority)} /> },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "category", label: "Category", options: ["water", "electricity", "drainage", "road", "streetlight", "waste", "cleaning", "parking", "security", "construction", "noise", "other"] },
  { key: "priority", label: "Priority", options: ["low", "medium", "high", "critical"] },
  { key: "status", label: "Status", options: ["new", "assigned", "in_progress", "waiting", "resolved", "closed"] },
];

const createFields: FieldDef[] = [
  { name: "title", label: "Complaint title", type: "text", required: true },
  { name: "category", label: "Category", type: "select", required: true, options: ["water", "electricity", "drainage", "road", "streetlight", "waste", "cleaning", "parking", "security", "construction", "noise", "other"] },
  { name: "location", label: "Location", type: "text", required: true },
  { name: "block", label: "Block", type: "select", required: true, options: ["Block A", "Block B", "Block C", "Block D", "Block E"] },
  { name: "priority", label: "Priority", type: "select", required: true, options: ["low", "medium", "high", "critical"] },
  { name: "department", label: "Department", type: "select", options: ["Water & Sewerage", "Electrical", "Civil Works", "Sanitation", "Security", "Horticulture"] },
  { name: "description", label: "Description", type: "textarea", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Complaints"
      description="Resident complaints routed by department with SLA tracking and escalation."
      breadcrumb={["Operations", "Complaints"]}
      service={complaintService as never}
      queryKey="complaints"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Raise complaint"
      detailTitle={(r: any) => r.title}
    />
  );
}
