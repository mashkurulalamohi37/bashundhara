import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { domesticWorkerService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/security/domestic-access")({
  head: () => ({
    meta: [
      { title: "Domestic Worker Access — Bashundhara R/A" },
      { name: "description", content: "Gate-side view of household worker passes — who they work for, which flat and the valid access window." },
      { property: "og:title", content: "Domestic Worker Access — Bashundhara R/A" },
      { property: "og:description", content: "Gate-side view of household worker passes — who they work for, which flat and the valid access window." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "passCode", header: "Pass", className: "tabular" },
  { key: "name", header: "Worker", render: (r) => <span className="font-medium">{r.name}</span> },
  { key: "workerType", header: "Type", render: (r) => <StatusBadge value={String(r.workerType ?? "—")} /> },
  { key: "employerName", header: "Employer", hideOnMobile: true },
  { key: "flatId", header: "Flat" },
  { key: "block", header: "Block" },
  { key: "accessWindow", header: "Access window" },
  { key: "policeVerified", header: "Police check", render: (r) => <StatusBadge value={String(r.policeVerified ?? "—")} />, hideOnMobile: true },
  { key: "verification", header: "Verification", render: (r) => <StatusBadge value={String(r.verification ?? "—")} /> },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "verification", label: "Verification", options: ["pending", "verified", "expired"] }, { key: "status", label: "Status", options: ["pending_verification", "verified", "active", "suspended", "expired", "removed"] }];

function Page() {
  return (
    <ModulePage
      title="Domestic Worker Access"
      description="Gate-side view of household worker passes — who they work for, which flat and the valid access window."
      breadcrumb={["Security", "Domestic Worker Access"]}
      service={domesticWorkerService as never}
      queryKey="domestic-workers-access"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
