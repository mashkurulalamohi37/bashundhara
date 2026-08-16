import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { notificationRuleService } from "@/services";
import type { Column, FilterDef } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/control/notifications")({
  head: () => ({
    meta: [
      { title: "Notification Rules — Bashundhara R/A" },
      { name: "description", content: "Event-driven notification templates, audiences, channels and throttles." },
      { property: "og:title", content: "Notification Rules — Bashundhara R/A" },
      { property: "og:description", content: "Event-driven notification templates, audiences, channels and throttles." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Rule" },
  { key: "event", header: "Event" },
  { key: "audience", header: "Audience" },
  { key: "channels", header: "Channels" },
  { key: "template", header: "Template" },
  { key: "throttle", header: "Throttle" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
];

const filters: FilterDef[] = [
  { key: "status", label: "Status", options: ["active", "inactive"] },
];

const createFields: FieldDef[] = [
  { name: "event", label: "Event key", required: true },
  { name: "template", label: "Template", type: "select", options: ["Standard", "Urgent", "Digest", "Reminder"], required: true },
  { name: "throttle", label: "Throttle", type: "select", options: ["Immediate", "Max 1/hour", "Daily digest", "Max 3/day"], required: true },
];

function Page() {
  return (
    <ModulePage
      title="Notification Rules"
      description="Event-driven notification templates, audiences, channels and throttles."
      breadcrumb={["Control", "Notifications"]}
      service={notificationRuleService as never}
      queryKey="ctl-notification-rules"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Add rule"
    />
  );
}
