import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, KpiCard, Section, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { fiscalPeriodService, journalService } from "@/services";

export const Route = createFileRoute("/_admin/accounts/periods")({
  head: () => ({
    meta: [
      { title: "Fiscal Periods — Bashundhara R/A" },
      { name: "description", content: "Monthly period control: open, close and lock accounting periods with audit trail." },
      { property: "og:title", content: "Fiscal Periods — Bashundhara R/A" },
      { property: "og:description", content: "Monthly period control: open, close and lock accounting periods with audit trail." },
    ],
  }),
  component: Page,
});

function Page() {
  const periods = useQuery({ queryKey: ["fiscal-periods"], queryFn: () => fiscalPeriodService.all() });
  const entries = useQuery({ queryKey: ["journal-entries"], queryFn: () => journalService.all() });
  const rows = periods.data ?? [];
  const count = (id: string) => (entries.data ?? []).filter((e) => e.fiscalPeriodId === id).length;

  return (
    <>
      <PageHeader
        title="Fiscal Periods"
        description="Period control prevents backdated postings into closed months and preserves reported figures."
        breadcrumb={["Accounts", "Fiscal Periods"]}
        actions={<Button size="sm" onClick={() => toast.success("Year-end close checklist created", { description: "12 tasks assigned to the accounts team." })}>Start year-end close</Button>}
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-md bg-border">
          <KpiCard label="Open periods" value={rows.filter((p) => p.status === "open").length} tone="warning" />
          <KpiCard label="Closed periods" value={rows.filter((p) => p.status === "closed").length} tone="success" />
          <KpiCard label="Locked periods" value={rows.filter((p) => p.status === "locked").length} tone="info" />
        </div>
        <Section title="Period register" description="Fiscal year runs July to June">
          {periods.isLoading ? <TableSkeleton rows={10} cols={5} /> : (
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left">Period</th>
                  <th className="px-4 py-2 text-left">Fiscal year</th>
                  <th className="px-4 py-2 text-left">Range</th>
                  <th className="px-4 py-2 text-right">Entries</th>
                  <th className="px-4 py-2 text-left">Closed by</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2 font-medium">{p.name}</td>
                    <td className="px-4 py-2">{p.fiscalYear}</td>
                    <td className="px-4 py-2 text-muted-foreground">{p.startDate} → {p.endDate}</td>
                    <td className="tabular px-4 py-2 text-right">{count(p.id)}</td>
                    <td className="px-4 py-2 text-muted-foreground">{p.closedBy ?? "—"}</td>
                    <td className="px-4 py-2"><StatusBadge value={p.status} /></td>
                    <td className="px-4 py-2 text-right">
                      {p.status === "open" ? (
                        <Button size="sm" variant="outline" onClick={() => toast.success(`${p.name} closed`, { description: "No further postings allowed without reopening." })}>Close</Button>
                      ) : p.status === "closed" ? (
                        <Button size="sm" variant="ghost" onClick={() => toast.success(`${p.name} reopened`, { description: "Reopen recorded in the audit log." })}>Reopen</Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>
      </div>
    </>
  );
}
