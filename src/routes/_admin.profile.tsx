import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { auditService } from "@/services";
import { StatusBadge } from "@/components/app/primitives";
import type { Column } from "@/components/app/data-table";

export const Route = createFileRoute("/_admin/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Bashundhara R/A" },
      { name: "description", content: "Your account, role, contact details and recent activity." },
      { property: "og:title", content: "My Profile — Bashundhara R/A" },
      { property: "og:description", content: "Your account, role, contact details and recent activity." },
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
      title="My Profile"
      description="Your account, role, contact details and recent activity."
      breadcrumb={["System", "Profile"]}
      service={auditService as never}
      queryKey="profile-audit"
      columns={columns}
    />
  );
}
