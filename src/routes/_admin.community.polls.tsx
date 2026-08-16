import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { pollService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/community/polls")({
  head: () => ({
    meta: [
      { title: "Community Polls — Bashundhara R/A" },
      { name: "description", content: "Resident polls on community decisions, facilities and welfare society proposals." },
      { property: "og:title", content: "Community Polls — Bashundhara R/A" },
      { property: "og:description", content: "Resident polls on community decisions, facilities and welfare society proposals." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
  { key: "id", header: "Poll", className: "tabular" },
  { key: "question", header: "Question", render: (r) => <span className="font-medium">{r.question}</span> },
  { key: "group", header: "Group", hideOnMobile: true },
  { key: "options", header: "Options", hideOnMobile: true },
  { key: "votes", header: "Votes", className: "tabular" },
  { key: "closesOn", header: "Closes", hideOnMobile: true },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Community Polls"
      description="Resident polls on community decisions, facilities and welfare society proposals."
      breadcrumb={["Community", "Polls"]}
      service={pollService as never}
      queryKey="community-polls"
      columns={columns}
      filters={[{ key: "status", label: "Status", options: ["open", "closed"] }]}
      createFields={[
  { name: "question", label: "Poll question", required: true },
  { name: "options", label: "Options (comma separated)", required: true },
  { name: "group", label: "Group", required: true },
  { name: "closesOn", label: "Closes on", type: "date", required: true },
]}
      createLabel="Create poll"
    />
  );
}
