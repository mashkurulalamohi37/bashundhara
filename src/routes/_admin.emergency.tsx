import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { emergencyService } from "@/services";
import { StatusBadge } from "@/components/app/primitives";
import type { Column } from "@/components/app/data-table";

export const Route = createFileRoute("/_admin/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency Response — Bashundhara R/A" },
      { name: "description", content: "Active panic alerts, dispatched teams and response times." },
      { property: "og:title", content: "Emergency Response — Bashundhara R/A" },
      { property: "og:description", content: "Active panic alerts, dispatched teams and response times." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
  { key: "id", header: "Alert" },
  { key: "type", header: "Type" },
  { key: "resident", header: "Raised by" },
  { key: "location", header: "Location" },
  { key: "team", header: "Team" },
  { key: "responseMins", header: "Response (min)" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Emergency Response"
      description="Active panic alerts, dispatched teams and response times."
      breadcrumb={["Security", "Emergency"]}
      service={emergencyService as never}
      queryKey="emergencies"
      columns={columns}
    />
  );
}
