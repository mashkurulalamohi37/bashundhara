import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { serviceHandoverService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/services/handovers")({
  head: () => ({
    meta: [
      { title: "Handover Tracking — Bashundhara R/A" },
      { name: "description", content: "Chain-of-custody log for every physical handover between resident, caretaker, security and provider." },
      { property: "og:title", content: "Handover Tracking — Bashundhara R/A" },
      { property: "og:description", content: "Chain-of-custody log for every physical handover between resident, caretaker, security and provider." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Event ID", className: "tabular" },
  { key: "orderId", header: "Order", className: "tabular" },
  { key: "sequence", header: "Step" },
  { key: "timestamp", header: "Timestamp", className: "tabular" },
  { key: "type", header: "Handover type", render: (r) => <StatusBadge value={String(r.type ?? "—")} /> },
  { key: "personName", header: "Person", render: (r) => <span className="font-medium">{r.personName}</span> },
  { key: "personRole", header: "Role", render: (r) => <StatusBadge value={String(r.personRole ?? "—")} /> },
  { key: "location", header: "Location", hideOnMobile: true },
  { key: "confirmation", header: "Confirmed by", render: (r) => <StatusBadge value={String(r.confirmation ?? "—")} /> },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "type", label: "Handover type", options: ["gate_verification", "resident_to_caretaker", "caretaker_to_provider", "gate_exit", "provider_to_caretaker", "caretaker_to_resident"] }, { key: "personRole", label: "Role", options: ["resident", "caretaker", "service_provider", "security_officer"] }];

function Page() {
  return (
    <ModulePage
      title="Handover Tracking"
      description="Chain-of-custody log for every physical handover between resident, caretaker, security and provider."
      breadcrumb={["Services", "Handovers"]}
      service={serviceHandoverService as never}
      queryKey="service-handovers"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
