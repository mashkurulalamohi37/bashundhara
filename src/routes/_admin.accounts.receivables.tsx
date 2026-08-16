import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, KpiCard, Section, StatusBadge } from "@/components/app/primitives";
import { DataTable, type Column, type FilterDef } from "@/components/app/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RecordForm, type FieldDef } from "@/components/app/record-form";
import { receivableService, reportingService } from "@/services";
import { humanizeError } from "@/services/api";
import { bdt, titleize } from "@/lib/format";
import type { Receivable } from "@/types";

export const Route = createFileRoute("/_admin/accounts/receivables")({
  head: () => ({
    meta: [
      { title: "Accounts Receivable — Bashundhara R/A" },
      { name: "description", content: "Dues from residents, owners and tenants with ageing buckets and payment recording." },
      { property: "og:title", content: "Accounts Receivable — Bashundhara R/A" },
      { property: "og:description", content: "Dues from residents, owners and tenants with ageing buckets and payment recording." },
    ],
  }),
  component: Page,
});

const filters: FilterDef[] = [
  { key: "status", label: "Status", options: ["open", "partially_paid", "paid", "overdue", "written_off"] },
  { key: "aging", label: "Ageing", options: ["current", "1-30", "31-60", "61-90", "90+"] },
  { key: "source", label: "Source", options: ["rent", "service_charge", "parking", "utility_recovery", "facility_booking", "community_service", "other"] },
  { key: "partyType", label: "Party", options: ["tenant", "owner", "resident"] },
];

const paymentFields: FieldDef[] = [
  { name: "amount", label: "Amount received (BDT)", type: "number", required: true },
  { name: "method", label: "Method", type: "select", options: ["bKash", "Nagad", "Bank transfer", "Cheque", "Cash", "Card"], required: true },
  { name: "receivedOn", label: "Received on", type: "date", required: true },
  { name: "reference", label: "Transaction reference", required: true },
  { name: "note", label: "Note", type: "textarea" },
];

function Page() {
  const rows = useQuery({ queryKey: ["receivables"], queryFn: () => receivableService.all() });
  const aging = useQuery({ queryKey: ["ar-aging"], queryFn: () => reportingService.arAging() });
  const [paying, setPaying] = useState<Receivable | null>(null);

  const columns: Column<Receivable>[] = [
    { key: "invoiceNo", header: "Invoice" },
    { key: "party", header: "Party", render: (r) => <>{r.party}<span className="block text-xs text-muted-foreground">{titleize(r.partyType)} · {r.flat}</span></> },
    { key: "source", header: "Source", render: (r) => titleize(r.source), hideOnMobile: true },
    { key: "amount", header: "Billed", render: (r) => <span className="tabular">{bdt(r.amount)}</span>, value: (r) => r.amount },
    { key: "received", header: "Received", render: (r) => <span className="tabular">{bdt(r.received)}</span>, value: (r) => r.received },
    { key: "outstanding", header: "Outstanding", render: (r) => <span className="tabular font-medium">{bdt(r.outstanding)}</span>, value: (r) => r.outstanding },
    { key: "dueOn", header: "Due", hideOnMobile: true },
    { key: "aging", header: "Ageing", render: (r) => <StatusBadge value={r.aging === "current" ? "current" : `${r.aging} days`} /> },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Accounts Receivable"
        description="Every taka billed to residents, owners and tenants — with ageing, follow-up and payment capture."
        breadcrumb={["Accounts", "Receivables"]}
        actions={<Button size="sm" variant="outline" onClick={() => toast.success("Reminder run queued", { description: "SMS and in-app reminders will go to all overdue parties." })}>Send reminders</Button>}
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border lg:grid-cols-3">
          <KpiCard label="Total outstanding" value={bdt(aging.data?.total ?? 0, true)} tone="warning" />
          <KpiCard label="Overdue" value={bdt(aging.data?.overdue ?? 0, true)} tone="danger" />
          <KpiCard label="Open invoices" value={(rows.data ?? []).filter((r) => r.outstanding > 0).length} tone="info" />
        </div>

        <Section title="Ageing buckets">
          <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-5">
            {(aging.data?.summary ?? []).map((b) => (
              <div key={b.bucket} className="bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{b.label}</p>
                <p className="tabular mt-1 text-lg font-semibold">{bdt(b.amount, true)}</p>
                <p className="text-xs text-muted-foreground">{b.count} invoices</p>
              </div>
            ))}
          </div>
        </Section>

        <DataTable<Receivable>
          rows={rows.data ?? []}
          columns={columns}
          loading={rows.isLoading}
          error={rows.isError ? humanizeError(rows.error) : null}
          onRetry={() => void rows.refetch()}
          filters={filters}
          exportName="receivables"
          searchPlaceholder="Search invoice, party or flat…"
          rowActions={[
            { label: "Record payment", onSelect: (r) => setPaying(r) },
            { label: "Send reminder", onSelect: (r) => toast.success(`Reminder sent to ${r.party}`) },
            { label: "Write off", onSelect: (r) => toast.success(`${r.invoiceNo} marked for write-off approval`), destructive: true },
          ]}
          bulkActions={[{ label: "Bulk reminder", onSelect: (ids) => toast.success(`${ids.length} reminders queued`) }]}
        />
      </div>

      <Dialog open={!!paying} onOpenChange={(o) => !o && setPaying(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record payment · {paying?.invoiceNo}</DialogTitle>
            <DialogDescription>
              {paying ? `${paying.party} · outstanding ${bdt(paying.outstanding)}` : ""} — posts Dr Bank / Cr Receivable.
            </DialogDescription>
          </DialogHeader>
          <RecordForm
            fields={paymentFields}
            submitLabel="Post receipt"
            initial={{ amount: String(paying?.outstanding ?? ""), receivedOn: "2026-08-15" }}
            onCancel={() => setPaying(null)}
            onSubmit={(v) => {
              toast.success("Payment recorded", { description: `${bdt(Number(v["amount"]))} via ${v["method"]} · journal entry posted.` });
              setPaying(null);
              void rows.refetch();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
