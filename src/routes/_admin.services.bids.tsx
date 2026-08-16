import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Gavel, CheckCircle2, Star, Clock, Search, ArrowRight,
  ShieldCheck, DollarSign, Sparkles, Filter, Store,
} from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { serviceBidService, marketplaceService } from "@/services";
import { bdt } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/services/bids")({
  head: () => ({
    meta: [
      { title: "Bids & Quotes — Bashundhara R/A" },
      { name: "description", content: "Competing provider quotes with price, availability and estimated completion for each open request." },
      { property: "og:title", content: "Bids & Quotes — Bashundhara R/A" },
      { property: "og:description", content: "Competing provider quotes with price, availability and estimated completion for each open request." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ServiceBidsPage,
});

function ServiceBidsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: summary } = useQuery({ queryKey: ["marketplace-summary"], queryFn: () => marketplaceService.summary() });
  const { data: bids = [], isLoading } = useQuery({ queryKey: ["service-bids"], queryFn: () => serviceBidService.all() });

  const filteredBids = bids.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.providerName.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.requestId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <>
      <PageHeader
        title="Competitive Bids & Provider Quotes"
        description="Review vendor quotations, verify ratings, compare estimated completion times, and select bids."
        breadcrumb={["Services", "Bids & Quotes"]}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-semibold"
            onClick={() => void navigate({ to: "/services/requests" })}
          >
            <Sparkles className="size-3.5" /> View Open Requests
          </Button>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* KPI Strip */}
        <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Quotes</span>
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <Gavel className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{bids.length}</p>
            <p className="mt-1 text-[11px] text-primary font-medium">Active in marketplace</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Selected Bids</span>
              <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">
              {bids.filter((b) => b.status === "selected").length}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Converted to service orders</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg. Quotation</span>
              <span className="grid size-7 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
                <DollarSign className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">৳ 4,180</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Transparent pricing</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Fastest Turnaround</span>
              <span className="grid size-7 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
                <Clock className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">2 hours</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Same-day express available</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search provider, quote ID, request ID…"
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
              { id: "all", label: "All Bids" },
              { id: "submitted", label: "Submitted" },
              { id: "selected", label: "Selected" },
              { id: "rejected", label: "Rejected" },
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

        {/* Bids Data Table */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : filteredBids.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No bids or quotes matching your search
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Bid ID</th>
                    <th className="px-4 py-3">Linked Request</th>
                    <th className="px-4 py-3">Service Provider</th>
                    <th className="px-4 py-3 text-right">Price Quote</th>
                    <th className="px-4 py-3">Availability</th>
                    <th className="px-4 py-3">Turnaround</th>
                    <th className="px-4 py-3 text-center">Rating</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredBids.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-primary">{b.id}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{b.requestId}</td>
                      <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-1.5">
                        <Store className="size-3.5 text-primary shrink-0" />
                        {b.providerName}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                        {bdt(Number(b.price ?? 0))}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">{b.availability}</td>
                      <td className="px-4 py-3 text-muted-foreground">{b.estimatedCompletion}</td>
                      <td className="px-4 py-3 text-center font-bold text-foreground">
                        ★ {b.rating}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono">{b.submittedOn}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge value={String(b.status ?? "—")} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {b.status === "submitted" ? (
                          <Button
                            size="sm"
                            className="h-7 text-[11px] px-2.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => {
                              toast.success(`Bid ${b.id} selected! Service order created.`);
                              void navigate({ to: "/services/orders" });
                            }}
                          >
                            Select Bid
                          </Button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
