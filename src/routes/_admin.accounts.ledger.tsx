import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, KpiCard, Section, TableSkeleton, EmptyState } from "@/components/app/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { accountService, reportingService } from "@/services";
import { bdt, titleize } from "@/lib/format";

export const Route = createFileRoute("/_admin/accounts/ledger")({
  validateSearch: (search: Record<string, unknown>): { account: string } => ({
    account: typeof search["account"] === "string" ? search["account"] : "ACC-1140",
  }),
  head: () => ({
    meta: [
      { title: "General Ledger — Bashundhara R/A" },
      { name: "description", content: "Account-wise ledger with running balance, source entry drill-down and cost center tagging." },
      { property: "og:title", content: "General Ledger — Bashundhara R/A" },
      { property: "og:description", content: "Account-wise ledger with running balance, source entry drill-down and cost center tagging." },
    ],
  }),
  component: Page,
});

function Page() {
  const { account } = Route.useSearch();
  const navigate = useNavigate();
  const accounts = useQuery({ queryKey: ["chart-of-accounts"], queryFn: () => accountService.all() });
  const ledger = useQuery({ queryKey: ["ledger", account], queryFn: () => reportingService.ledger(account) });
  const postable = (accounts.data ?? []).filter((a) => !a.isGroup);
  const l = ledger.data;

  return (
    <>
      <PageHeader
        title="General Ledger"
        description="Chronological postings per account with opening balance, movement and running closing balance."
        breadcrumb={["Accounts", "General Ledger"]}
        actions={
          <Select value={account} onValueChange={(v) => void navigate({ to: "/accounts/ledger", search: { account: v } })}>
            <SelectTrigger className="h-8 w-72"><SelectValue placeholder="Select account" /></SelectTrigger>
            <SelectContent>
              {postable.map((a) => <SelectItem key={a.id} value={a.id}>{a.code} — {a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border lg:grid-cols-4">
          <KpiCard label="Account" value={l?.account?.code ?? "—"} hint={l?.account?.name ?? ""} tone="primary" />
          <KpiCard label="Normal balance" value={l?.account ? titleize(l.account.normalBalance) : "—"} hint={l?.account ? titleize(l.account.type) : ""} />
          <KpiCard label="Opening balance" value={bdt(l?.opening ?? 0, true)} tone="info" />
          <KpiCard label="Closing balance" value={bdt(l?.closing ?? 0, true)} tone="success" hint={`${l?.rows.length ?? 0} postings`} />
        </div>

        <Section title="Ledger postings" description={l?.account?.description ?? ""}>
          {ledger.isLoading ? (
            <TableSkeleton rows={10} cols={6} />
          ) : !l?.rows.length ? (
            <EmptyState title="No postings in this account" description="Postings appear here as soon as journal entries are posted." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Entry</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-left">Cost center</th>
                    <th className="px-4 py-2 text-right">Debit</th>
                    <th className="px-4 py-2 text-right">Credit</th>
                    <th className="px-4 py-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border bg-muted/20">
                    <td className="px-4 py-2 text-muted-foreground" colSpan={6}>Opening balance</td>
                    <td className="tabular px-4 py-2 text-right font-medium">{bdt(l.opening)}</td>
                  </tr>
                  {l.rows.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-accent/40">
                      <td className="px-4 py-2 whitespace-nowrap">{r.date}</td>
                      <td className="px-4 py-2">{r.entryNo}</td>
                      <td className="px-4 py-2">{r.description}<span className="block text-xs text-muted-foreground">{r.reference}</span></td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{r.costCenter ?? "—"}</td>
                      <td className="tabular px-4 py-2 text-right">{r.debit ? bdt(r.debit) : "—"}</td>
                      <td className="tabular px-4 py-2 text-right">{r.credit ? bdt(r.credit) : "—"}</td>
                      <td className="tabular px-4 py-2 text-right font-medium">{bdt(r.balance)}</td>
                    </tr>
                  ))}
                  <tr className="bg-muted/40 font-semibold">
                    <td className="px-4 py-2" colSpan={6}>Closing balance</td>
                    <td className="tabular px-4 py-2 text-right">{bdt(l.closing)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>
    </>
  );
}
