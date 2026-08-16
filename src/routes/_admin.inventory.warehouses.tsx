import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { warehouseService } from "@/services";
import type { Column } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { bdt, num } from "@/lib/format";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/inventory/warehouses")({
  head: () => ({
    meta: [
      { title: "Warehouses & Stores — Bashundhara R/A" },
      { name: "description", content: "Physical stores, their keepers and current stock valuation." },
      { property: "og:title", content: "Warehouses & Stores — Bashundhara R/A" },
      { property: "og:description", content: "Physical stores, their keepers and current stock valuation." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Code" },
  { key: "name", header: "Warehouse" },
  { key: "location", header: "Location" },
  { key: "keeper", header: "Store keeper" },
  { key: "itemCount", header: "Items", render: (r) => <span className="tabular">{num(r.itemCount)}</span>, value: (r) => r.itemCount },
  { key: "stockValue", header: "Stock value", render: (r) => <span className="tabular">{bdt(r.stockValue)}</span>, value: (r) => r.stockValue },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
];

const createFields: FieldDef[] = [
  { name: "name", label: "Warehouse name", required: true },
  { name: "location", label: "Location", required: true },
  { name: "keeper", label: "Store keeper", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Warehouses & Stores"
      description="Physical stores, their keepers and current stock valuation."
      breadcrumb={["Inventory", "Warehouses"]}
      service={warehouseService as never}
      queryKey="inv-warehouses"
      columns={columns}
      
      createFields={createFields}
      createLabel="Add warehouse"
    />
  );
}
