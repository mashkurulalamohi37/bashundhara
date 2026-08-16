import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { announcementService } from "@/services";
import type { Column } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — Bashundhara R/A" },
      { name: "description", content: "Community notices broadcast over push, email and SMS channels." },
      { property: "og:title", content: "Announcements — Bashundhara R/A" },
      { property: "og:description", content: "Community notices broadcast over push, email and SMS channels." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Notice ID", className: "tabular" },
    { key: "title", header: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "audience", header: "Audience" },
    { key: "priority", header: "Priority", render: (r) => <StatusBadge value={String(r.priority)} /> },
    { key: "publishedBy", header: "Published by", hideOnMobile: true },
    { key: "publishedAt", header: "Published", hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "priority", label: "Priority", options: ["info", "warning", "emergency"] },
  { key: "status", label: "Status", options: ["published", "scheduled", "draft"] },
];

const createFields: FieldDef[] = [
  { name: "title", label: "Announcement title", type: "text", required: true },
  { name: "audience", label: "Audience", type: "select", required: true, options: ["All residents", "Block A", "Block B", "Block C", "Owners only", "Tenants only", "Security staff"] },
  { name: "priority", label: "Priority", type: "select", required: true, options: ["info", "warning", "emergency"] },
  { name: "body", label: "Message", type: "textarea", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Announcements"
      description="Community notices broadcast over push, email and SMS channels."
      breadcrumb={["Services", "Announcements"]}
      service={announcementService as never}
      queryKey="announcements"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="New announcement"
      detailTitle={(r: any) => r.title}
    />
  );
}
