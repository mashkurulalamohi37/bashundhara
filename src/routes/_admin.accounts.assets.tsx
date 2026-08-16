import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { fixedAssetService } from "@/services";
import type { Column, FilterDef } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { bdt, num } from "@/lib/format";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/accounts/assets")({
  head: () => ({
    meta: [
      { title: "Fixed Asset Register — Bashundhara R/A" },
      { name: "description", content: "Capitalised assets with cost, book value, warranty and lifecycle state." },
      { property: "og:title", content: "Fixed Asset Register — Bashundhara R/A" },
      { property: "og:description", content: "Capitalised assets with cost, book value, warranty and lifecycle state." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Asset ID" },
  { key: "name", header: "Asset" },
  { key: "category", header: "Category" },
  { key: "purchaseDate", header: "Purchased" },
  { key: "purchaseCost", header: "Cost", render: (r) => <span className="tabular">{bdt(r.purchaseCost)}</span>, value: (r) => r.purchaseCost },
  { key: "usefulLifeYears", header: "Life (yrs)", render: (r) => <span className="tabular">{num(r.usefulLifeYears)}</span>, value: (r) => r.usefulLifeYears },
  { key: "accumulatedDepreciation", header: "Accum. dep.", render: (r) => <span className="tabular">{bdt(r.accumulatedDepreciation)}</span>, value: (r) => r.accumulatedDepreciation },
  { key: "bookValue", header: "Book value", render: (r) => <span className="tabular">{bdt(r.bookValue)}</span>, value: (r) => r.bookValue },
  { key: "condition", header: "Condition", render: (r) => <StatusBadge value={r.condition} /> },
  { key: "lifecycle", header: "Lifecycle", render: (r) => <StatusBadge value={r.lifecycle} /> },
];

const filters: FilterDef[] = [
  { key: "category", label: "Category", options: ["Lift", "Generator", "Electrical", "Pump", "Water", "Security", "Fire Safety", "Environment", "HVAC"] },
  { key: "condition", label: "Condition", options: ["excellent", "good", "fair", "poor"] },
  { key: "lifecycle", label: "Lifecycle", options: ["requested", "purchased", "received", "capitalized", "assigned", "in_maintenance", "disposed"] },
];

const createFields: FieldDef[] = [
  { name: "name", label: "Asset name", required: true },
  { name: "category", label: "Category", type: "select", options: ["Lift", "Generator", "Electrical", "Pump", "Water", "Security", "Fire Safety", "Environment", "HVAC"], required: true },
  { name: "vendor", label: "Vendor" },
  { name: "purchaseCost", label: "Purchase cost (BDT)", type: "number", required: true },
  { name: "purchaseDate", label: "Purchase date", type: "date", required: true },
  { name: "usefulLifeYears", label: "Useful life (years)", type: "number", required: true },
  { name: "method", label: "Depreciation method", type: "select", options: ["straight_line", "reducing_balance"], required: true },
];

function Page() {
  return (
    <ModulePage
      title="Fixed Asset Register"
      description="Capitalised assets with cost, book value, warranty and lifecycle state."
      breadcrumb={["Accounts", "Fixed Assets"]}
      service={fixedAssetService as never}
      queryKey="acc-fixed-assets"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Capitalize asset"
    />
  );
}
