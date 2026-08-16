import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { PageHeader, KpiCard, Section, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RecordForm, type FieldDef } from "@/components/app/record-form";
import { accountService } from "@/services";
import { bdt, titleize } from "@/lib/format";
import { toast } from "sonner";
import type { Account } from "@/types";

export const Route = createFileRoute("/_admin/accounts/chart")({
  head: () => ({
    meta: [
      { title: "Chart of Accounts — Bashundhara R/A" },
      { name: "description", content: "Hierarchical chart of accounts for assets, liabilities, equity, revenue and expenditure." },
      { property: "og:title", content: "Chart of Accounts — Bashundhara R/A" },
      { property: "og:description", content: "Hierarchical chart of accounts for assets, liabilities, equity, revenue and expenditure." },
    ],
  }),
  component: Page,
});

const createFields: FieldDef[] = [
  { name: "code", label: "Account code", required: true, placeholder: "e.g. 5310" },
  { name: "name", label: "Account name", required: true },
  { name: "type", label: "Account type", type: "select", options: ["asset", "liability", "equity", "revenue", "expense"], required: true },
  { name: "parent", label: "Parent group code", placeholder: "e.g. 5000" },
  { name: "description", label: "Description", type: "textarea" },
];

const TYPE_TONE: Record<Account["type"], string> = {
  asset: "text-chart-1",
  liability: "text-chart-4",
  equity: "text-chart-3",
  revenue: "text-success",
  expense: "text-destructive",
};

function Page() {
  const { data, isLoading } = useQuery({ queryKey: ["chart-of-accounts"], queryFn: () => accountService.all() });
  const [open, setOpen] = useState<Record<string, boolean>>({ "ACC-1000": true, "ACC-4000": true, "ACC-5000": true });
  const [term, setTerm] = useState("");
  const [creating, setCreating] = useState(false);

  const rows = data ?? [];
  const totals = useMemo(() => {
    const by = (t: Account["type"]) => rows.filter((a) => !a.isGroup && a.type === t).reduce((s, a) => s + a.balance, 0);
    return { asset: by("asset"), liability: by("liability"), equity: by("equity"), revenue: by("revenue"), expense: by("expense") };
  }, [rows]);

  const matches = (a: Account) =>
    !term || `${a.code} ${a.name}`.toLowerCase().includes(term.toLowerCase());

  const children = (parentId: string | null) => rows.filter((a) => a.parentId === parentId);

  const renderNode = (a: Account, depth: number): React.ReactNode[] => {
    const kids = children(a.id);
    const kidNodes = kids.flatMap((k) => renderNode(k, depth + 1));
    const visible = matches(a) || kidNodes.length > 0;
    if (!visible) return [];
    const expanded = term ? true : (open[a.id] ?? depth > 1);
    return [
      <div
        key={a.id}
        className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-sm hover:bg-accent/50"
        style={{ paddingLeft: `${16 + depth * 20}px` }}
      >
        {kids.length ? (
          <button
            type="button"
            aria-label={expanded ? "Collapse" : "Expand"}
            onClick={() => setOpen((o) => ({ ...o, [a.id]: !expanded }))}
            className="text-muted-foreground"
          >
            {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <span className="tabular w-16 shrink-0 text-xs text-muted-foreground">{a.code}</span>
        <span className={a.isGroup ? "font-semibold" : ""}>{a.name}</span>
        <span className={`ml-2 text-[11px] uppercase tracking-wide ${TYPE_TONE[a.type]}`}>{a.type}</span>
        <span className="ml-auto flex items-center gap-3">
          <span className="tabular text-sm font-medium">{bdt(a.balance)}</span>
          <span className="hidden w-16 text-right text-xs text-muted-foreground sm:inline">{titleize(a.normalBalance)}</span>
          <StatusBadge value={a.status} />
          {!a.isGroup ? (
            <Button asChild size="sm" variant="ghost">
              <Link to="/accounts/ledger" search={{ account: a.id }}>Ledger</Link>
            </Button>
          ) : null}
        </span>
      </div>,
      ...(expanded ? kidNodes : []),
    ];
  };

  return (
    <>
      <PageHeader
        title="Chart of Accounts"
        description="Hierarchical account structure driving every posting in the community ledger."
        breadcrumb={["Accounts", "Chart of Accounts"]}
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" /> Add account
          </Button>
        }
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border lg:grid-cols-5">
          <KpiCard label="Assets" value={bdt(totals.asset, true)} tone="primary" />
          <KpiCard label="Liabilities" value={bdt(totals.liability, true)} tone="danger" />
          <KpiCard label="Equity & funds" value={bdt(totals.equity, true)} tone="info" />
          <KpiCard label="Revenue" value={bdt(totals.revenue, true)} tone="success" />
          <KpiCard label="Expenditure" value={bdt(totals.expense, true)} tone="warning" />
        </div>

        <Section
          title="Account tree"
          description={`${rows.length} accounts · BDT presentation currency`}
          actions={
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search code or name…"
              className="h-8 w-56"
            />
          }
        >
          {isLoading ? <TableSkeleton rows={10} cols={4} /> : <div>{children(null).flatMap((a) => renderNode(a, 0))}</div>}
        </Section>
      </div>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add account</DialogTitle>
            <DialogDescription>New accounts inherit the normal balance of their account type.</DialogDescription>
          </DialogHeader>
          <RecordForm
            fields={createFields}
            submitLabel="Create account"
            onCancel={() => setCreating(false)}
            onSubmit={(v) => {
              setCreating(false);
              toast.success(`Account ${v["code"]} created`, { description: v["name"] });
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
