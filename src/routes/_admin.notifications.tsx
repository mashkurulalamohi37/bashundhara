import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { notificationService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Bashundhara R/A" },
      { name: "description", content: "Platform-wide alert stream across security, payments, maintenance and community." },
      { property: "og:title", content: "Notifications — Bashundhara R/A" },
      { property: "og:description", content: "Platform-wide alert stream across security, payments, maintenance and community." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "ID", className: "tabular" },
    { key: "title", header: "Notification", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "category", header: "Category", render: (r) => <StatusBadge value={String(r.category)} /> },
    { key: "severity", header: "Severity", render: (r) => <StatusBadge value={String(r.severity)} /> },
    { key: "createdAt", header: "Received", className: "tabular", hideOnMobile: true },
    { key: "read", header: "Read", render: (r) => <StatusBadge value={r.read ? "verified" : "pending"} /> },
];

const filters = [
  { key: "category", label: "Category", options: ["security", "emergency", "payment", "maintenance", "visitor", "booking", "announcement", "construction", "utility", "community"] },
  { key: "severity", label: "Severity", options: ["info", "warning", "emergency"] },
];

function Page() {
  return (
    <ModulePage
      title="Notifications"
      description="Platform-wide alert stream across security, payments, maintenance and community."
      breadcrumb={["System", "Notifications"]}
      service={notificationService as never}
      queryKey="notifications"
      columns={columns}
      filters={filters}
    />
  );
}
