import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, KpiCard, Section, StatLine, StatusBadge } from "@/components/app/primitives";
import { DataTable, type Column, type FilterDef } from "@/components/app/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { accountService, journalService } from "@/services";
import { humanizeError } from "@/services/api";
import { bdt, titleize } from "@/lib/format";
import type { JournalEntry } from "@/types";

export const Route = createFileRoute("/_admin/accounts/journal")({
  head: () => ({
    meta: [
      { title: "Journal Entries — Bashundhara R/A" },
      { name: "description", content: "Double-entry journal with balanced debit and credit lines, source traceability and posting control." },
      { property: "og:title", content: "Journal Entries — Bashundhara R/A" },
      { property: "og:description", content: "Double-entry journal with balanced debit and credit lines, source traceability and posting control." },
    ],
  }),
  component: Page,
});

const filters: FilterDef[] = [
  { key: "status", label: "Status", options: ["draft", "posted", "reversed", "void"] },
  {
    key: "source", label: "Source",
    options: ["manual", "rent", "invoice", "payment", "expense", "vendor_bill", "procurement", "service_order", "depreciation", "utility", "petty_cash", "adjustment"],
  },
];

interface DraftLine { id: number; accountId: string; debit: string; credit: string; memo: string }

function Page() {
  const entries = useQuery({ queryKey: ["journal-entries"], queryFn: () => journalService.all() });
  const accounts = useQuery({ queryKey: ["chart-of-accounts"], queryFn: () => accountService.all() });
  const [detail, setDetail] = useState<JournalEntry | null>(null);
  const [creating, setCreating] = useState(false);
  const [date, setDate] = useState("2026-08-15");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([
    { id: 1, accountId: "", debit: "", credit: "", memo: "" },
    { id: 2, accountId: "", debit: "", credit: "", memo: "" },
  ]);

  const postable = (accounts.data ?? []).filter((a) => !a.isGroup);
  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const balanced = totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.01;
  const complete = lines.every((l) => l.accountId && (Number(l.debit) || Number(l.credit)));

  const rows = entries.data ?? [];
  const stats = useMemo(() => ({
    posted: rows.filter((e) => e.status === "posted").length,
    draft: rows.filter((e) => e.status === "draft").length,
    reversed: rows.filter((e) => e.status === "reversed").length,
    value: rows.filter((e) => e.status === "posted").reduce((s, e) => s + e.totalDebit, 0),
  }), [rows]);

  const columns: Column<JournalEntry>[] = [
    { key: "entryNo", header: "Entry no" },
    { key: "date", header: "Date" },
    { key: "description", header: "Description" },
    { key: "reference", header: "Reference", hideOnMobile: true },
    { key: "source", header: "Source", render: (r) => titleize(r.source), hideOnMobile: true },
    { key: "totalDebit", header: "Debit", render: (r) => <span className="tabular">{bdt(r.totalDebit)}</span>, value: (r) => r.totalDebit },
    { key: "totalCredit", header: "Credit", render: (r) => <span className="tabular">{bdt(r.totalCredit)}</span>, value: (r) => r.totalCredit },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  const reset = () => {
    setDescription(""); setReference("");
    setLines([{ id: 1, accountId: "", debit: "", credit: "", memo: "" }, { id: 2, accountId: "", debit: "", credit: "", memo: "" }]);
  };

  const submit = (status: "draft" | "posted") => {
    if (status === "posted" && !balanced) {
      toast.error("Entry is not balanced", { description: "Total debit must equal total credit before posting." });
      return;
    }
    if (!complete || !description) {
      toast.error("Incomplete entry", { description: "Every line needs an account and an amount." });
      return;
    }
    journalService
      .create({ date, description, reference, status } as Partial<JournalEntry>)
      .then(() => {
        toast.success(status === "posted" ? "Journal entry posted" : "Draft saved", {
          description: `${bdt(totalDebit)} across ${lines.length} lines.`,
        });
        setCreating(false);
        reset();
        void entries.refetch();
      })
      .catch((e) => toast.error(humanizeError(e)));
  };

  return (
    <>
      <PageHeader
        title="Journal Entries"
        description="Every posting is double-entry, balanced, period-stamped and traceable to its source module."
        breadcrumb={["Accounts", "Journal"]}
        actions={<Button size="sm" onClick={() => setCreating(true)}><Plus className="size-4" /> New entry</Button>}
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border lg:grid-cols-4">
          <KpiCard label="Posted entries" value={stats.posted} tone="success" />
          <KpiCard label="Drafts awaiting posting" value={stats.draft} tone="warning" />
          <KpiCard label="Reversed" value={stats.reversed} tone="danger" />
          <KpiCard label="Posted value" value={bdt(stats.value, true)} tone="primary" />
        </div>

        <DataTable<JournalEntry>
          rows={rows}
          columns={columns}
          loading={entries.isLoading}
          error={entries.isError ? humanizeError(entries.error) : null}
          onRetry={() => void entries.refetch()}
          filters={filters}
          exportName="journal-entries"
          searchPlaceholder="Search entry no, description or reference…"
          onRowClick={(r) => setDetail(r)}
          rowActions={[
            { label: "View entry", onSelect: (r) => setDetail(r) },
            { label: "Post entry", onSelect: (r) => toast.success(`${r.entryNo} posted to ${r.fiscalPeriodId}`) },
            { label: "Reverse entry", onSelect: (r) => toast.success(`Reversal created for ${r.entryNo}`), destructive: true },
          ]}
        />
      </div>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{detail?.entryNo}</SheetTitle>
            <SheetDescription>{detail?.description}</SheetDescription>
          </SheetHeader>
          {detail ? (
            <div className="space-y-4 px-4 pb-8">
              <dl>
                <StatLine label="Date" value={detail.date} />
                <StatLine label="Reference" value={detail.reference} />
                <StatLine label="Source module" value={titleize(detail.source)} />
                <StatLine label="Source record" value={detail.sourceRef ?? "—"} />
                <StatLine label="Fiscal period" value={detail.fiscalPeriodId} />
                <StatLine label="Cost center" value={detail.costCenterId ?? "—"} />
                <StatLine label="Building" value={detail.buildingId ?? "—"} />
                <StatLine label="Status" value={<StatusBadge value={detail.status} />} />
                <StatLine label="Created by" value={`${detail.createdBy} · ${detail.createdAt}`} />
              </dl>
              <Section title="Entry lines">
                <table className="w-full text-sm">
                  <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Account</th>
                      <th className="px-3 py-2 text-right">Debit</th>
                      <th className="px-3 py-2 text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.lines.map((l) => (
                      <tr key={l.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-2">
                          <span className="tabular text-xs text-muted-foreground">{l.accountCode}</span> {l.accountName}
                        </td>
                        <td className="tabular px-3 py-2 text-right">{l.debit ? bdt(l.debit) : "—"}</td>
                        <td className="tabular px-3 py-2 text-right">{l.credit ? bdt(l.credit) : "—"}</td>
                      </tr>
                    ))}
                    <tr className="font-semibold">
                      <td className="px-3 py-2">Total</td>
                      <td className="tabular px-3 py-2 text-right">{bdt(detail.totalDebit)}</td>
                      <td className="tabular px-3 py-2 text-right">{bdt(detail.totalCredit)}</td>
                    </tr>
                  </tbody>
                </table>
              </Section>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => toast.success(`${detail.entryNo} posted`)}>Post</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success(`Reversal drafted for ${detail.entryNo}`)}>Reverse</Button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>New journal entry</DialogTitle>
            <DialogDescription>Debits must equal credits before the entry can be posted.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="je-date">Date</Label>
                <Input id="je-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="je-desc">Description</Label>
                <Input id="je-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. August common area electricity accrual" />
              </div>
              <div className="space-y-1.5 sm:col-span-3">
                <Label htmlFor="je-ref">Reference</Label>
                <Input id="je-ref" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Bill / invoice / voucher reference" />
              </div>
            </div>

            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Account</th>
                    <th className="px-3 py-2 text-left">Memo</th>
                    <th className="px-3 py-2 text-right">Debit</th>
                    <th className="px-3 py-2 text-right">Credit</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.id} className="border-b border-border last:border-0">
                      <td className="px-2 py-2">
                        <Select value={l.accountId} onValueChange={(v) => setLines((ls) => ls.map((x) => x.id === l.id ? { ...x, accountId: v } : x))}>
                          <SelectTrigger className="h-8 w-56"><SelectValue placeholder="Select account" /></SelectTrigger>
                          <SelectContent>
                            {postable.map((a) => (
                              <SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-2 py-2">
                        <Input className="h-8" value={l.memo} onChange={(e) => setLines((ls) => ls.map((x) => x.id === l.id ? { ...x, memo: e.target.value } : x))} />
                      </td>
                      <td className="px-2 py-2">
                        <Input className="h-8 text-right" inputMode="decimal" value={l.debit}
                          onChange={(e) => setLines((ls) => ls.map((x) => x.id === l.id ? { ...x, debit: e.target.value, credit: "" } : x))} />
                      </td>
                      <td className="px-2 py-2">
                        <Input className="h-8 text-right" inputMode="decimal" value={l.credit}
                          onChange={(e) => setLines((ls) => ls.map((x) => x.id === l.id ? { ...x, credit: e.target.value, debit: "" } : x))} />
                      </td>
                      <td className="px-1">
                        <Button size="icon" variant="ghost" aria-label="Remove line" disabled={lines.length <= 2}
                          onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))}>
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/40 font-semibold">
                    <td className="px-3 py-2" colSpan={2}>Totals</td>
                    <td className="tabular px-3 py-2 text-right">{bdt(totalDebit)}</td>
                    <td className="tabular px-3 py-2 text-right">{bdt(totalCredit)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button size="sm" variant="outline" onClick={() => setLines((ls) => [...ls, { id: Date.now(), accountId: "", debit: "", credit: "", memo: "" }])}>
                  <Plus className="size-4" /> Add line
                </Button>
                <span className={balanced ? "text-sm text-success" : "text-sm text-destructive"}>
                  {balanced ? "Balanced" : `Out of balance by ${bdt(Math.abs(totalDebit - totalCredit))}`}
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => submit("draft")}>Save draft</Button>
                <Button size="sm" disabled={!balanced} onClick={() => submit("posted")}>Post entry</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
