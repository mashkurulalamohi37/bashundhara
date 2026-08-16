import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { auditService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/audit-logs")({
  head: () => ({
    meta: [
      { title: "Audit Logs — Bashundhara R/A" },
      { name: "description", content: "Immutable trail of administrative actions with user, role, IP and timestamp." },
      { property: "og:title", content: "Audit Logs — Bashundhara R/A" },
      { property: "og:description", content: "Immutable trail of administrative actions with user, role, IP and timestamp." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Entry", className: "tabular" },
    { key: "timestamp", header: "Timestamp", className: "tabular" },
    { key: "user", header: "User", render: (r) => <span className="font-medium">{r.user}</span> },
    { key: "role", header: "Role", render: (r) => <StatusBadge value={String(r.role)} /> },
    { key: "action", header: "Action" },
    { key: "module", header: "Module", hideOnMobile: true },
    { key: "target", header: "Target", className: "tabular", hideOnMobile: true },
    { key: "ip", header: "IP address", className: "tabular", hideOnMobile: true },
];

const filters = [
  { key: "module", label: "Module", options: ["Residents", "Visitors", "Finance", "Security", "Maintenance", "Settings"] },
];

function Page() {
  return (
    <ModulePage
      title="Audit Logs"
      description="Immutable trail of administrative actions with user, role, IP and timestamp."
      breadcrumb={["Insight", "Audit"]}
      service={auditService as never}
      queryKey="audit-logs"
      columns={columns}
      filters={filters}
    />
  );
}
