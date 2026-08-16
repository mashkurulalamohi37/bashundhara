import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { purchaseRequestService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/governance/approvals")({
  head: () => ({
    meta: [
      { title: "Approvals Queue — Bashundhara R/A" },
      { name: "description", content: "Purchase requests and spending approvals routed by configurable value thresholds." },
      { property: "og:title", content: "Approvals Queue — Bashundhara R/A" },
      { property: "og:description", content: "Purchase requests and spending approvals routed by configurable value thresholds." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
  { key: "id", header: "Request", className: "tabular" },
  { key: "item", header: "Item", render: (r) => <span className="font-medium">{r.item}</span> },
  { key: "buildingId", header: "Building", hideOnMobile: true },
  { key: "estimatedCost", header: "Estimated cost", render: (r) => <span className="tabular">{bdt(Number(r.estimatedCost))}</span> },
  { key: "approvalTier", header: "Approver tier", hideOnMobile: true },
  { key: "requestedBy", header: "Requested by", hideOnMobile: true },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Approvals Queue"
      description="Purchase requests and spending approvals routed by configurable value thresholds."
      breadcrumb={["Governance", "Approvals"]}
      service={purchaseRequestService as never}
      queryKey="governance-approvals"
      columns={columns}
      filters={[{ key: "status", label: "Status", options: ["requested", "pending_approval", "approved", "ordered", "received", "invoiced", "paid", "rejected"] }]}
    />
  );
}
