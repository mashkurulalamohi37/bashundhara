import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { serviceRequestService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/services/requests")({
  head: () => ({
    meta: [
      { title: "Service Requests — Bashundhara R/A" },
      { name: "description", content: "Resident-posted service requests with pricing model, budget range and incoming provider bids." },
      { property: "og:title", content: "Service Requests — Bashundhara R/A" },
      { property: "og:description", content: "Resident-posted service requests with pricing model, budget range and incoming provider bids." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Request ID", className: "tabular" },
  { key: "title", header: "Request", render: (r) => <span className="font-medium">{r.title}</span> },
  { key: "category", header: "Category", render: (r) => <StatusBadge value={String(r.category ?? "—")} /> },
  { key: "residentName", header: "Resident", hideOnMobile: true },
  { key: "flatId", header: "Flat" },
  { key: "preferredDate", header: "Preferred date", hideOnMobile: true },
  { key: "budgetFrom", header: "Budget from", render: (r) => <span className="tabular">{bdt(Number(r.budgetFrom ?? 0))}</span>, value: (r) => Number(r.budgetFrom ?? 0), hideOnMobile: true },
  { key: "pricingModel", header: "Pricing", render: (r) => <StatusBadge value={String(r.pricingModel ?? "—")} /> },
  { key: "bids", header: "Bids" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "pricingModel", label: "Pricing model", options: ["fixed_price", "quote_request", "competitive_bid"] }, { key: "status", label: "Status", options: ["open", "receiving_bids", "provider_selected", "converted", "cancelled", "expired"] }];

function Page() {
  return (
    <ModulePage
      title="Service Requests"
      description="Resident-posted service requests with pricing model, budget range and incoming provider bids."
      breadcrumb={["Services", "Requests"]}
      service={serviceRequestService as never}
      queryKey="service-requests"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
