import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { bookingService } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/resident/bookings")({
  head: () => ({
    meta: [
      { title: "Facility Bookings — Bashundhara R/A" },
      { name: "description", content: "Book the community hall, sports facilities and meeting rooms." },
      { property: "og:title", content: "Facility Bookings — Bashundhara R/A" },
      { property: "og:description", content: "Book the community hall, sports facilities and meeting rooms." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
  { key: "id", header: "Booking", className: "tabular" },
  { key: "facility", header: "Facility", render: (r) => <span className="font-medium">{String(r.facility)}</span> },
  { key: "resident", header: "Booked by", hideOnMobile: true },
  { key: "date", header: "Date" },
  { key: "slot", header: "Slot", hideOnMobile: true },
  { key: "amount", header: "Fee", render: (r) => <span className="tabular">{bdt(Number(r.amount))}</span> },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

function Page() {
  const { user } = useAuth();
  const propertyId = user?.propertyId ?? "PRP-0007";
  const service = useMemo(() => {
    const base = bookingService as any;
    return {
      ...base,
      all: async () => (await base.all()),
      create: (payload: any) => base.create({ ...payload }),
    };
  }, [propertyId, user?.block]);

  return (
    <ModulePage
      title="Facility Bookings"
      description="Book the community hall, sports facilities and meeting rooms."
      breadcrumb={["Resident", "Facility Bookings"]}
      service={service as never}
      queryKey="resident-bookings"
      columns={columns}
      createFields={[
  { name: "facility", label: "Facility", required: true },
  { name: "date", label: "Date", type: "date", required: true },
  { name: "slot", label: "Time slot", required: true },
  { name: "guests", label: "Guests", type: "number" },
]}
      createLabel="New booking"
      emptyTitle="Nothing here yet"
      emptyDescription="Use the button above to add your first record."
    />
  );
}
