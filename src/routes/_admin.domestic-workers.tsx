import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { domesticWorkerService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/domestic-workers")({
  head: () => ({
    meta: [
      { title: "Domestic Workers — Bashundhara R/A" },
      { name: "description", content: "Maids, cooks, drivers and caregivers employed by households — verified, pass-controlled and never deleted from history." },
      { property: "og:title", content: "Domestic Workers — Bashundhara R/A" },
      { property: "og:description", content: "Maids, cooks, drivers and caregivers employed by households — verified, pass-controlled and never deleted from history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Worker ID", className: "tabular" },
  { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
  { key: "workerType", header: "Type", render: (r) => <StatusBadge value={String(r.workerType ?? "—")} /> },
  { key: "employerName", header: "Employer", hideOnMobile: true },
  { key: "flatId", header: "Flat" },
  { key: "block", header: "Block", hideOnMobile: true },
  { key: "passCode", header: "Pass", className: "tabular" },
  { key: "accessWindow", header: "Access window", hideOnMobile: true },
  { key: "verification", header: "Verification", render: (r) => <StatusBadge value={String(r.verification ?? "—")} /> },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "workerType", label: "Worker type", options: ["maid", "cook", "driver", "babysitter", "caregiver", "gardener", "cleaner", "personal_assistant"] }, { key: "status", label: "Status", options: ["pending_verification", "verified", "active", "suspended", "expired", "removed"] }];

function Page() {
  return (
    <ModulePage
      title="Domestic Workers"
      description="Maids, cooks, drivers and caregivers employed by households — verified, pass-controlled and never deleted from history."
      breadcrumb={["People", "Domestic Workers"]}
      service={domesticWorkerService as never}
      queryKey="domestic-workers"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
