import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { slaRuleService } from "@/services";
import type { Column, FilterDef } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { num } from "@/lib/format";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/control/sla")({
  head: () => ({
    meta: [
      { title: "SLA Rules & Tickets — Bashundhara R/A" },
      { name: "description", content: "Response and resolution targets by module, priority and escalation chain." },
      { property: "og:title", content: "SLA Rules & Tickets — Bashundhara R/A" },
      { property: "og:description", content: "Response and resolution targets by module, priority and escalation chain." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Rule" },
  { key: "name", header: "SLA rule" },
  { key: "module", header: "Module" },
  { key: "priority", header: "Priority", render: (r) => <StatusBadge value={r.priority} /> },
  { key: "targetMinutes", header: "Target (min)", render: (r) => <span className="tabular">{num(r.targetMinutes)}</span>, value: (r) => r.targetMinutes },
  { key: "escalationChain", header: "Escalation chain" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
];

const filters: FilterDef[] = [
  { key: "priority", label: "Priority", options: ["emergency", "critical", "high", "normal", "low"] },
  { key: "module", label: "Module", options: ["Emergency", "Fire Safety", "Security", "Maintenance", "Housekeeping", "Marketplace", "Finance", "Procurement"] },
];

const createFields: FieldDef[] = [
  { name: "name", label: "Rule name", required: true },
  { name: "module", label: "Module", type: "select", options: ["Emergency", "Fire Safety", "Security", "Maintenance", "Housekeeping", "Marketplace", "Finance", "Procurement"], required: true },
  { name: "priority", label: "Priority", type: "select", options: ["emergency", "critical", "high", "normal", "low"], required: true },
  { name: "targetMinutes", label: "Target (minutes)", type: "number", required: true },
];

function Page() {
  return (
    <ModulePage
      title="SLA Rules & Tickets"
      description="Response and resolution targets by module, priority and escalation chain."
      breadcrumb={["Control", "SLA"]}
      service={slaRuleService as never}
      queryKey="ctl-sla"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Add SLA rule"
    />
  );
}
