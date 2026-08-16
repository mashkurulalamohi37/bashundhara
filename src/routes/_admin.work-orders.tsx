import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { workOrderService } from "@/services";
import type { Column } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/work-orders")({
  head: () => ({
    meta: [
      { title: "Work Orders — Bashundhara R/A" },
      { name: "description", content: "Technician assignment, cost estimation and completion tracking for field work." },
      { property: "og:title", content: "Work Orders — Bashundhara R/A" },
      { property: "og:description", content: "Technician assignment, cost estimation and completion tracking for field work." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Work order", className: "tabular" },
    { key: "title", header: "Task", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "complaintId", header: "Ticket", className: "tabular", hideOnMobile: true },
    { key: "team", header: "Team" },
    { key: "technician", header: "Technician", hideOnMobile: true },
    { key: "block", header: "Block" },
    { key: "estimatedCost", header: "Estimated", render: (r) => <span className="tabular">{bdt(r.estimatedCost as number)}</span>, value: (r) => r.estimatedCost as number },
    { key: "startDate", header: "Start", hideOnMobile: true },
    { key: "priority", header: "Priority", render: (r) => <StatusBadge value={String(r.priority)} /> },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "status", label: "Status", options: ["draft", "assigned", "in_progress", "inspection", "completed", "closed"] },
  { key: "priority", label: "Priority", options: ["low", "medium", "high", "critical"] },
];

const createFields: FieldDef[] = [
  { name: "title", label: "Work order title", type: "text", required: true },
  { name: "complaintId", label: "Linked complaint", type: "text", placeholder: "CMP-0042" },
  { name: "team", label: "Team", type: "select", required: true, options: ["Civil Works", "Electrical", "Plumbing", "Sanitation", "Horticulture"] },
  { name: "technician", label: "Technician", type: "text" },
  { name: "location", label: "Location", type: "text", required: true },
  { name: "block", label: "Block", type: "select", required: true, options: ["Block A", "Block B", "Block C", "Block D", "Block E"] },
  { name: "estimatedCost", label: "Estimated cost (BDT)", type: "number", required: true },
  { name: "startDate", label: "Start date", type: "date", required: true },
  { name: "priority", label: "Priority", type: "select", required: true, options: ["low", "medium", "high", "critical"] },
];

function Page() {
  return (
    <ModulePage
      title="Work Orders"
      description="Technician assignment, cost estimation and completion tracking for field work."
      breadcrumb={["Operations", "Work Orders"]}
      service={workOrderService as never}
      queryKey="work-orders"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Create work order"
      detailTitle={(r: any) => r.title}
    />
  );
}
