import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  TriangleAlert, CheckCircle2, ShieldAlert, DollarSign, Search,
  Store, User, Clock, FileText, ArrowRight, Gavel, XCircle,
} from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { serviceDisputeService, marketplaceService } from "@/services";
import { bdt, titleize } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/services/disputes")({
  head: () => ({
    meta: [
      { title: "Service Disputes & Claims — Bashundhara R/A" },
      { name: "description", content: "Missing, damaged or late items escalated through evidence, provider response and community review." },
      { property: "og:title", content: "Service Disputes — Bashundhara R/A" },
      { property: "og:description", content: "Missing, damaged or late items escalated through evidence, provider response and community review." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ServiceDisputesPage,
});

function ServiceDisputesPage() {
  const [search, setSearch] = useState("");
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reviewingDispute, setReviewingDispute] = useState<any | null>(null);
  const [localStatus, setLocalStatus] = useState<Record<string, string>>({});

  const { data: summary } = useQuery({ queryKey: ["marketplace-summary"], queryFn: () => marketplaceService.summary() });
  const { data: disputes = [], isLoading } = useQuery({ queryKey: ["service-disputes"], queryFn: () => serviceDisputeService.all() });

  const filteredDisputes = disputes.filter((d) => {
    const currentStatus = localStatus[d.id] ?? d.status;
    if (reasonFilter !== "all" && d.reason !== reasonFilter) return false;
    if (statusFilter !== "all" && currentStatus !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        d.id.toLowerCase().includes(q) ||
        d.orderId?.toLowerCase().includes(q) ||
        d.residentName?.toLowerCase().includes(q) ||
        d.providerName?.toLowerCase().includes(q) ||
        d.reason?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  function resolveDispute(disputeId: string, status: "resolved" | "rejected") {
    setLocalStatus((prev) => ({ ...prev, [disputeId]: status }));
    toast.success(`Dispute ${disputeId} marked as ${status}!`, {
      description: status === "resolved" ? "Refund issued to resident wallet." : "Dispute closed with explanation.",
    });
    setReviewingDispute(null);
  }

  const totalClaim = disputes.reduce((acc, d) => acc + (Number(d.claimAmount) || 0), 0);

  return (
    <>
      <PageHeader
        title="Service Disputes & Resolution Center"
        description="Escalated claims for service delays, damaged goods, or provider no-shows with evidence review and automated refunds."
        breadcrumb={["Services", "Disputes"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* KPI Strip */}
        <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Disputes</span>
              <span className="grid size-7 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
                <TriangleAlert className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
              {disputes.filter((d) => (localStatus[d.id] ?? d.status) === "open").length}
            </p>
            <p className="mt-1 text-[11px] text-amber-600 font-medium">Awaiting mediation review</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Under Community Review</span>
              <span className="grid size-7 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
                <Gavel className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
              {disputes.filter((d) => (localStatus[d.id] ?? d.status) === "community_review" || (localStatus[d.id] ?? d.status) === "provider_responding").length}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Provider response active</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Claims Value</span>
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <DollarSign className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{bdt(totalClaim)}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Protected by escrow</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Resolved Rate</span>
              <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">96.8%</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Avg. resolution &lt; 24h</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search dispute ID, order ID, resident, provider…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Reasons" },
              { id: "poor_service", label: "Poor Service" },
              { id: "no_show", label: "No Show" },
              { id: "incorrect_price", label: "Price Issue" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setReasonFilter(tab.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
                  reasonFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}

            <div className="h-4 w-px bg-border mx-1" />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium shrink-0"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="provider_responding">Provider Responding</option>
              <option value="community_review">Community Review</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Disputes Data Table */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : filteredDisputes.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No disputes matching your filter criteria
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Dispute ID</th>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Resident</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Dispute Reason</th>
                    <th className="px-4 py-3 text-right">Claim Amount</th>
                    <th className="px-4 py-3 text-center">Evidence Docs</th>
                    <th className="px-4 py-3">Assigned Reviewer</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredDisputes.map((d) => {
                    const status = localStatus[d.id] ?? d.status;
                    return (
                      <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-primary">{d.id}</td>
                        <td className="px-4 py-3 font-mono">
                          <Link to="/services/orders/$orderId" params={{ orderId: d.orderId }} className="text-primary hover:underline font-semibold">
                            {d.orderId}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">{d.residentName}</td>
                        <td className="px-4 py-3 text-muted-foreground font-medium flex items-center gap-1.5">
                          <Store className="size-3.5 text-primary shrink-0" />
                          {d.providerName}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge value={String(d.reason ?? "—")} />
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                          {bdt(Number(d.claimAmount ?? 0))}
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-semibold">
                          {d.evidence} file{d.evidence !== 1 ? "s" : ""}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{d.reviewer ?? "Marketplace Ops"}</td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge value={String(status ?? "—")} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant={status === "resolved" || status === "rejected" ? "outline" : "default"}
                            className="h-7 text-[11px] px-2.5 font-semibold"
                            onClick={() => setReviewingDispute({ ...d, status })}
                          >
                            Review
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Dispute Resolution Modal */}
      {reviewingDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in-50 duration-200">
            <div className="border-b border-border bg-primary/5 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600 font-bold">
                  <TriangleAlert className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Review Service Dispute</h3>
                  <p className="text-xs text-muted-foreground">{reviewingDispute.id} · {reviewingDispute.orderId}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setReviewingDispute(null)}>✕</Button>
            </div>

            <div className="space-y-4 p-6 text-xs">
              <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3.5">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">Resident</span>
                  <p className="font-bold text-foreground mt-0.5">{reviewingDispute.residentName}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">Provider</span>
                  <p className="font-bold text-foreground mt-0.5">{reviewingDispute.providerName}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">Dispute Reason</span>
                  <p className="font-semibold text-foreground mt-0.5 capitalize">{titleize(reviewingDispute.reason)}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground">Claim Amount</span>
                  <p className="font-bold text-primary mt-0.5">{bdt(Number(reviewingDispute.claimAmount ?? 0))}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-3.5 space-y-1.5">
                <span className="font-semibold text-foreground block">Evidence Attachments</span>
                <p className="text-muted-foreground text-[11px]">
                  {reviewingDispute.evidence} supporting photos and caretaker custody handover timestamps submitted.
                </p>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  className="flex-1 text-xs border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => resolveDispute(reviewingDispute.id, "rejected")}
                >
                  <XCircle className="size-3.5 mr-1" /> Reject Claim
                </Button>
                <Button
                  className="flex-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => resolveDispute(reviewingDispute.id, "resolved")}
                >
                  <CheckCircle2 className="size-3.5 mr-1" /> Approve & Refund
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
