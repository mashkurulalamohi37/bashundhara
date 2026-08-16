import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { auditService } from "@/services";
import { StatusBadge } from "@/components/app/primitives";
import type { Column } from "@/components/app/data-table";

export const Route = createFileRoute("/_admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Bashundhara R/A" },
      { name: "description", content: "Community configuration, roles and platform preferences." },
      { property: "og:title", content: "Settings — Bashundhara R/A" },
      { property: "og:description", content: "Community configuration, roles and platform preferences." },
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
      title="Settings"
      description="Community configuration, roles and platform preferences."
      breadcrumb={["System", "Settings"]}
      service={auditService as never}
      queryKey="settings-audit"
      columns={columns}
    />
  );
}
