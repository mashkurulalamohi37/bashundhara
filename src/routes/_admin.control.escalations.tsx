import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { escalationRuleService } from "@/services";
import type { Column, FilterDef } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { num, titleize } from "@/lib/format";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/control/escalations")({
  head: () => ({
    meta: [
      { title: "Escalation Matrix — Bashundhara R/A" },
      { name: "description", content: "Automatic escalation triggers, timers and role ladders across modules." },
      { property: "og:title", content: "Escalation Matrix — Bashundhara R/A" },
      { property: "og:description", content: "Automatic escalation triggers, timers and role ladders across modules." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Rule" },
  { key: "name", header: "Escalation" },
  { key: "module", header: "Module" },
  { key: "trigger", header: "Trigger", render: (r) => titleize(String(r.trigger)) },
  { key: "afterMinutes", header: "After (min)", render: (r) => <span className="tabular">{num(r.afterMinutes)}</span>, value: (r) => r.afterMinutes },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
];

const filters: FilterDef[] = [
  { key: "module", label: "Module", options: ["Emergency", "Maintenance", "Security", "Marketplace", "Finance", "Procurement"] },
];

const createFields: FieldDef[] = [
  { name: "name", label: "Escalation name", required: true },
  { name: "module", label: "Module", type: "select", options: ["Emergency", "Maintenance", "Security", "Marketplace", "Finance", "Procurement"], required: true },
  { name: "trigger", label: "Trigger", type: "select", options: ["no_acknowledgement", "sla_breach", "repeat_incident", "threshold_exceeded"], required: true },
  { name: "afterMinutes", label: "Escalate after (minutes)", type: "number", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Escalation Matrix"
      description="Automatic escalation triggers, timers and role ladders across modules."
      breadcrumb={["Control", "Escalations"]}
      service={escalationRuleService as never}
      queryKey="ctl-escalations"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Add escalation"
    />
  );
}
