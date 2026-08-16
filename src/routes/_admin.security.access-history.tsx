import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { accessEventService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/security/access-history")({
  head: () => ({
    meta: [
      { title: "Access History — Bashundhara R/A" },
      { name: "description", content: "Full audit trail of every entry and exit — person, type, flat, purpose, gate, verification and duration." },
      { property: "og:title", content: "Access History — Bashundhara R/A" },
      { property: "og:description", content: "Full audit trail of every entry and exit — person, type, flat, purpose, gate, verification and duration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Event ID", className: "tabular" },
  { key: "date", header: "Date", className: "tabular" },
  { key: "personName", header: "Person", render: (r) => <span className="font-medium">{r.personName}</span> },
  { key: "personType", header: "Type", render: (r) => <StatusBadge value={String(r.personType ?? "—")} /> },
  { key: "flatId", header: "Flat" },
  { key: "purpose", header: "Purpose", hideOnMobile: true },
  { key: "gate", header: "Gate" },
  { key: "entryTime", header: "Entry", className: "tabular" },
  { key: "exitTime", header: "Exit", className: "tabular" },
  { key: "verification", header: "Verified via", render: (r) => <StatusBadge value={String(r.verification ?? "—")} /> },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "personType", label: "Person type", options: ["visitor", "service_provider", "domestic_worker", "delivery", "contractor", "staff"] }, { key: "status", label: "Status", options: ["inside", "completed", "denied", "overstay"] }];

function Page() {
  return (
    <ModulePage
      title="Access History"
      description="Full audit trail of every entry and exit — person, type, flat, purpose, gate, verification and duration."
      breadcrumb={["Security", "Access History"]}
      service={accessEventService as never}
      queryKey="access-events"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
