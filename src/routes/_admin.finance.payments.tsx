import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { invoiceService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/finance/payments")({
  head: () => ({
    meta: [
      { title: "Payments — Bashundhara R/A" },
      { name: "description", content: "Settled and partially settled collections across bKash, Nagad, bank and cash." },
      { property: "og:title", content: "Payments — Bashundhara R/A" },
      { property: "og:description", content: "Settled and partially settled collections across bKash, Nagad, bank and cash." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Invoice", className: "tabular" },
    { key: "resident", header: "Resident", render: (r) => <span className="font-medium">{r.resident}</span> },
    { key: "block", header: "Block" },
    { key: "head", header: "Head", render: (r) => <StatusBadge value={String(r.head)} />, hideOnMobile: true },
    { key: "paid", header: "Amount paid", render: (r) => <span className="tabular">{bdt(r.paid as number)}</span>, value: (r) => r.paid as number },
    { key: "method", header: "Method", render: (r) => <StatusBadge value={String(r.method)} /> },
    { key: "paidDate", header: "Paid on", hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "method", label: "Method", options: ["bkash", "nagad", "bank", "cash", "card"] },
  { key: "status", label: "Status", options: ["paid", "partial", "due", "overdue"] },
];

function Page() {
  return (
    <ModulePage
      title="Payments"
      description="Settled and partially settled collections across bKash, Nagad, bank and cash."
      breadcrumb={["Finance", "Payments"]}
      service={invoiceService as never}
      queryKey="payments"
      columns={columns}
      filters={filters}
    />
  );
}
