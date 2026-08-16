import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { depreciationService } from "@/services";
import type { Column, FilterDef } from "@/components/app/data-table";

import { bdt, num, titleize } from "@/lib/format";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/accounts/depreciation")({
  head: () => ({
    meta: [
      { title: "Depreciation Schedule — Bashundhara R/A" },
      { name: "description", content: "Monthly depreciation by asset, method and posting state." },
      { property: "og:title", content: "Depreciation Schedule — Bashundhara R/A" },
      { property: "og:description", content: "Monthly depreciation by asset, method and posting state." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "asset", header: "Asset" },
  { key: "category", header: "Category" },
  { key: "cost", header: "Cost", render: (r) => <span className="tabular">{bdt(r.cost)}</span>, value: (r) => r.cost },
  { key: "usefulLifeYears", header: "Life (yrs)", render: (r) => <span className="tabular">{num(r.usefulLifeYears)}</span>, value: (r) => r.usefulLifeYears },
  { key: "method", header: "Method", render: (r) => titleize(String(r.method)) },
  { key: "monthlyDepreciation", header: "Monthly", render: (r) => <span className="tabular">{bdt(r.monthlyDepreciation)}</span>, value: (r) => r.monthlyDepreciation },
  { key: "accumulated", header: "Accumulated", render: (r) => <span className="tabular">{bdt(r.accumulated)}</span>, value: (r) => r.accumulated },
  { key: "netBookValue", header: "Net book value", render: (r) => <span className="tabular">{bdt(r.netBookValue)}</span>, value: (r) => r.netBookValue },
  { key: "lastPostedOn", header: "Last posted" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
];

const filters: FilterDef[] = [
  { key: "method", label: "Method", options: ["straight_line", "reducing_balance"] },
  { key: "status", label: "Status", options: ["scheduled", "posted"] },
];

function Page() {
  return (
    <ModulePage
      title="Depreciation Schedule"
      description="Monthly depreciation by asset, method and posting state."
      breadcrumb={["Accounts", "Depreciation"]}
      service={depreciationService as never}
      queryKey="acc-depreciation"
      columns={columns}
      filters={filters}
      
      
    />
  );
}
