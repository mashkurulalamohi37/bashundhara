import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { auditService } from "@/services";
import { StatusBadge } from "@/components/app/primitives";
import type { Column } from "@/components/app/data-table";

export const Route = createFileRoute("/_admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Bashundhara R/A" },
      { name: "description", content: "Operational, security, maintenance and finance reporting catalogue." },
      { property: "og:title", content: "Reports — Bashundhara R/A" },
      { property: "og:description", content: "Operational, security, maintenance and finance reporting catalogue." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
  { key: "timestamp", header: "Timestamp" },
  { key: "user", header: "User" },
  { key: "action", header: "Action" },
  { key: "module", header: "Module" },
];

function Page() {
  return (
    <ModulePage
      title="Reports"
      description="Operational, security, maintenance and finance reporting catalogue."
      breadcrumb={["Insight", "Reports"]}
      service={auditService as never}
      queryKey="reports-audit"
      columns={columns}
    />
  );
}
