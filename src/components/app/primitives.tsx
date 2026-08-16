import type { ReactNode } from "react";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumb?: string[];
  actions?: ReactNode;
}) {
  return (
    <header className="border-b border-border bg-card px-4 py-4 sm:px-6">
      {breadcrumb?.length ? (
        <nav aria-label="Breadcrumb" className="mb-1.5 text-xs text-muted-foreground">
          {breadcrumb.map((crumb, i) => (
            <span key={crumb}>
              {i > 0 && <span className="px-1.5 text-border">/</span>}
              {crumb}
            </span>
          ))}
        </nav>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold sm:text-xl">{title}</h1>
          {description ? (
            <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

export function Section({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md", className)}>
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold">{title}</h2>
            {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "primary";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
  success: "bg-success/12 text-success border-success/30 hover:bg-success/20",
  warning: "bg-warning/15 text-warning-foreground border-warning/40 hover:bg-warning/25",
  danger: "bg-destructive/12 text-destructive border-destructive/30 hover:bg-destructive/20",
  info: "bg-info/12 text-info border-info/30 hover:bg-info/20",
  primary: "bg-primary-soft text-accent-foreground border-primary/25 hover:bg-primary-soft/80",
};

const TONE_MAP: Record<string, Tone> = {
  active: "success", approved: "success", paid: "success", resolved: "success", online: "success",
  operational: "success", completed: "success", ok: "success", verified: "success", available: "success",
  on_duty: "success", open: "success", checked_out: "neutral", closed: "neutral", inactive: "neutral",
  off_duty: "neutral", draft: "neutral", idle: "neutral", vacant: "neutral", cancelled: "neutral",
  pending: "warning", waiting: "warning", partial: "warning", due: "warning", scheduled: "warning",
  degraded: "warning", requested: "warning", restricted: "warning", fair: "warning", maintenance: "warning",
  inspection: "warning", investigating: "warning", acknowledged: "warning", medium: "warning",
  under_development: "warning", partial_occupied: "warning", leave: "warning", expired: "warning",
  overdue: "danger", rejected: "danger", offline: "danger", down: "danger", blocked: "danger",
  faulty: "danger", critical: "danger", high: "danger", suspended: "danger", new: "danger",
  responding: "danger", on_scene: "danger", poor: "danger", emergency: "danger",
  in_progress: "info", assigned: "info", checked_in: "info", on_patrol: "info", occupied: "info",
  reserved: "info", construction: "info", upcoming: "info", info: "info", low: "neutral",
  on_route: "info", notified: "info", at_gate: "warning", delivered: "success", returned: "neutral",
};

export function StatusBadge({ value, tone }: { value: string; tone?: Tone }) {
  const resolved = tone ?? TONE_MAP[value] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded border px-2 py-0.5 text-xs font-medium capitalize transition-transform hover:scale-105 cursor-default",
        TONE_CLASS[resolved],
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {value.replace(/_/g, " ")}
    </span>
  );
}

export function KpiCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: Tone;
  hint?: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-3 border border-border bg-card p-4 first:rounded-l-md last:rounded-r-md transition-all duration-200 hover:bg-muted/30 hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        {Icon ? (
          <span className={cn("rounded p-1 transition-transform hover:scale-110", TONE_CLASS[tone])}>
            <Icon className="size-3.5" />
          </span>
        ) : null}
      </div>
      <div>
        <div className="tabular text-2xl font-semibold leading-none">{value}</div>
        {delta || hint ? (
          <p className="mt-1.5 text-xs text-muted-foreground">{delta ?? hint}</p>
        ) : null}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <span className="rounded-full border border-border bg-muted p-3 text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <h3 className="text-sm font-semibold">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: (() => void) | undefined }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <span className="rounded-full border border-destructive/30 bg-destructive/10 p-3 text-destructive">
        <AlertTriangle className="size-5" />
      </span>
      <h3 className="text-sm font-semibold">Could not load data</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          <RefreshCw className="size-3.5" /> Retry
        </Button>
      ) : null}
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-border" aria-busy="true" aria-label="Loading records">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3">
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className={cn("h-4", c === 0 ? "w-40" : "w-24")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatLine({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2 last:border-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
    </div>
  );
}