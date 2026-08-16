import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { caretakerTaskService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/services/caretaker")({
  head: () => ({
    meta: [
      { title: "Caretaker Tasks — Bashundhara R/A" },
      { name: "description", content: "Operational task queue for caretakers — pickups, returns, handovers, maintenance and resident requests." },
      { property: "og:title", content: "Caretaker Tasks — Bashundhara R/A" },
      { property: "og:description", content: "Operational task queue for caretakers — pickups, returns, handovers, maintenance and resident requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Task ID", className: "tabular" },
  { key: "title", header: "Task", render: (r) => <span className="font-medium">{r.title}</span> },
  { key: "type", header: "Type", render: (r) => <StatusBadge value={String(r.type ?? "—")} /> },
  { key: "flatId", header: "Flat" },
  { key: "buildingId", header: "Building", hideOnMobile: true },
  { key: "caretakerName", header: "Caretaker", hideOnMobile: true },
  { key: "scheduledAt", header: "Scheduled", className: "tabular" },
  { key: "priority", header: "Priority", render: (r) => <StatusBadge value={String(r.priority ?? "—")} /> },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "type", label: "Task type", options: ["service_pickup", "service_return", "maintenance", "resident_request", "handover", "inspection"] }, { key: "status", label: "Status", options: ["pending", "accepted", "in_progress", "awaiting_otp", "completed", "missed"] }];

function Page() {
  return (
    <ModulePage
      title="Caretaker Tasks"
      description="Operational task queue for caretakers — pickups, returns, handovers, maintenance and resident requests."
      breadcrumb={["Services", "Caretaker"]}
      service={caretakerTaskService as never}
      queryKey="caretaker-tasks"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
