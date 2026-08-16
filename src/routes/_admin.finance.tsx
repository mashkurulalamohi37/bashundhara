import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { invoiceService } from "@/services";
import { StatusBadge } from "@/components/app/primitives";
import type { Column } from "@/components/app/data-table";

export const Route = createFileRoute("/_admin/finance")({
  head: () => ({
    meta: [
      { title: "Finance Overview — Bashundhara R/A" },
      { name: "description", content: "Service charge collection, dues ageing and expenditure position." },
      { property: "og:title", content: "Finance Overview — Bashundhara R/A" },
      { property: "og:description", content: "Service charge collection, dues ageing and expenditure position." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
  { key: "id", header: "Invoice" },
  { key: "resident", header: "Resident" },
  { key: "block", header: "Block" },
  { key: "amount", header: "Amount" },
  { key: "dueDate", header: "Due" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Finance Overview"
      description="Service charge collection, dues ageing and expenditure position."
      breadcrumb={["Finance", "Overview"]}
      service={invoiceService as never}
      queryKey="finance-overview"
      columns={columns}
    />
  );
}
