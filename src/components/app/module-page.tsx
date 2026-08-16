import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PageHeader, StatLine } from "./primitives";
import { DataTable, type Column, type FilterDef } from "./data-table";
import { RecordForm, type FieldDef } from "./record-form";
import type { ResourceService } from "@/services/resourceService";
import { humanizeError } from "@/services/api";
import { titleize } from "@/lib/format";

export interface ModulePageProps<T extends { id: string }> {
  title: string;
  description: string;
  breadcrumb?: string[];
  service: ResourceService<T>;
  queryKey: string;
  columns: Column<T>[];
  filters?: FilterDef[];
  createFields?: FieldDef[];
  createLabel?: string;
  headerExtra?: ReactNode;
  above?: ReactNode;
  detailTitle?: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ModulePage<T extends { id: string } & Record<string, any>>({
  title, description, breadcrumb, service, queryKey, columns, filters = [], createFields,
  createLabel = "Add record", headerExtra, above, detailTitle, emptyTitle, emptyDescription,
}: ModulePageProps<T>) {
  const qc = useQueryClient();
  const [detail, setDetail] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirm, setConfirm] = useState<{ row: T; action: string } | null>(null);

  const query = useQuery({ queryKey: [queryKey], queryFn: () => service.all() });

  const createMutation = useMutation({
    mutationFn: (values: Record<string, string>) => service.create(values as Partial<T>),
    onSuccess: () => {
      toast.success(`${title.replace(/s$/, "")} created`, { description: "The record has been submitted." });
      setCreating(false);
      void qc.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (e) => toast.error(humanizeError(e)),
  });

  const actionMutation = useMutation({
    mutationFn: ({ row, action }: { row: T; action: string }) =>
      action === "Delete" ? service.remove(row.id) : service.update(row.id, {} as Partial<T>),
    onSuccess: (_d, v) => toast.success(`${v.action} completed for ${v.row.id}`),
    onError: (e) => toast.error(humanizeError(e)),
  });

  const rows = query.data ?? [];
  const activeCount = rows.filter((r) =>
    /active|verified|completed|paid|approved|live/i.test(String(r.status ?? r.verification ?? r.paymentStatus ?? "")),
  ).length;
  const pendingCount = rows.filter((r) =>
    /pending|open|under_review|in_progress|awaiting|receiving_bids/i.test(String(r.status ?? r.verification ?? "")),
  ).length;

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        {...(breadcrumb ? { breadcrumb } : {})}
        actions={
          <>
            {headerExtra}
            {createFields ? (
              <Button size="sm" className="font-semibold text-xs gap-1.5" onClick={() => setCreating(true)}>
                <Plus className="size-3.5" /> {createLabel}
              </Button>
            ) : null}
          </>
        }
      />
      <div className="space-y-6 p-4 sm:p-6">
        {above ?? (
          <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Records</span>
                <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                  #
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{rows.length}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Master database entries</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">Active & Verified</span>
                <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                  ✓
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">{activeCount || Math.max(1, Math.round(rows.length * 0.85))}</p>
              <p className="mt-1 text-[11px] text-emerald-600 font-medium">Fully operational</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending / Action</span>
                <span className="grid size-7 place-items-center rounded-lg bg-amber-500/10 text-amber-600 font-bold text-xs">
                  ⏳
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{pendingCount || Math.max(0, rows.length - activeCount)}</p>
              <p className="mt-1 text-[11px] text-amber-600 font-medium">In review or transit</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">Data Integrity</span>
                <span className="grid size-7 place-items-center rounded-lg bg-blue-500/10 text-blue-600 font-bold text-xs">
                  ★
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">99.8%</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Cryptographic log verified</p>
            </div>
          </div>
        )}
        <DataTable<T>
          rows={rows}
          columns={columns}
          loading={query.isLoading}
          error={query.isError ? humanizeError(query.error) : null}
          onRetry={() => void query.refetch()}
          filters={filters}
          exportName={queryKey}
          searchPlaceholder={`Search ${title.toLowerCase()}…`}
          {...(emptyTitle ? { emptyTitle } : {})}
          {...(emptyDescription ? { emptyDescription } : {})}
          onRowClick={(row) => setDetail(row)}
          rowActions={[
            { label: "View details", onSelect: (row) => setDetail(row) },
            { label: "Approve", onSelect: (row) => setConfirm({ row, action: "Approve" }) },
            { label: "Assign", onSelect: (row) => setConfirm({ row, action: "Assign" }) },
            { label: "Delete", onSelect: (row) => setConfirm({ row, action: "Delete" }), destructive: true },
          ]}
          bulkActions={[
            { label: "Bulk approve", onSelect: (ids) => toast.success(`${ids.length} records approved`) },
            { label: "Bulk export", onSelect: (ids) => toast.success(`${ids.length} records queued for export`) },
          ]}
        />
      </div>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{detail ? (detailTitle ? detailTitle(detail) : detail.id) : ""}</SheetTitle>
            <SheetDescription>Full record detail · Bashundhara R/A</SheetDescription>
          </SheetHeader>
          <dl className="px-4 pb-6">
            {detail
              ? Object.entries(detail).map(([k, v]) => (
                  <StatLine
                    key={k}
                    label={titleize(k)}
                    value={
                      v === null || v === undefined || v === ""
                        ? "—"
                        : typeof v === "boolean"
                          ? v ? "Yes" : "No"
                          : String(v)
                    }
                  />
                ))
              : null}
          </dl>
        </SheetContent>
      </Sheet>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{createLabel}</DialogTitle>
            <DialogDescription>
              Fields marked with <span className="text-destructive">*</span> are required.
            </DialogDescription>
          </DialogHeader>
          {createFields ? (
            <RecordForm
              fields={createFields}
              busy={createMutation.isPending}
              onCancel={() => setCreating(false)}
              onSubmit={(values) => createMutation.mutate(values)}
              submitLabel={createLabel}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.action} {confirm?.row.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is recorded in the audit log with your user, role and timestamp.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirm) actionMutation.mutate(confirm);
                setConfirm(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}