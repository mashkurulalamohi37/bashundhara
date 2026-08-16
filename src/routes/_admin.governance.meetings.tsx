import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { meetingService } from "@/services";
import type { Column } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/governance/meetings")({
  head: () => ({
    meta: [
      { title: "Meetings & Minutes — Bashundhara R/A" },
      { name: "description", content: "Committee meetings with decisions logged and action items tracked." },
      { property: "og:title", content: "Meetings & Minutes — Bashundhara R/A" },
      { property: "og:description", content: "Committee meetings with decisions logged and action items tracked." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Meeting ID", className: "tabular" },
    { key: "title", header: "Meeting", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "committee", header: "Committee" },
    { key: "date", header: "Date", className: "tabular" },
    { key: "participants", header: "Participants", className: "tabular", hideOnMobile: true },
    { key: "decisions", header: "Decisions", className: "tabular", hideOnMobile: true },
    { key: "actionItems", header: "Actions", className: "tabular", hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "status", label: "Status", options: ["scheduled", "held", "minuted"] },
];

const createFields: FieldDef[] = [
  { name: "title", label: "Meeting title", type: "text", required: true },
  { name: "committee", label: "Committee", type: "select", required: true, options: ["Executive Committee", "Security Sub-committee", "Finance Sub-committee", "Works Committee"] },
  { name: "date", label: "Meeting date", type: "date", required: true },
  { name: "participants", label: "Expected participants", type: "number" },
];

function Page() {
  return (
    <ModulePage
      title="Meetings & Minutes"
      description="Committee meetings with decisions logged and action items tracked."
      breadcrumb={["Governance", "Meetings"]}
      service={meetingService as never}
      queryKey="meetings"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Schedule meeting"
      detailTitle={(r: any) => r.title}
    />
  );
}
