import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { stockMovementService } from "@/services";
import type { Column, FilterDef } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { num, titleize } from "@/lib/format";

export const Route = createFileRoute("/_admin/inventory/movements")({
  head: () => ({
    meta: [
      { title: "Stock Movements — Bashundhara R/A" },
      { name: "description", content: "Purchases, issues, consumption, transfers and adjustments against work orders." },
      { property: "og:title", content: "Stock Movements — Bashundhara R/A" },
      { property: "og:description", content: "Purchases, issues, consumption, transfers and adjustments against work orders." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Movement" },
  { key: "date", header: "Date" },
  { key: "item", header: "Item" },
  { key: "warehouse", header: "Warehouse" },
  { key: "kind", header: "Type", render: (r) => titleize(String(r.kind)) },
  { key: "quantity", header: "Qty", render: (r) => <span className="tabular">{num(r.quantity)}</span>, value: (r) => r.quantity },
  { key: "balanceAfter", header: "Balance", render: (r) => <span className="tabular">{num(r.balanceAfter)}</span>, value: (r) => r.balanceAfter },
  { key: "reference", header: "Reference" },
  { key: "actor", header: "Recorded by" },
];

const filters: FilterDef[] = [
  { key: "kind", label: "Type", options: ["purchase", "issue", "consumption", "adjustment", "transfer"] },
];

const createFields: FieldDef[] = [
  { name: "item", label: "Item", required: true },
  { name: "kind", label: "Movement type", type: "select", options: ["purchase", "issue", "consumption", "adjustment", "transfer"], required: true },
  { name: "quantity", label: "Quantity", type: "number", required: true },
  { name: "reference", label: "Reference (WO / GRN)", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Stock Movements"
      description="Purchases, issues, consumption, transfers and adjustments against work orders."
      breadcrumb={["Inventory", "Movements"]}
      service={stockMovementService as never}
      queryKey="inv-movements"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Record movement"
    />
  );
}
