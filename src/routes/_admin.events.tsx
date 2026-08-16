import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { eventService } from "@/services";
import type { Column } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/events")({
  head: () => ({
    meta: [
      { title: "Community Events — Bashundhara R/A" },
      { name: "description", content: "Cultural, religious and sporting events with registration counts." },
      { property: "og:title", content: "Community Events — Bashundhara R/A" },
      { property: "og:description", content: "Cultural, religious and sporting events with registration counts." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Event ID", className: "tabular" },
    { key: "title", header: "Event", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "venue", header: "Venue" },
    { key: "date", header: "Date", className: "tabular" },
    { key: "time", header: "Time", hideOnMobile: true },
    { key: "organizer", header: "Organizer", hideOnMobile: true },
    { key: "registered", header: "Registered", className: "tabular" },
    { key: "capacity", header: "Capacity", className: "tabular", hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "status", label: "Status", options: ["upcoming", "open", "closed", "completed"] },
];

const createFields: FieldDef[] = [
  { name: "title", label: "Event title", type: "text", required: true },
  { name: "venue", label: "Venue", type: "text", required: true },
  { name: "date", label: "Event date", type: "date", required: true },
  { name: "time", label: "Start time", type: "text" },
  { name: "organizer", label: "Organizer", type: "text", required: true },
  { name: "capacity", label: "Capacity", type: "number", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Community Events"
      description="Cultural, religious and sporting events with registration counts."
      breadcrumb={["Services", "Events"]}
      service={eventService as never}
      queryKey="events"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Create event"
      detailTitle={(r: any) => r.title}
    />
  );
}
