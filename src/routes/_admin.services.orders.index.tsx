import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  PackageCheck, Timer, ShieldCheck, TriangleAlert, Search,
  ArrowRight, Store, User, MapPin, Calendar, CreditCard, Eye,
} from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { serviceOrderService, marketplaceService } from "@/services";
import { bdt } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/services/orders/")({
  head: () => ({
    meta: [
      { title: "Service Orders — Bashundhara R/A" },
      { name: "description", content: "Every marketplace service order from request through gate verification, caretaker handover and resident confirmation." },
      { property: "og:title", content: "Service Orders — Bashundhara R/A" },
      { property: "og:description", content: "Controlled service order lifecycle with chain-of-custody tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ServiceOrdersPage,
});

function ServiceOrdersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  const { data: summary } = useQuery({ queryKey: ["marketplace-summary"], queryFn: () => marketplaceService.summary() });
  const { data: orders = [], isLoading } = useQuery({ queryKey: ["service-orders"], queryFn: () => serviceOrderService.all() });

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (paymentFilter !== "all" && o.paymentStatus !== paymentFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.service.toLowerCase().includes(q) ||
        o.providerName?.toLowerCase().includes(q) ||
        o.residentName?.toLowerCase().includes(q) ||
        o.flatId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <>
      <PageHeader
        title="Service Orders & Lifecycle Handover"
        description="Controlled chain-of-custody for all service orders: Requested → Gate Verified → Caretaker Handover → Resident Confirmation."
        breadcrumb={["Services", "Service Orders"]}
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
              <span className="text-xs font-semibold uppercase tracking-wider">Live Orders</span>
              <span className="grid size-7 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
                <PackageCheck className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{orders.length}</p>
            <p className="mt-1 text-[11px] text-blue-600 font-medium">In controlled workflow</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Handover Events</span>
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <Timer className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{summary?.handoversToday ?? "237"}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Chain-of-custody stamps</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Verified Providers</span>
              <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <ShieldCheck className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">{summary?.verifiedProviders ?? "17"}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Authorized access passes</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Open Disputes</span>
              <span className="grid size-7 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
                <TriangleAlert className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{summary?.openDisputes ?? "0"}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">All handovers dispute-free</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search order ID, service, provider, resident…"
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
              { id: "all", label: "All Orders" },
              { id: "scheduled", label: "Scheduled" },
              { id: "caretaker_received", label: "Caretaker Received" },
              { id: "completed", label: "Completed" },
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

            <div className="h-4 w-px bg-border mx-1" />

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="h-8.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium shrink-0"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        {/* Orders Data Table */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No service orders found matching your filter
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Resident & Flat</th>
                    <th className="px-4 py-3">Gate Point</th>
                    <th className="px-4 py-3">Scheduled Date</th>
                    <th className="px-4 py-3 text-center">Items</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold">
                        <Link to="/services/orders/$orderId" params={{ orderId: o.id }} className="text-primary hover:underline">
                          {o.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">{o.service}</td>
                      <td className="px-4 py-3 text-muted-foreground font-medium flex items-center gap-1.5">
                        <Store className="size-3.5 text-primary shrink-0" />
                        {o.providerName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground block">{o.residentName}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">Flat {o.flatId}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">{o.gate}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono">{o.scheduledDate}</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-foreground">
                        {o.itemCount}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                        {bdt(Number(o.amount))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge value={String(o.status)} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px] px-2 font-semibold text-primary hover:underline gap-1"
                          asChild
                        >
                          <Link to="/services/orders/$orderId" params={{ orderId: o.id }}>
                            <Eye className="size-3" /> Track
                          </Link>
                        </Button>
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
