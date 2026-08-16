import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Star, MessageSquare, ThumbsUp, ShieldCheck, Search, Filter,
  Store, User, Flag, Eye, EyeOff, CheckCircle2,
} from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { serviceReviewService, marketplaceService } from "@/services";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/services/reviews")({
  head: () => ({
    meta: [
      { title: "Service Reviews & Feedback — Bashundhara R/A" },
      { name: "description", content: "Resident ratings across quality, behaviour, timeliness, price and carefulness feeding the trust score." },
      { property: "og:title", content: "Service Reviews — Bashundhara R/A" },
      { property: "og:description", content: "Resident ratings across quality, behaviour, timeliness, price and carefulness feeding the trust score." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ServiceReviewsPage,
});

function ServiceReviewsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [localStatus, setLocalStatus] = useState<Record<string, string>>({});

  const { data: summary } = useQuery({ queryKey: ["marketplace-summary"], queryFn: () => marketplaceService.summary() });
  const { data: reviews = [], isLoading } = useQuery({ queryKey: ["service-reviews"], queryFn: () => serviceReviewService.all() });

  const filteredReviews = reviews.filter((r) => {
    const currentStatus = localStatus[r.id] ?? r.status;
    if (statusFilter !== "all" && currentStatus !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.orderId?.toLowerCase().includes(q) ||
        r.providerName?.toLowerCase().includes(q) ||
        r.residentName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  function handleModerate(reviewId: string, newStatus: string) {
    setLocalStatus((prev) => ({ ...prev, [reviewId]: newStatus }));
    toast.success(`Review ${reviewId} marked as ${newStatus}!`);
  }

  return (
    <>
      <PageHeader
        title="Community Service Reviews & Trust Scores"
        description="Resident feedback ratings evaluating service quality, promptness, and caretaker handovers across Bashundhara R/A."
        breadcrumb={["Services", "Reviews"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* KPI Strip */}
        <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Feedback</span>
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{reviews.length}</p>
            <p className="mt-1 text-[11px] text-primary font-medium">100% verified order reviews</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Overall Rating</span>
              <span className="grid size-7 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
                <Star className="size-3.5 fill-current" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">★ 4.62 / 5.0</p>
            <p className="mt-1 text-[11px] text-muted-foreground">High community satisfaction</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Service Quality</span>
              <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <ThumbsUp className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">4.8 / 5.0</p>
            <p className="mt-1 text-[11px] text-emerald-600 font-medium">Workmanship & cleanliness</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Trust Score Impact</span>
              <span className="grid size-7 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
                <ShieldCheck className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">+96.4%</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Feeds algorithm dynamically</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search provider, resident, review ID…"
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
              { id: "all", label: "All Reviews" },
              { id: "published", label: "Published" },
              { id: "flagged", label: "Flagged" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
                  statusFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Data Table */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : filteredReviews.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No reviews found matching your search
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Review ID</th>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Resident</th>
                    <th className="px-4 py-3 text-center">Quality</th>
                    <th className="px-4 py-3 text-center">Timeliness</th>
                    <th className="px-4 py-3 text-center">Care</th>
                    <th className="px-4 py-3 text-center">Overall</th>
                    <th className="px-4 py-3">Review Date</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredReviews.map((r) => {
                    const status = localStatus[r.id] ?? r.status;
                    return (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-primary">{r.id}</td>
                        <td className="px-4 py-3 font-mono">
                          <Link to="/services/orders/$orderId" params={{ orderId: r.orderId }} className="text-primary hover:underline font-semibold">
                            {r.orderId}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-1.5">
                          <Store className="size-3.5 text-primary shrink-0" />
                          {r.providerName}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-medium">{r.residentName}</td>
                        <td className="px-4 py-3 text-center font-bold">★ {r.quality}</td>
                        <td className="px-4 py-3 text-center font-bold">★ {r.timeliness}</td>
                        <td className="px-4 py-3 text-center font-bold">★ {r.carefulness}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 font-bold text-amber-600 dark:text-amber-400">
                            ★ {r.overall}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono">{r.date}</td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge value={String(status ?? "—")} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {status === "flagged" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] px-2 font-semibold text-emerald-600"
                                onClick={() => handleModerate(r.id, "published")}
                              >
                                <CheckCircle2 className="size-3 mr-1" /> Approve
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-[11px] px-2 font-semibold text-muted-foreground hover:text-amber-600"
                                onClick={() => handleModerate(r.id, "flagged")}
                              >
                                <Flag className="size-3 mr-1" /> Flag
                              </Button>
                            )}
                          </div>
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
    </>
  );
}
