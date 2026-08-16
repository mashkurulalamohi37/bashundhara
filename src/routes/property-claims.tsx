import { useSyncExternalStore, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2, CheckCircle2, Clock, FileText, AlertCircle, XCircle,
  ChevronRight, Upload, MessageSquare, Loader2, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { opsStore, getSnapshot, subscribe } from "@/services/opsStore";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { ClaimStatus, PropertyClaim } from "@/types/ops";

export const Route = createFileRoute("/property-claims")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Property Claims — Bashundhara R/A" },
      { name: "description", content: "Track and manage property access requests and verification status." },
    ],
  }),
  component: PropertyClaimsPage,
});

const STATUS_CONFIG: Record<ClaimStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  pending_verification: { label: "Pending Verification", icon: Clock, className: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30" },
  under_review: { label: "Under Review", icon: Eye, className: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30" },
  approved: { label: "Approved", icon: CheckCircle2, className: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30" },
  rejected: { label: "Rejected", icon: XCircle, className: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30" },
  more_info_required: { label: "More Info Required", icon: AlertCircle, className: "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/30" },
};

function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", cfg.className)}>
      <Icon className="size-3.5" />
      {cfg.label}
    </span>
  );
}

function AdminClaimCard({ claim, onReview }: { claim: PropertyClaim; onReview: (claim: PropertyClaim) => void }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 hover:border-muted-foreground/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
            {claim.applicant.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>
          <div>
            <p className="font-medium text-sm">{claim.applicant}</p>
            <p className="text-xs text-muted-foreground">{claim.phone}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{claim.propertyLabel} · {claim.block}</p>
          </div>
        </div>
        <ClaimStatusBadge status={claim.status} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="capitalize rounded bg-muted px-2 py-0.5">{claim.relationship.replace(/_/g, " ")}</span>
        <span>Submitted {new Date(claim.submittedOn).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
        <span>{claim.documents.length} document{claim.documents.length !== 1 ? "s" : ""}</span>
        {claim.reviewer && <span>· Reviewer: {claim.reviewer}</span>}
      </div>

      {claim.reviewNotes && (
        <p className="mt-2 rounded bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <MessageSquare className="inline size-3 mr-1" />
          {claim.reviewNotes}
        </p>
      )}

      {claim.status !== "approved" && claim.status !== "rejected" && (
        <div className="mt-3 flex gap-2">
          <Button size="sm" className="flex-1" onClick={() => onReview(claim)}>
            Review claim
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to={`/control/people`}>View person</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function ReviewModal({ claim, onClose }: { claim: PropertyClaim; onClose: () => void }) {
  const [notes, setNotes] = useState(claim.reviewNotes);
  const [busy, setBusy] = useState(false);

  async function decide(status: ClaimStatus) {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    opsStore.reviewClaim(claim.id, status, "Community Admin", notes);
    setBusy(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold">Review Property Claim</h2>
          <p className="text-sm text-muted-foreground">{claim.id} · {claim.propertyLabel}</p>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <span className="text-muted-foreground">Applicant</span><span className="font-medium">{claim.applicant}</span>
            <span className="text-muted-foreground">Relationship</span><span className="capitalize">{claim.relationship.replace(/_/g, " ")}</span>
            <span className="text-muted-foreground">Property</span><span>{claim.propertyLabel}</span>
            <span className="text-muted-foreground">Block / Road</span><span>{claim.road}, {claim.block}</span>
            <span className="text-muted-foreground">Status</span><span><ClaimStatusBadge status={claim.status} /></span>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Documents ({claim.documents.length})</p>
            <div className="space-y-1">
              {claim.documents.map((d) => (
                <div key={d} className="flex items-center gap-2 rounded border border-border px-3 py-1.5 text-xs">
                  <FileText className="size-3.5 text-muted-foreground" />
                  {d}
                  <span className="ml-auto text-primary text-xs cursor-pointer hover:underline">View (mock)</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium">Review notes</label>
            <textarea
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for the applicant…"
            />
          </div>
        </div>

        <div className="flex gap-2 border-t border-border px-5 py-4">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="outline" className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50" onClick={() => decide("more_info_required")} disabled={busy}>
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : "More info"}
          </Button>
          <Button variant="outline" className="flex-1 border-red-300 text-red-700 hover:bg-red-50" onClick={() => decide("rejected")} disabled={busy}>
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : "Reject"}
          </Button>
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => decide("approved")} disabled={busy}>
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : "Approve"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PropertyClaimsPage() {
  const { user } = useAuth();
  const store = useSyncExternalStore(subscribe, getSnapshot);
  const [filter, setFilter] = useState<ClaimStatus | "all">("all");
  const [reviewing, setReviewing] = useState<PropertyClaim | null>(null);

  const isAdmin = user?.role !== "resident" && user?.role !== "tenant" && user?.role !== "building_owner";

  const filtered = store.claims.filter((c) =>
    filter === "all" ? true : c.status === filter,
  );

  const counts = store.claims.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    acc.all = (acc.all ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Property Claims</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? "Review and approve property access requests from applicants." : "Track your property access request status."}
          </p>
        </div>
        <Button asChild>
          <Link to="/onboarding">
            <Building2 className="mr-2 size-4" /> New claim
          </Link>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["all", "Total", counts.all ?? 0],
          ["pending_verification", "Pending", counts.pending_verification ?? 0],
          ["under_review", "Under Review", counts.under_review ?? 0],
          ["approved", "Approved", counts.approved ?? 0],
        ].map(([s, label, count]) => (
          <button
            key={String(s)}
            type="button"
            onClick={() => setFilter(s as ClaimStatus | "all")}
            className={cn(
              "rounded-lg border p-3 text-left transition-all",
              filter === s ? "border-primary bg-primary/10" : "border-border bg-card hover:border-muted-foreground/50",
            )}
          >
            <p className="text-2xl font-bold tabular-nums">{count}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
          </button>
        ))}
      </div>

      {/* Claim list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            <Building2 className="mx-auto mb-3 size-8 opacity-40" />
            No claims found
          </div>
        ) : (
          filtered.map((c) => (
            isAdmin ? (
              <AdminClaimCard key={c.id} claim={c} onReview={setReviewing} />
            ) : (
              <div key={c.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{c.propertyLabel}</p>
                    <p className="text-sm text-muted-foreground capitalize">{c.relationship.replace(/_/g, " ")} · {c.block}</p>
                  </div>
                  <ClaimStatusBadge status={c.status} />
                </div>
                {c.reviewNotes && (
                  <p className="mt-2 rounded bg-muted/50 px-3 py-2 text-xs text-muted-foreground">{c.reviewNotes}</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Submitted {new Date(c.submittedOn).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  {c.reviewer ? ` · Reviewer: ${c.reviewer}` : ""}
                </p>
              </div>
            )
          ))
        )}
      </div>

      {reviewing && (
        <ReviewModal claim={reviewing} onClose={() => setReviewing(null)} />
      )}
    </div>
  );
}
