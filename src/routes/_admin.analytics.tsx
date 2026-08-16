import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { auditService } from "@/services";
import { StatusBadge } from "@/components/app/primitives";
import type { Column } from "@/components/app/data-table";

export const Route = createFileRoute("/_admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Bashundhara R/A" },
      { name: "description", content: "Trends across visitors, incidents, resolution rate and collections." },
      { property: "og:title", content: "Analytics — Bashundhara R/A" },
      { property: "og:description", content: "Trends across visitors, incidents, resolution rate and collections." },
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
      title="Analytics"
      description="Trends across visitors, incidents, resolution rate and collections."
      breadcrumb={["Insight", "Analytics"]}
      service={auditService as never}
      queryKey="analytics-audit"
      columns={columns}
    />
  );
}
