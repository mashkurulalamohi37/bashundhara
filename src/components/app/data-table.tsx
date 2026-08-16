import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownUp, ChevronLeft, ChevronRight, Columns3, Download, MoreHorizontal, Search, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EmptyState, ErrorState, TableSkeleton } from "./primitives";
import { toast } from "sonner";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  value?: (row: T) => string | number;
  className?: string;
  hideOnMobile?: boolean;
}

export interface FilterDef {
  key: string;
  label: string;
  options: string[];
}

export interface RowAction<T> {
  label: string;
  onSelect: (row: T) => void;
  destructive?: boolean;
}

interface DataTableProps<T extends { id: string }> {
  rows: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  searchPlaceholder?: string;
  filters?: FilterDef[];
  rowActions?: RowAction<T>[];
  onRowClick?: (row: T) => void;
  bulkActions?: { label: string; onSelect: (ids: string[]) => void }[];
  exportName?: string;
  toolbarExtra?: ReactNode;
  pageSize?: number;
}

export function DataTable<T extends { id: string } & Record<string, any>>({
  rows,
  columns,
  loading,
  error,
  onRetry,
  emptyTitle = "No records found",
  emptyDescription = "Adjust your search or filters to see results.",
  searchPlaceholder = "Search…",
  filters = [],
  rowActions = [],
  onRowClick,
  bulkActions = [],
  exportName = "records",
  toolbarExtra,
  pageSize: initialPageSize = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [hidden, setHidden] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const visibleCols = columns.filter((c) => !hidden.includes(c.key));

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let out = rows.filter((row) =>
      term ? Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(term)) : true,
    );
    for (const [key, value] of Object.entries(active)) {
      if (!value || value === "all") continue;
      out = out.filter((row) => String(row[key] ?? "") === value);
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      out = [...out].sort((a, b) => {
        const av = col?.value ? col.value(a) : a[sort.key];
        const bv = col?.value ? col.value(b) : b[sort.key];
        if (av === bv) return 0;
        return ((av ?? "") > (bv ?? "") ? 1 : -1) * (sort.dir === "asc" ? 1 : -1);
      });
    }
    return out;
  }, [rows, search, active, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const pageRows = filtered.slice((current - 1) * pageSize, current * pageSize);
  const hasFilters = search || Object.values(active).some((v) => v && v !== "all");

  const handleExport = () => {
    const header = visibleCols.map((c) => c.header).join(",");
    const body = filtered
      .map((row) => visibleCols.map((c) => JSON.stringify(String(row[c.key] ?? ""))).join(","))
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} ${exportName}`);
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border/80 bg-muted/10 p-3.5">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            aria-label="Search records"
            className="h-9 pl-9 text-xs rounded-xl bg-background"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
        {filters.map((f) => (
          <Select
            key={f.key}
            value={active[f.key] ?? "all"}
            onValueChange={(v) => {
              setActive((s) => ({ ...s, [f.key]: v }));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[150px] text-xs rounded-xl bg-background font-medium" aria-label={f.label}>
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {f.label.toLowerCase()}</SelectItem>
              {f.options.map((o) => (
                <SelectItem key={o} value={o} className="capitalize text-xs">
                  {o.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs font-semibold text-muted-foreground hover:text-foreground"
            onClick={() => {
              setSearch("");
              setActive({});
              setPage(1);
            }}
          >
            <X className="size-3.5 mr-1" /> Clear
          </Button>
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          {toolbarExtra}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs font-semibold rounded-xl">
                <Columns3 className="size-3.5 mr-1" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-xs">Visible columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c.key}
                  checked={!hidden.includes(c.key)}
                  onCheckedChange={(checked) =>
                    setHidden((h) => (checked ? h.filter((k) => k !== c.key) : [...h, c.key]))
                  }
                  className="text-xs"
                >
                  {c.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="h-9 text-xs font-semibold rounded-xl" onClick={handleExport}>
            <Download className="size-3.5 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {selected.length > 0 && bulkActions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-accent/40 px-4 py-2.5 text-xs">
          <span className="font-semibold">{selected.length} selected</span>
          {bulkActions.map((b) => (
            <Button
              key={b.label}
              size="sm"
              variant="outline"
              className="h-7 text-xs font-semibold"
              onClick={() => {
                b.onSelect(selected);
                setSelected([]);
              }}
            >
              {b.label}
            </Button>
          ))}
        </div>
      ) : null}

      {loading ? (
        <div className="p-4">
          <TableSkeleton cols={visibleCols.length} />
        </div>
      ) : error ? (
        <div className="p-4">
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      ) : pageRows.length === 0 ? (
        <div className="p-8">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[640px] border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">
                {bulkActions.length > 0 ? (
                  <th scope="col" className="w-10 px-3 py-2">
                    <Checkbox
                      aria-label="Select all rows on this page"
                      checked={pageRows.every((r) => selected.includes(r.id))}
                      onCheckedChange={(v) =>
                        setSelected(v ? Array.from(new Set([...selected, ...pageRows.map((r) => r.id)])) : [])
                      }
                    />
                  </th>
                ) : null}
                {visibleCols.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    className={cn(
                      "whitespace-nowrap px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                      c.hideOnMobile && "hidden md:table-cell",
                      c.className,
                    )}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      onClick={() =>
                        setSort((s) =>
                          s?.key === c.key
                            ? { key: c.key, dir: s.dir === "asc" ? "desc" : "asc" }
                            : { key: c.key, dir: "asc" },
                        )
                      }
                    >
                      {c.header}
                      <ArrowDownUp className={cn("size-3", sort?.key === c.key ? "text-foreground" : "opacity-40")} />
                    </button>
                  </th>
                ))}
                {rowActions.length > 0 ? <th scope="col" className="w-12 px-3 py-2" /> : null}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border last:border-0 hover:bg-accent/40",
                    onRowClick && "cursor-pointer",
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {bulkActions.length > 0 ? (
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        aria-label={`Select ${row.id}`}
                        checked={selected.includes(row.id)}
                        onCheckedChange={(v) =>
                          setSelected((s) => (v ? [...s, row.id] : s.filter((id) => id !== row.id)))
                        }
                      />
                    </td>
                  ) : null}
                  {visibleCols.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "px-3 py-2 align-middle",
                        c.hideOnMobile && "hidden md:table-cell",
                        c.className,
                      )}
                    >
                      {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                    </td>
                  ))}
                  {rowActions.length > 0 ? (
                    <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${row.id}`}>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {rowActions.map((a) => (
                            <DropdownMenuItem
                              key={a.label}
                              className={a.destructive ? "text-destructive focus:text-destructive" : undefined}
                              onSelect={() => a.onSelect(row)}
                            >
                              {a.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && filtered.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-3 py-2 text-sm">
          <span className="text-muted-foreground">
            {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, filtered.length)} of{" "}
            <span className="tabular">{filtered.length}</span> records
          </span>
          <div className="flex items-center gap-2">
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="h-8 w-[110px]" aria-label="Rows per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              aria-label="Previous page"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="tabular text-xs text-muted-foreground">
              {current} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              aria-label="Next page"
              disabled={current >= totalPages}
              onClick={() => setPage(current + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}