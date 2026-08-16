import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { inventoryItemService } from "@/services";
import type { Column, FilterDef } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { bdt, num } from "@/lib/format";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/inventory/items")({
  head: () => ({
    meta: [
      { title: "Stock Items — Bashundhara R/A" },
      { name: "description", content: "Maintenance stores, consumables and spares with reorder thresholds and stock value." },
      { property: "og:title", content: "Stock Items — Bashundhara R/A" },
      { property: "og:description", content: "Maintenance stores, consumables and spares with reorder thresholds and stock value." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "sku", header: "SKU" },
  { key: "name", header: "Item" },
  { key: "category", header: "Category" },
  { key: "warehouse", header: "Warehouse" },
  { key: "quantity", header: "Qty", render: (r) => <span className="tabular">{num(r.quantity)}</span>, value: (r) => r.quantity },
  { key: "unit", header: "Unit" },
  { key: "minimumStock", header: "Min", render: (r) => <span className="tabular">{num(r.minimumStock)}</span>, value: (r) => r.minimumStock },
  { key: "reorderLevel", header: "Reorder", render: (r) => <span className="tabular">{num(r.reorderLevel)}</span>, value: (r) => r.reorderLevel },
  { key: "unitCost", header: "Unit cost", render: (r) => <span className="tabular">{bdt(r.unitCost)}</span>, value: (r) => r.unitCost },
  { key: "stockValue", header: "Stock value", render: (r) => <span className="tabular">{bdt(r.stockValue)}</span>, value: (r) => r.stockValue },
  { key: "stockStatus", header: "Stock", render: (r) => <StatusBadge value={r.stockStatus} /> },
];

const filters: FilterDef[] = [
  { key: "stockStatus", label: "Stock", options: ["in_stock", "low", "reorder", "out_of_stock"] },
  { key: "category", label: "Category", options: ["Electrical", "Plumbing", "Cleaning", "Safety", "Security", "Mechanical", "Civil", "Administration"] },
];

const createFields: FieldDef[] = [
  { name: "name", label: "Item name", required: true },
  { name: "category", label: "Category", type: "select", options: ["Electrical", "Plumbing", "Cleaning", "Safety", "Security", "Mechanical", "Civil", "Administration"], required: true },
  { name: "unit", label: "Unit", type: "select", options: ["pcs", "meter", "roll", "can", "bottle", "bag", "unit", "cft", "bucket"], required: true },
  { name: "warehouse", label: "Warehouse", required: true },
  { name: "quantity", label: "Opening quantity", type: "number", required: true },
  { name: "minimumStock", label: "Minimum stock", type: "number", required: true },
  { name: "unitCost", label: "Unit cost (BDT)", type: "number", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Stock Items"
      description="Maintenance stores, consumables and spares with reorder thresholds and stock value."
      breadcrumb={["Inventory", "Items"]}
      service={inventoryItemService as never}
      queryKey="inv-items"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Add item"
    />
  );
}
