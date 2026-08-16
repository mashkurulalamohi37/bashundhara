import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, KpiCard, Section, StatusBadge } from "@/components/app/primitives";
import { DataTable, type Column, type FilterDef } from "@/components/app/data-table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RecordForm, type FieldDef } from "@/components/app/record-form";
import { payableService, reportingService } from "@/services";
import { humanizeError } from "@/services/api";
import { bdt, titleize } from "@/lib/format";
import type { Payable } from "@/types";

export const Route = createFileRoute("/_admin/accounts/payables")({
  head: () => ({
    meta: [
      { title: "Accounts Payable — Bashundhara R/A" },
      { name: "description", content: "Vendor, contractor and utility liabilities with ageing and payment release." },
      { property: "og:title", content: "Accounts Payable — Bashundhara R/A" },
      { property: "og:description", content: "Vendor, contractor and utility liabilities with ageing and payment release." },
    ],
  }),
  component: Page,
});

const filters: FilterDef[] = [
  { key: "status", label: "Status", options: ["open", "partially_paid", "paid", "overdue", "on_hold"] },
  { key: "aging", label: "Ageing", options: ["current", "1-30", "31-60", "61-90", "90+"] },
  { key: "vendorType", label: "Vendor type", options: ["vendor", "contractor", "utility", "supplier", "service_provider"] },
];

const payFields: FieldDef[] = [
  { name: "amount", label: "Payment amount (BDT)", type: "number", required: true },
  { name: "method", label: "Payment method", type: "select", options: ["Bank transfer", "Cheque", "Cash", "Mobile wallet"], required: true },
  { name: "paidOn", label: "Payment date", type: "date", required: true },
  { name: "reference", label: "Cheque / transaction ref", required: true },
  { name: "note", label: "Note", type: "textarea" },
];

function Page() {
  const rows = useQuery({ queryKey: ["payables"], queryFn: () => payableService.all() });
  const aging = useQuery({ queryKey: ["ap-aging"], queryFn: () => reportingService.apAging() });
  const [paying, setPaying] = useState<Payable | null>(null);

  const columns: Column<Payable>[] = [
    { key: "billNo", header: "Bill" },
    { key: "vendor", header: "Vendor", render: (r) => <>{r.vendor}<span className="block text-xs text-muted-foreground">{titleize(r.vendorType)} · {r.category}</span></> },
    { key: "amount", header: "Billed", render: (r) => <span className="tabular">{bdt(r.amount)}</span>, value: (r) => r.amount },
    { key: "paid", header: "Paid", render: (r) => <span className="tabular">{bdt(r.paid)}</span>, value: (r) => r.paid },
    { key: "outstanding", header: "Outstanding", render: (r) => <span className="tabular font-medium">{bdt(r.outstanding)}</span>, value: (r) => r.outstanding },
    { key: "dueOn", header: "Due", hideOnMobile: true },
    { key: "poRef", header: "PO", hideOnMobile: true },
    { key: "aging", header: "Ageing", render: (r) => <StatusBadge value={r.aging === "current" ? "current" : `${r.aging} days`} /> },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Accounts Payable"
        description="Approved vendor bills, utility liabilities and contractor dues awaiting release."
        breadcrumb={["Accounts", "Payables"]}
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border lg:grid-cols-3">
          <KpiCard label="Total payable" value={bdt(aging.data?.total ?? 0, true)} tone="danger" />
          <KpiCard label="Overdue to vendors" value={bdt(aging.data?.overdue ?? 0, true)} tone="warning" />
          <KpiCard label="Open bills" value={(rows.data ?? []).filter((r) => r.outstanding > 0).length} tone="info" />
        </div>

        <Section title="Ageing buckets">
          <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-5">
            {(aging.data?.summary ?? []).map((b) => (
              <div key={b.bucket} className="bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{b.label}</p>
                <p className="tabular mt-1 text-lg font-semibold">{bdt(b.amount, true)}</p>
                <p className="text-xs text-muted-foreground">{b.count} bills</p>
              </div>
            ))}
          </div>
        </Section>

        <DataTable<Payable>
          rows={rows.data ?? []}
          columns={columns}
          loading={rows.isLoading}
          error={rows.isError ? humanizeError(rows.error) : null}
          onRetry={() => void rows.refetch()}
          filters={filters}
          exportName="payables"
          searchPlaceholder="Search bill, vendor or PO…"
          rowActions={[
            { label: "Release payment", onSelect: (r) => setPaying(r) },
            { label: "Put on hold", onSelect: (r) => toast.success(`${r.billNo} placed on hold`) },
            { label: "Dispute bill", onSelect: (r) => toast.success(`Dispute raised against ${r.vendor}`), destructive: true },
          ]}
          bulkActions={[{ label: "Batch payment run", onSelect: (ids) => toast.success(`Payment run created for ${ids.length} bills`) }]}
        />
      </div>

      <Dialog open={!!paying} onOpenChange={(o) => !o && setPaying(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Release payment · {paying?.billNo}</DialogTitle>
            <DialogDescription>
              {paying ? `${paying.vendor} · outstanding ${bdt(paying.outstanding)}` : ""} — posts Dr Payable / Cr Bank.
            </DialogDescription>
          </DialogHeader>
          <RecordForm
            fields={payFields}
            submitLabel="Post payment"
            initial={{ amount: String(paying?.outstanding ?? ""), paidOn: "2026-08-15" }}
            onCancel={() => setPaying(null)}
            onSubmit={(v) => {
              toast.success("Payment released", { description: `${bdt(Number(v["amount"]))} via ${v["method"]} · journal entry posted.` });
              setPaying(null);
              void rows.refetch();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
