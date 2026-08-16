import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { meetingService } from "@/services";
import { StatusBadge } from "@/components/app/primitives";
import type { Column } from "@/components/app/data-table";

export const Route = createFileRoute("/_admin/governance")({
  head: () => ({
    meta: [
      { title: "Welfare Society — Bashundhara R/A" },
      { name: "description", content: "Committee meetings, decisions and action items." },
      { property: "og:title", content: "Welfare Society — Bashundhara R/A" },
      { property: "og:description", content: "Committee meetings, decisions and action items." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
  { key: "title", header: "Meeting" },
  { key: "committee", header: "Committee" },
  { key: "date", header: "Date" },
  { key: "decisions", header: "Decisions" },
  { key: "actionItems", header: "Actions" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Welfare Society"
      description="Committee meetings, decisions and action items."
      breadcrumb={["Governance", "Overview"]}
      service={meetingService as never}
      queryKey="governance"
      columns={columns}
    />
  );
}
