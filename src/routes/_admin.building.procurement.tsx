import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { purchaseRequestService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/building/procurement")({
  head: () => ({
    meta: [
      { title: "Procurement — Bashundhara R/A" },
      { name: "description", content: "Purchase requests routed through configurable approval thresholds to vendor, delivery and payment." },
      { property: "og:title", content: "Procurement — Bashundhara R/A" },
      { property: "og:description", content: "Purchase requests routed through configurable approval thresholds to vendor, delivery and payment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Request ID", className: "tabular" },
  { key: "buildingId", header: "Building" },
  { key: "item", header: "Item", render: (r) => <span className="font-medium">{r.item}</span> },
  { key: "category", header: "Category", hideOnMobile: true },
  { key: "quantity", header: "Qty" },
  { key: "estimatedCost", header: "Estimated", render: (r) => <span className="tabular">{bdt(Number(r.estimatedCost ?? 0))}</span>, value: (r) => Number(r.estimatedCost ?? 0) },
  { key: "approvalTier", header: "Approval tier", render: (r) => <StatusBadge value={String(r.approvalTier ?? "—")} /> },
  { key: "vendor", header: "Vendor", hideOnMobile: true },
  { key: "requestedBy", header: "Requested by", hideOnMobile: true },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "approvalTier", label: "Approval tier", options: ["caretaker", "building_manager", "building_owner"] }, { key: "status", label: "Status", options: ["requested", "pending_approval", "approved", "ordered", "received", "invoiced", "paid", "rejected"] }];

function Page() {
  return (
    <ModulePage
      title="Procurement"
      description="Purchase requests routed through configurable approval thresholds to vendor, delivery and payment."
      breadcrumb={["Building", "Procurement"]}
      service={purchaseRequestService as never}
      queryKey="purchase-requests"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
