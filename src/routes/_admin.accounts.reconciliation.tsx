import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, KpiCard, Section, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bankStatementService, cashBankService, cashTransactionService } from "@/services";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/accounts/reconciliation")({
  head: () => ({
    meta: [
      { title: "Bank Reconciliation — Bashundhara R/A" },
      { name: "description", content: "Match bank statement lines against ledger cash transactions and resolve differences." },
      { property: "og:title", content: "Bank Reconciliation — Bashundhara R/A" },
      { property: "og:description", content: "Match bank statement lines against ledger cash transactions and resolve differences." },
    ],
  }),
  component: Page,
});

function Page() {
  const accounts = useQuery({ queryKey: ["cash-bank"], queryFn: () => cashBankService.all() });
  const lines = useQuery({ queryKey: ["bank-statement"], queryFn: () => bankStatementService.all() });
  const txns = useQuery({ queryKey: ["cash-transactions"], queryFn: () => cashTransactionService.all() });
  const [accountId, setAccountId] = useState("CB-01");
  const [resolved, setResolved] = useState<Record<string, boolean>>({});

  const bankAccounts = (accounts.data ?? []).filter((a) => a.kind === "bank");
  const rows = useMemo(() => (lines.data ?? []).filter((l) => l.accountId === accountId), [lines.data, accountId]);
  const ledgerRows = useMemo(() => (txns.data ?? []).filter((t) => t.accountId === accountId), [txns.data, accountId]);
  const unmatched = rows.filter((l) => l.matchStatus === "unmatched" && !resolved[l.id]);
  const statementBalance = rows.reduce((s, l) => s + l.credit - l.debit, 0);
  const ledgerBalance = ledgerRows.reduce((s, t) => s + (t.kind === "deposit" || t.kind === "transfer_in" ? t.amount : -t.amount), 0);

  return (
    <>
      <PageHeader
        title="Bank Reconciliation"
        description="Compare the bank statement with the ledger, match line by line and close the difference."
        breadcrumb={["Accounts", "Reconciliation"]}
        actions={
          <>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger className="h-8 w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                {bankAccounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" disabled={unmatched.length > 0}
              onClick={() => toast.success("Reconciliation closed", { description: "Period marked reconciled and locked for this account." })}>
              Close reconciliation
            </Button>
          </>
        }
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border lg:grid-cols-4">
          <KpiCard label="Statement movement" value={bdt(statementBalance, true)} tone="info" />
          <KpiCard label="Ledger movement" value={bdt(ledgerBalance, true)} tone="primary" />
          <KpiCard label="Difference" value={bdt(Math.abs(statementBalance - ledgerBalance), true)} tone={unmatched.length ? "danger" : "success"} />
          <KpiCard label="Unmatched lines" value={unmatched.length} tone={unmatched.length ? "warning" : "success"} hint={`${rows.length} statement lines`} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Bank statement" description="Imported from the bank feed">
            {lines.isLoading ? <TableSkeleton rows={8} cols={4} /> : (
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Description</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2 text-right">Match</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => {
                    const state = resolved[l.id] ? "resolved" : l.matchStatus;
                    return (
                      <tr key={l.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-2 whitespace-nowrap">{l.date}</td>
                        <td className="px-3 py-2">{l.description}<span className="block text-xs text-muted-foreground">{l.reference}</span></td>
                        <td className={`tabular px-3 py-2 text-right ${l.debit ? "text-destructive" : "text-success"}`}>
                          {bdt(l.debit || l.credit)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {state === "unmatched" ? (
                            <Button size="sm" variant="outline" onClick={() => {
                              setResolved((r) => ({ ...r, [l.id]: true }));
                              toast.success("Line matched to ledger transaction");
                            }}>Match</Button>
                          ) : <StatusBadge value={state} />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Section>

          <Section title="Ledger cash transactions" description="Posted from the accounting engine">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Description</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-right">State</th>
                </tr>
              </thead>
              <tbody>
                {ledgerRows.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 whitespace-nowrap">{t.date}</td>
                    <td className="px-3 py-2">{t.description}<span className="block text-xs text-muted-foreground">{t.reference}</span></td>
                    <td className="tabular px-3 py-2 text-right">{bdt(t.amount)}</td>
                    <td className="px-3 py-2 text-right"><StatusBadge value={t.matched ? "matched" : "open"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>
      </div>
    </>
  );
}
