import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { serviceBidService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/services/bids")({
  head: () => ({
    meta: [
      { title: "Bids & Quotes — Bashundhara R/A" },
      { name: "description", content: "Competing provider quotes with price, availability and estimated completion for each open request." },
      { property: "og:title", content: "Bids & Quotes — Bashundhara R/A" },
      { property: "og:description", content: "Competing provider quotes with price, availability and estimated completion for each open request." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Bid ID", className: "tabular" },
  { key: "requestId", header: "Request", className: "tabular" },
  { key: "providerName", header: "Provider", render: (r) => <span className="font-medium">{r.providerName}</span> },
  { key: "price", header: "Quote", render: (r) => <span className="tabular">{bdt(Number(r.price ?? 0))}</span>, value: (r) => Number(r.price ?? 0) },
  { key: "availability", header: "Availability", hideOnMobile: true },
  { key: "estimatedCompletion", header: "Completion", hideOnMobile: true },
  { key: "rating", header: "Rating" },
  { key: "submittedOn", header: "Submitted", hideOnMobile: true },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "status", label: "Status", options: ["submitted", "shortlisted", "selected", "rejected", "withdrawn"] }];

function Page() {
  return (
    <ModulePage
      title="Bids & Quotes"
      description="Competing provider quotes with price, availability and estimated completion for each open request."
      breadcrumb={["Services", "Bids"]}
      service={serviceBidService as never}
      queryKey="service-bids"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
