import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { announcementService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/governance/notices")({
  head: () => ({
    meta: [
      { title: "Society Notices — Bashundhara R/A" },
      { name: "description", content: "Official welfare society notices published to residents across Bashundhara R/A." },
      { property: "og:title", content: "Society Notices — Bashundhara R/A" },
      { property: "og:description", content: "Official welfare society notices published to residents across Bashundhara R/A." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
  { key: "id", header: "Notice", className: "tabular" },
  { key: "title", header: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
  { key: "audience", header: "Audience", hideOnMobile: true },
  { key: "publishedBy", header: "Published by", hideOnMobile: true },
  { key: "publishedAt", header: "Published", hideOnMobile: true },
  { key: "priority", header: "Priority", render: (r) => <StatusBadge value={String(r.priority)} /> },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Society Notices"
      description="Official welfare society notices published to residents across Bashundhara R/A."
      breadcrumb={["Governance", "Notices"]}
      service={announcementService as never}
      queryKey="governance-notices"
      columns={columns}
      filters={[{ key: "priority", label: "Priority", options: ["info", "warning", "emergency"] }, { key: "status", label: "Status", options: ["published", "scheduled", "draft"] }]}
      createFields={[
  { name: "title", label: "Notice title", required: true },
  { name: "body", label: "Body", type: "textarea", required: true },
  { name: "audience", label: "Audience", type: "select", options: ["All residents", "Owners", "Tenants", "Block A", "Block C"], required: true },
  { name: "priority", label: "Priority", type: "select", options: ["info", "warning", "emergency"], required: true },
]}
      createLabel="Publish notice"
    />
  );
}
