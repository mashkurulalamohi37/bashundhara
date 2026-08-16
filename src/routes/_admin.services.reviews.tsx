import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { serviceReviewService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/services/reviews")({
  head: () => ({
    meta: [
      { title: "Service Reviews — Bashundhara R/A" },
      { name: "description", content: "Resident ratings across quality, behaviour, timeliness, price and carefulness feeding the trust score." },
      { property: "og:title", content: "Service Reviews — Bashundhara R/A" },
      { property: "og:description", content: "Resident ratings across quality, behaviour, timeliness, price and carefulness feeding the trust score." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Review ID", className: "tabular" },
  { key: "orderId", header: "Order", className: "tabular" },
  { key: "providerName", header: "Provider", render: (r) => <span className="font-medium">{r.providerName}</span> },
  { key: "residentName", header: "Resident", hideOnMobile: true },
  { key: "quality", header: "Quality" },
  { key: "timeliness", header: "Timeliness", hideOnMobile: true },
  { key: "carefulness", header: "Care", hideOnMobile: true },
  { key: "overall", header: "Overall" },
  { key: "date", header: "Date", hideOnMobile: true },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "status", label: "Status", options: ["published", "flagged", "hidden"] }];

function Page() {
  return (
    <ModulePage
      title="Service Reviews"
      description="Resident ratings across quality, behaviour, timeliness, price and carefulness feeding the trust score."
      breadcrumb={["Services", "Reviews"]}
      service={serviceReviewService as never}
      queryKey="service-reviews"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
