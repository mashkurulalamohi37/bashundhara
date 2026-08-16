import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, KpiCard, Section, TableSkeleton, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { reportingService } from "@/services";
import { bdt, titleize } from "@/lib/format";

export const Route = createFileRoute("/_admin/accounts/trial-balance")({
  head: () => ({
    meta: [
      { title: "Trial Balance — Bashundhara R/A" },
      { name: "description", content: "Account-wise debit and credit totals proving the community ledger is in balance." },
      { property: "og:title", content: "Trial Balance — Bashundhara R/A" },
      { property: "og:description", content: "Account-wise debit and credit totals proving the community ledger is in balance." },
    ],
  }),
  component: Page,
});

function Page() {
  const { data, isLoading } = useQuery({ queryKey: ["trial-balance"], queryFn: () => reportingService.trialBalance() });
  return (
    <>
      <PageHeader
        title="Trial Balance"
        description="As at 15 August 2026 · all funds, all buildings, BDT."
        breadcrumb={["Accounts", "Trial Balance"]}
        actions={
          <Button size="sm" variant="outline" onClick={() => toast.success("Trial balance export queued", { description: "Excel export will be emailed to you." })}>
            <Download className="size-4" /> Export
          </Button>
        }
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md bg-border">
          <KpiCard label="Total debit" value={bdt(data?.totalDebit ?? 0, true)} tone="primary" />
          <KpiCard label="Total credit" value={bdt(data?.totalCredit ?? 0, true)} tone="info" />
          <KpiCard label="Difference" value={bdt(Math.abs((data?.totalDebit ?? 0) - (data?.totalCredit ?? 0)))} tone={data?.balanced ? "success" : "danger"} hint={data?.balanced ? "Ledger is balanced" : "Investigate suspense postings"} />
        </div>
        <Section title="Account balances" description={`${data?.rows.length ?? 0} postable accounts`}>
          {isLoading ? <TableSkeleton rows={12} cols={4} /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left">Code</th>
                    <th className="px-4 py-2 text-left">Account</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-right">Debit</th>
                    <th className="px-4 py-2 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.rows ?? []).map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-accent/40">
                      <td className="tabular px-4 py-2">{r.code}</td>
                      <td className="px-4 py-2">{r.name}</td>
                      <td className="px-4 py-2"><StatusBadge value={titleize(r.type)} /></td>
                      <td className="tabular px-4 py-2 text-right">{r.debit ? bdt(r.debit) : "—"}</td>
                      <td className="tabular px-4 py-2 text-right">{r.credit ? bdt(r.credit) : "—"}</td>
                    </tr>
                  ))}
                  <tr className="bg-muted/40 font-semibold">
                    <td className="px-4 py-2" colSpan={3}>Total</td>
                    <td className="tabular px-4 py-2 text-right">{bdt(data?.totalDebit ?? 0)}</td>
                    <td className="tabular px-4 py-2 text-right">{bdt(data?.totalCredit ?? 0)}</td>
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
