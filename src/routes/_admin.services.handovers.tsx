import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Timer, ArrowRightLeft, ShieldCheck, QrCode, KeyRound, Camera,
  FileSignature, Search, CheckCircle2, User, MapPin, Filter,
  Store, PackageCheck,
} from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { serviceHandoverService, marketplaceService } from "@/services";
import { titleize } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/services/handovers")({
  head: () => ({
    meta: [
      { title: "Handover Tracking — Bashundhara R/A" },
      { name: "description", content: "Chain-of-custody log for every physical handover between resident, caretaker, security and provider." },
      { property: "og:title", content: "Handover Tracking — Bashundhara R/A" },
      { property: "og:description", content: "Chain-of-custody log for every physical handover between resident, caretaker, security and provider." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HandoverTrackingPage,
});

function HandoverTrackingPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { data: summary } = useQuery({ queryKey: ["marketplace-summary"], queryFn: () => marketplaceService.summary() });
  const { data: handovers = [], isLoading } = useQuery({ queryKey: ["service-handovers"], queryFn: () => serviceHandoverService.all() });

  const filteredHandovers = handovers.filter((h) => {
    if (typeFilter !== "all" && h.type !== typeFilter) return false;
    if (roleFilter !== "all" && h.personRole !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        h.id.toLowerCase().includes(q) ||
        h.orderId?.toLowerCase().includes(q) ||
        h.personName?.toLowerCase().includes(q) ||
        h.location?.toLowerCase().includes(q) ||
        h.type?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <>
      <PageHeader
        title="Physical Handover & Custody Tracking"
        description="Immutable chain-of-custody log recording every physical handover between residents, caretakers, gate security, and service providers."
        breadcrumb={["Services", "Handover Tracking"]}
        actions={
          <Button
            size="sm"
            className="gap-1.5 text-xs font-semibold"
            onClick={() => void navigate({ to: "/caretaker/console" })}
          >
            <ArrowRightLeft className="size-3.5" /> Caretaker Console
          </Button>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* KPI Strip */}
        <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Handover Events</span>
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <Timer className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{handovers.length}</p>
            <p className="mt-1 text-[11px] text-primary font-medium">Logged today across community</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Gate Checkpoints</span>
              <span className="grid size-7 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
                <MapPin className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">6 Gates</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Gates 1 through 6 monitored</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Custody Integrity</span>
              <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <ShieldCheck className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">100% Verified</p>
            <p className="mt-1 text-[11px] text-emerald-600 font-medium">0 lost or disputed parcels</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg. Transfer Speed</span>
              <span className="grid size-7 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
                <CheckCircle2 className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">3.2 mins</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Fast touchless handoff</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search event ID, order, person, or gate location…"
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
              { id: "all", label: "All Handover Types" },
              { id: "gate_verification", label: "Gate Verification" },
              { id: "resident_to_caretaker", label: "Resident → Caretaker" },
              { id: "caretaker_to_provider", label: "Caretaker → Provider" },
              { id: "provider_to_caretaker", label: "Provider → Caretaker" },
              { id: "caretaker_to_resident", label: "Caretaker → Resident" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTypeFilter(tab.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
                  typeFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}

            <div className="h-4 w-px bg-border mx-1" />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-8.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium shrink-0"
            >
              <option value="all">All Roles</option>
              <option value="resident">Resident</option>
              <option value="caretaker">Caretaker</option>
              <option value="service_provider">Service Provider</option>
              <option value="security_officer">Security Officer</option>
            </select>
          </div>
        </div>

        {/* Handover Data Table */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : filteredHandovers.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No handover records found matching your filter
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Event ID</th>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3 text-center">Step</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Handover Type</th>
                    <th className="px-4 py-3">Person In Custody</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3 text-center">Verification Method</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredHandovers.map((h) => (
                    <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-primary">{h.id}</td>
                      <td className="px-4 py-3 font-mono">
                        <Link to="/services/orders/$orderId" params={{ orderId: h.orderId }} className="text-primary hover:underline font-semibold">
                          {h.orderId}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-center font-bold font-mono">
                        <span className="grid size-6 mx-auto place-items-center rounded-full bg-muted text-foreground text-xs">
                          {h.sequence}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono">{h.timestamp}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px] font-semibold capitalize">
                          {h.type?.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-1.5">
                        <User className="size-3.5 text-primary shrink-0" />
                        {h.personName}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge value={String(h.personRole ?? "—")} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">{h.location}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-bold text-emerald-600 dark:text-emerald-400 text-[10px] capitalize">
                          {h.confirmation === "qr" ? <QrCode className="size-3" /> :
                           h.confirmation === "otp" ? <KeyRound className="size-3" /> :
                           h.confirmation === "photo" ? <Camera className="size-3" /> :
                           <FileSignature className="size-3" />}
                          {h.confirmation ?? "Verified"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge value={String(h.status ?? "—")} />
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
