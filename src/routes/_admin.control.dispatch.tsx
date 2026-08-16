import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { dispatchService } from "@/services";
import type { Column, FilterDef } from "@/components/app/data-table";

import { num, titleize } from "@/lib/format";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/control/dispatch")({
  head: () => ({
    meta: [
      { title: "Emergency Dispatch — Bashundhara R/A" },
      { name: "description", content: "SOS classification, team dispatch, acknowledgement and response outcomes." },
      { property: "og:title", content: "Emergency Dispatch — Bashundhara R/A" },
      { property: "og:description", content: "SOS classification, team dispatch, acknowledgement and response outcomes." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "sosRef", header: "SOS" },
  { key: "category", header: "Category", render: (r) => titleize(String(r.category)) },
  { key: "severity", header: "Severity", render: (r) => <StatusBadge value={r.severity} /> },
  { key: "reportedBy", header: "Reported by" },
  { key: "location", header: "Location" },
  { key: "reportedAt", header: "Reported at" },
  { key: "team", header: "Team" },
  { key: "officer", header: "Officer" },
  { key: "responseMinutes", header: "Response (min)", render: (r) => <span className="tabular">{num(r.responseMinutes)}</span>, value: (r) => r.responseMinutes },
  { key: "stage", header: "Stage", render: (r) => <StatusBadge value={r.stage} /> },
];

const filters: FilterDef[] = [
  { key: "category", label: "Category", options: ["medical", "fire", "security", "accident", "other"] },
  { key: "severity", label: "Severity", options: ["critical", "high", "medium"] },
  { key: "stage", label: "Stage", options: ["reported", "classified", "dispatched", "acknowledged", "responding", "on_scene", "resolved", "closed"] },
];

function Page() {
  return (
    <ModulePage
      title="Emergency Dispatch"
      description="SOS classification, team dispatch, acknowledgement and response outcomes."
      breadcrumb={["Control", "Dispatch"]}
      service={dispatchService as never}
      queryKey="ctl-dispatch"
      columns={columns}
      filters={filters}
      
      
    />
  );
}
