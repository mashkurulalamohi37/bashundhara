import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck, Users, Star, Timer, Search, Store, Building2,
  ShieldCheck, Phone, ArrowRight, Wrench, Shield, CheckCircle2,
} from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { serviceProviderService, marketplaceService } from "@/services";
import { bdt, titleize } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/services/providers/")({
  head: () => ({
    meta: [
      { title: "Service Providers — Bashundhara R/A" },
      { name: "description", content: "Verified marketplace providers with trust score, response time, complaint rate and verification stage." },
      { property: "og:title", content: "Service Providers — Bashundhara R/A" },
      { property: "og:description", content: "Verified marketplace providers with trust score, response time, complaint rate and verification stage." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ServiceProvidersPage,
});

function ServiceProvidersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const { data: summary } = useQuery({ queryKey: ["marketplace-summary"], queryFn: () => marketplaceService.summary() });
  const { data: providers = [], isLoading } = useQuery({ queryKey: ["service-providers"], queryFn: () => serviceProviderService.all() });

  const categories = ["all", "laundry", "cleaning", "ac_servicing", "plumbing", "electrical", "car_wash", "pest_control"];

  const filteredProviders = providers.filter((p) => {
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.business.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.contactName?.toLowerCase().includes(q) ||
        p.serviceArea?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <>
      <PageHeader
        title="Community Service Providers"
        description="Verified on-demand maintenance, housekeeping, and technical service providers with background checks."
        breadcrumb={["Services", "Providers"]}
        actions={
          <Button
            size="sm"
            className="gap-1.5 text-xs font-semibold"
            onClick={() => void navigate({ to: "/services/marketplace" })}
          >
            <Store className="size-3.5" /> Open Marketplace
          </Button>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* KPI Strip */}
        <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Providers</span>
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <Store className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{providers.length}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Across all service verticals</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Verified Badges</span>
              <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <BadgeCheck className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">
              {providers.filter((p) => p.verification === "verified").length} / {providers.length}
            </p>
            <p className="mt-1 text-[11px] text-emerald-600 font-medium">Background check cleared</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg. Rating</span>
              <span className="grid size-7 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
                <Star className="size-3.5 fill-current" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">★ 4.62</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Over 8,400 resident reviews</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg. Response Time</span>
              <span className="grid size-7 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
                <Timer className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">18 mins</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Fast dispatch protocol</p>
          </div>
        </div>

        {/* Filter and View Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search provider name, contact, category…"
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
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0 capitalize",
                  categoryFilter === cat
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {cat === "all" ? "All Categories" : cat.replace(/_/g, " ")}
              </button>
            ))}

            <div className="h-4 w-px bg-border mx-1" />

            <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                  viewMode === "cards" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                Grid Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                  viewMode === "table" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                Data Table
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 1: Visual Interactive Provider Cards */}
        {viewMode === "cards" && (
          isLoading ? (
            <TableSkeleton rows={6} cols={3} />
          ) : filteredProviders.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground rounded-2xl border border-border bg-card">
              No service providers found matching your filter
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProviders.map((p) => (
                <article
                  key={p.id}
                  className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-base font-bold text-foreground">{p.business}</h3>
                          <Badge variant="outline" className="text-[10px] font-mono">{p.id}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{titleize(p.category)} · {p.serviceArea}</p>
                      </div>
                      <StatusBadge value={p.verification} />
                    </div>

                    <p className="mt-2.5 text-xs text-muted-foreground line-clamp-2">{p.services}</p>

                    <dl className="mt-3.5 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-2">
                        <dt className="text-[10px] font-bold uppercase text-muted-foreground">Rating</dt>
                        <dd className="tabular text-sm font-bold text-foreground mt-0.5">★ {p.rating}</dd>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-2">
                        <dt className="text-[10px] font-bold uppercase text-muted-foreground">Jobs</dt>
                        <dd className="tabular text-sm font-bold text-foreground mt-0.5">{p.completedJobs}</dd>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-2">
                        <dt className="text-[10px] font-bold uppercase text-muted-foreground">Response</dt>
                        <dd className="tabular text-sm font-bold text-foreground mt-0.5">{p.responseMins}m</dd>
                      </div>
                    </dl>

                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Trust Score: <strong className="text-primary">{p.trustScore}%</strong></span>
                      <span>From {bdt(p.priceFrom)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-border/60 flex items-center gap-2">
                    <Button
                      size="sm"
                      className="flex-1 font-semibold text-xs h-8.5"
                      onClick={() => void navigate({ to: "/services/marketplace" })}
                    >
                      Request Service
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8.5"
                      asChild
                    >
                      <Link to="/services/providers/$providerId" params={{ providerId: p.id }}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )
        )}

        {/* VIEW 2: Data Table */}
        {viewMode === "table" && (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Provider ID</th>
                    <th className="px-4 py-3">Business Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Contact Person</th>
                    <th className="px-4 py-3 text-right">Rating</th>
                    <th className="px-4 py-3 text-right">Jobs Completed</th>
                    <th className="px-4 py-3 text-right">Response</th>
                    <th className="px-4 py-3 text-right">Trust Score</th>
                    <th className="px-4 py-3 text-center">Verification</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredProviders.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-primary">{p.id}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        <Link to="/services/providers/$providerId" params={{ providerId: p.id }} className="hover:underline">
                          {p.business}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge value={String(p.category ?? "—")} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">{p.contactName}</td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">★ {p.rating}</td>
                      <td className="px-4 py-3 text-right font-mono">{p.completedJobs}</td>
                      <td className="px-4 py-3 text-right font-mono">{p.responseMins}m</td>
                      <td className="px-4 py-3 text-right font-bold text-primary">{p.trustScore}%</td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge value={String(p.verification ?? "—")} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge value={String(p.status ?? "—")} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
