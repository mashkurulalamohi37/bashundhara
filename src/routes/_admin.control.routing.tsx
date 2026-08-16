import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { routingRuleService } from "@/services";
import type { Column, FilterDef } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/control/routing")({
  head: () => ({
    meta: [
      { title: "Department Routing — Bashundhara R/A" },
      { name: "description", content: "Complaint and request categories mapped to departments, teams and SLA priority." },
      { property: "og:title", content: "Department Routing — Bashundhara R/A" },
      { property: "og:description", content: "Complaint and request categories mapped to departments, teams and SLA priority." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Rule" },
  { key: "category", header: "Category" },
  { key: "department", header: "Department" },
  { key: "team", header: "Team" },
  { key: "slaPriority", header: "SLA priority", render: (r) => <StatusBadge value={r.slaPriority} /> },
  { key: "escalation", header: "Escalation" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
];

const filters: FilterDef[] = [
  { key: "department", label: "Department", options: ["Maintenance", "Housekeeping", "Security", "Engineering", "Administration"] },
  { key: "slaPriority", label: "SLA priority", options: ["emergency", "critical", "high", "normal", "low"] },
];

const createFields: FieldDef[] = [
  { name: "category", label: "Category", required: true },
  { name: "department", label: "Department", type: "select", options: ["Maintenance", "Housekeeping", "Security", "Engineering", "Administration"], required: true },
  { name: "team", label: "Team", type: "select", options: ["Team Alpha", "Team Bravo", "Team Charlie", "Night Shift", "Rapid Response"], required: true },
  { name: "slaPriority", label: "SLA priority", type: "select", options: ["emergency", "critical", "high", "normal", "low"], required: true },
];

function Page() {
  return (
    <ModulePage
      title="Department Routing"
      description="Complaint and request categories mapped to departments, teams and SLA priority."
      breadcrumb={["Control", "Routing"]}
      service={routingRuleService as never}
      queryKey="ctl-routing"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Add routing rule"
    />
  );
}
