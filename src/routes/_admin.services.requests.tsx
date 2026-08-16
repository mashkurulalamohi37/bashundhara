import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles, Gavel, Tag, Calendar, User, Search, Plus, MapPin,
  CheckCircle2, ArrowRight, DollarSign, Filter, Layers,
} from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { serviceRequestService, marketplaceService } from "@/services";
import { bdt, titleize } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/services/requests")({
  head: () => ({
    meta: [
      { title: "Service Requests — Bashundhara R/A" },
      { name: "description", content: "Resident-posted service requests with pricing model, budget range and incoming provider bids." },
      { property: "og:title", content: "Service Requests — Bashundhara R/A" },
      { property: "og:description", content: "Resident-posted service requests with pricing model, budget range and incoming provider bids." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ServiceRequestsPage,
});

function ServiceRequestsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: summary } = useQuery({ queryKey: ["marketplace-summary"], queryFn: () => marketplaceService.summary() });
  const { data: requests = [], isLoading } = useQuery({ queryKey: ["service-requests"], queryFn: () => serviceRequestService.all() });

  const filteredRequests = requests.filter((r) => {
    if (modelFilter !== "all" && r.pricingModel !== modelFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.residentName?.toLowerCase().includes(q) ||
        r.flatId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <>
      <PageHeader
        title="Resident Service Requests"
        description="Community service requests with pricing models, resident budget ranges, and incoming provider bids."
        breadcrumb={["Services", "Requests"]}
        actions={
          <Button
            size="sm"
            className="gap-1.5 text-xs font-semibold"
            onClick={() => void navigate({ to: "/services/marketplace" })}
          >
            <Plus className="size-3.5" /> Book via Marketplace
          </Button>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* KPI Strip */}
        <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Open Requests</span>
              <span className="grid size-7 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
                <Sparkles className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{requests.length}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Active in bidding cycle</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Bids</span>
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <Gavel className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{summary?.activeBids ?? "117"}</p>
            <p className="mt-1 text-[11px] text-primary font-medium">Provider quotes submitted</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg. Budget Range</span>
              <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <DollarSign className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">৳ 2,400 – 4,800</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Competitive pricing</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Conversion Rate</span>
              <span className="grid size-7 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
                <CheckCircle2 className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">94.2%</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Requests converted to orders</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search request title, resident, flat ID…"
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
              { id: "all", label: "All Pricing" },
              { id: "quote_request", label: "Quote Request" },
              { id: "fixed_price", label: "Fixed Price" },
              { id: "competitive_bid", label: "Competitive Bid" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setModelFilter(tab.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
                  modelFilter === tab.id
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
              <option value="receiving_bids">Receiving Bids</option>
              <option value="converted">Converted</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Requests Data Table */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : filteredRequests.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No service requests found matching your filter
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Request ID</th>
                    <th className="px-4 py-3">Need & Service</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Resident</th>
                    <th className="px-4 py-3">Flat</th>
                    <th className="px-4 py-3">Preferred Date</th>
                    <th className="px-4 py-3 text-right">Budget Range</th>
                    <th className="px-4 py-3">Pricing Model</th>
                    <th className="px-4 py-3 text-center">Bids</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-primary">{r.id}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{r.title}</td>
                      <td className="px-4 py-3">
                        <StatusBadge value={String(r.category ?? "—")} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">{r.residentName}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{r.flatId}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono">{r.preferredDate}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                        {bdt(Number(r.budgetFrom ?? 0))}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge value={String(r.pricingModel ?? "—")} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          to="/services/bids"
                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 font-mono font-bold text-primary hover:underline text-[11px]"
                        >
                          <Gavel className="size-3" /> {r.bids} bids
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge value={String(r.status ?? "—")} />
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
