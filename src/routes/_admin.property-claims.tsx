import { useSyncExternalStore, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2, CheckCircle2, Clock, FileText, AlertCircle, XCircle,
  ChevronRight, Upload, MessageSquare, Loader2, Eye, ShieldCheck,
  Search, Filter, Plus, User,
} from "lucide-react";
import { PageHeader, Section, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { opsStore, getSnapshot, subscribe } from "@/services/opsStore";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { ClaimStatus, PropertyClaim } from "@/types/ops";

export const Route = createFileRoute("/_admin/property-claims")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Property Claims — Bashundhara R/A" },
      { name: "description", content: "Review and approve property access requests from applicants." },
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
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", cfg.className)}>
      <Icon className="size-3.5" />
      {cfg.label}
    </span>
  );
}

function AdminClaimCard({ claim, onReview }: { claim: PropertyClaim; onReview: (claim: PropertyClaim) => void }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/10 text-primary font-bold text-base shadow-sm">
            {claim.applicant.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-base text-foreground">{claim.applicant}</p>
              <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">{claim.id}</Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{claim.phone}</p>
            <p className="mt-1 text-xs font-semibold text-primary flex items-center gap-1">
              <Building2 className="size-3.5" /> {claim.propertyLabel} · {claim.block}
            </p>
          </div>
        </div>
        <ClaimStatusBadge status={claim.status} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-3 border-t border-border/60">
        <span className="capitalize rounded-lg bg-muted px-2.5 py-1 font-semibold text-foreground">
          {claim.relationship.replace(/_/g, " ")}
        </span>
        <span>Submitted {new Date(claim.submittedOn).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
        <span>· {claim.documents.length} supporting doc{claim.documents.length !== 1 ? "s" : ""}</span>
        {claim.reviewer && <span className="text-primary font-medium">· Reviewer: {claim.reviewer}</span>}
      </div>

      {claim.reviewNotes && (
        <p className="mt-3 rounded-xl bg-muted/40 border border-border/60 px-3.5 py-2 text-xs text-muted-foreground">
          <MessageSquare className="inline size-3.5 mr-1.5 text-primary" />
          {claim.reviewNotes}
        </p>
      )}

      {claim.status !== "approved" && claim.status !== "rejected" && (
        <div className="mt-4 flex gap-2">
          <Button size="sm" className="h-9 px-4 font-semibold" onClick={() => onReview(claim)}>
            <ShieldCheck className="mr-1.5 size-4" /> Review Claim
          </Button>
          <Button size="sm" variant="outline" className="h-9" asChild>
            <Link to="/control/people">
              <User className="mr-1.5 size-3.5" /> View Person
            </Link>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="border-b border-border bg-muted/20 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base">Review Property Claim</h2>
            <p className="text-xs text-muted-foreground">{claim.id} · {claim.propertyLabel}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs rounded-xl bg-muted/20 border border-border/60 p-4">
            <span className="text-muted-foreground">Applicant</span><span className="font-bold text-foreground">{claim.applicant}</span>
            <span className="text-muted-foreground">Relationship</span><span className="capitalize font-semibold text-primary">{claim.relationship.replace(/_/g, " ")}</span>
            <span className="text-muted-foreground">Property</span><span className="font-semibold">{claim.propertyLabel}</span>
            <span className="text-muted-foreground">Block / Road</span><span>{claim.road}, {claim.block}</span>
            <span className="text-muted-foreground">Current Status</span><span><ClaimStatusBadge status={claim.status} /></span>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Verification Documents ({claim.documents.length})
            </p>
            <div className="space-y-1.5">
              {claim.documents.map((d) => (
                <div key={d} className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium">
                  <FileText className="size-4 text-primary" />
                  <span>{d}</span>
                  <span className="ml-auto text-primary font-semibold text-xs cursor-pointer hover:underline">Preview (mock)</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold">Verification Notes</label>
            <textarea
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add official notes for the applicant or welfare records…"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border bg-muted/10 px-6 py-4">
          <Button variant="outline" size="sm" className="flex-1" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="outline" size="sm" className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50" onClick={() => decide("more_info_required")} disabled={busy}>
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : "Need Info"}
          </Button>
          <Button variant="outline" size="sm" className="flex-1 border-red-300 text-red-700 hover:bg-red-50" onClick={() => decide("rejected")} disabled={busy}>
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : "Reject"}
          </Button>
          <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-semibold" onClick={() => decide("approved")} disabled={busy}>
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
  const [search, setSearch] = useState("");
  const [reviewing, setReviewing] = useState<PropertyClaim | null>(null);

  const isAdmin = user?.role !== "resident" && user?.role !== "tenant" && user?.role !== "building_owner";

  const filtered = store.claims.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.applicant.toLowerCase().includes(q) ||
        c.propertyLabel.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = store.claims.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    acc.all = (acc.all ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <PageHeader
        title="Property Claims & Tenancy Verification"
        description="Review and verify property ownership, tenancy agreements, and household access requests."
        breadcrumb={["People", "Property Claims"]}
        actions={
          <Button asChild size="sm" className="gap-1.5 font-semibold">
            <Link to="/onboarding">
              <Plus className="size-3.5" /> Submit New Claim
            </Link>
          </Button>
        }
      />

      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        {/* Metric Filter Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: "all", label: "Total Claims", count: counts.all ?? 0, color: "text-foreground" },
            { id: "pending_verification", label: "Pending Verification", count: counts.pending_verification ?? 0, color: "text-amber-600" },
            { id: "under_review", label: "Under Review", count: counts.under_review ?? 0, color: "text-blue-600" },
            { id: "approved", label: "Approved", count: counts.approved ?? 0, color: "text-emerald-600" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id as any)}
              className={cn(
                "rounded-2xl border p-4 text-left transition-all duration-200",
                filter === item.id
                  ? "border-primary bg-primary/10 ring-1 ring-primary shadow-sm"
                  : "border-border bg-card hover:border-primary/40 hover:shadow-sm",
              )}
            >
              <p className={cn("text-2xl font-bold tabular-nums", item.color)}>{item.count}</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">{item.label}</p>
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by applicant name, flat number, phone, or ticket ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-3 text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>

        {/* Claim list */}
        <div className="space-y-3.5">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border py-12 text-center text-sm text-muted-foreground bg-card">
              <Building2 className="mx-auto mb-3 size-10 opacity-30 text-primary" />
              <p className="font-semibold text-foreground">No claims matching your filter</p>
              <p className="text-xs text-muted-foreground mt-1">Try searching a different name or clearing filters.</p>
            </div>
          ) : (
            filtered.map((c) => (
              isAdmin ? (
                <AdminClaimCard key={c.id} claim={c} onReview={setReviewing} />
              ) : (
                <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-foreground text-base">{c.propertyLabel}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">{c.relationship.replace(/_/g, " ")} · {c.block}</p>
                    </div>
                    <ClaimStatusBadge status={c.status} />
                  </div>
                  {c.reviewNotes && (
                    <p className="mt-3 rounded-xl bg-muted/40 px-3.5 py-2 text-xs text-muted-foreground">{c.reviewNotes}</p>
                  )}
                  <p className="mt-3 text-[11px] text-muted-foreground">
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
    </>
  );
}
