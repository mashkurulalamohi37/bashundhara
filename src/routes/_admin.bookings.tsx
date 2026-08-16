import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { bookingService } from "@/services";
import type { Column } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/bookings")({
  head: () => ({
    meta: [
      { title: "Facility Bookings — Bashundhara R/A" },
      { name: "description", content: "Booking requests, approvals and payment status for community facilities." },
      { property: "og:title", content: "Facility Bookings — Bashundhara R/A" },
      { property: "og:description", content: "Booking requests, approvals and payment status for community facilities." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Booking", className: "tabular" },
    { key: "facility", header: "Facility", render: (r) => <span className="font-medium">{r.facility}</span> },
    { key: "resident", header: "Resident" },
    { key: "date", header: "Date", className: "tabular" },
    { key: "slot", header: "Slot", hideOnMobile: true },
    { key: "guests", header: "Guests", className: "tabular", hideOnMobile: true },
    { key: "amount", header: "Amount", render: (r) => <span className="tabular">{bdt(r.amount as number)}</span>, value: (r) => r.amount as number },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "status", label: "Status", options: ["requested", "approved", "rejected", "completed", "cancelled"] },
];

const createFields: FieldDef[] = [
  { name: "facility", label: "Facility", type: "select", required: true, options: ["Community Hall", "Convention Centre", "Sports Complex", "Rooftop Garden", "Meeting Room A", "Children's Playground"] },
  { name: "resident", label: "Resident name", type: "text", required: true },
  { name: "propertyId", label: "Property ID", type: "text", required: true },
  { name: "date", label: "Booking date", type: "date", required: true },
  { name: "slot", label: "Time slot", type: "select", required: true, options: ["09:00\u201312:00", "12:00\u201315:00", "15:00\u201318:00", "18:00\u201322:00"] },
  { name: "guests", label: "Expected guests", type: "number", required: true },
  { name: "purpose", label: "Purpose", type: "textarea", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Facility Bookings"
      description="Booking requests, approvals and payment status for community facilities."
      breadcrumb={["Services", "Bookings"]}
      service={bookingService as never}
      queryKey="bookings"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="New booking"
      detailTitle={(r: any) => r.facility}
    />
  );
}
