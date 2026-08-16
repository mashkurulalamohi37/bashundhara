import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { serviceDisputeService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/services/disputes")({
  head: () => ({
    meta: [
      { title: "Service Disputes — Bashundhara R/A" },
      { name: "description", content: "Missing, damaged or late items escalated through evidence, provider response and community review." },
      { property: "og:title", content: "Service Disputes — Bashundhara R/A" },
      { property: "og:description", content: "Missing, damaged or late items escalated through evidence, provider response and community review." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Dispute ID", className: "tabular" },
  { key: "orderId", header: "Order", className: "tabular" },
  { key: "residentName", header: "Resident", render: (r) => <span className="font-medium">{r.residentName}</span> },
  { key: "providerName", header: "Provider", hideOnMobile: true },
  { key: "reason", header: "Reason", render: (r) => <StatusBadge value={String(r.reason ?? "—")} /> },
  { key: "claimAmount", header: "Claim", render: (r) => <span className="tabular">{bdt(Number(r.claimAmount ?? 0))}</span>, value: (r) => Number(r.claimAmount ?? 0) },
  { key: "evidence", header: "Evidence" },
  { key: "reviewer", header: "Reviewer", hideOnMobile: true },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "reason", label: "Reason", options: ["missing_item", "damaged_item", "wrong_item", "late_return", "poor_service", "incorrect_price", "no_show"] }, { key: "status", label: "Status", options: ["open", "provider_responding", "community_review", "resolved", "rejected", "escalated"] }];

function Page() {
  return (
    <ModulePage
      title="Service Disputes"
      description="Missing, damaged or late items escalated through evidence, provider response and community review."
      breadcrumb={["Services", "Disputes"]}
      service={serviceDisputeService as never}
      queryKey="service-disputes"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
