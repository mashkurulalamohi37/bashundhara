import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { serviceProviderService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/services/providers/")({
  head: () => ({
    meta: [
      { title: "Service Providers — Bashundhara R/A" },
      { name: "description", content: "Verified marketplace providers with trust score, response time, complaint rate and verification stage." },
      { property: "og:title", content: "Service Providers — Bashundhara R/A" },
      { property: "og:description", content: "Verified marketplace providers with trust score, response time, complaint rate and verification stage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Provider ID", className: "tabular" },
  { key: "business", header: "Business", render: (r) => <span className="font-medium">{r.business}</span> },
  { key: "category", header: "Category", render: (r) => <StatusBadge value={String(r.category ?? "—")} /> },
  { key: "contactName", header: "Contact", hideOnMobile: true },
  { key: "rating", header: "Rating" },
  { key: "completedJobs", header: "Jobs" },
  { key: "responseMins", header: "Response (min)", hideOnMobile: true },
  { key: "trustScore", header: "Trust score" },
  { key: "verification", header: "Verification", render: (r) => <StatusBadge value={String(r.verification ?? "—")} /> },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "verification", label: "Verification", options: ["pending", "under_review", "verified", "suspended", "blacklisted"] }, { key: "status", label: "Status", options: ["active", "paused", "suspended"] }];

function Page() {
  return (
    <ModulePage
      title="Service Providers"
      description="Verified marketplace providers with trust score, response time, complaint rate and verification stage."
      breadcrumb={["Services", "Providers"]}
      service={serviceProviderService as never}
      queryKey="service-providers"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
