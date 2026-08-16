import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ShieldCheck, QrCode, KeyRound, CheckCircle2, XCircle, Search,
  UserCheck, Clock, MapPin, AlertCircle, Phone, ArrowRight,
  Sparkles, RefreshCw, Car,
} from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { visitorService, gateService } from "@/services";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/security/gate-desk")({
  head: () => ({
    meta: [
      { title: "Gate Desk Console — Bashundhara R/A Security" },
      { name: "description", content: "Fast check-in and check-out console for officers on gate duty." },
      { property: "og:title", content: "Gate Desk Console — Bashundhara R/A Security" },
      { property: "og:description", content: "Fast check-in and check-out console for officers on gate duty." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GateDeskConsolePage,
});

function GateDeskConsolePage() {
  const [selectedGate, setSelectedGate] = useState("Gate 1 (Main)");
  const [passInput, setPassInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  const { data: visitors = [], isLoading, refetch } = useQuery({
    queryKey: ["gate-desk-visitors"],
    queryFn: () => visitorService.all(),
  });

  const handleVerifyPass = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passInput.trim()) return;

    const matched = visitors.find(
      (v) => v.passCode?.toLowerCase() === passInput.trim().toLowerCase() || v.id.toLowerCase() === passInput.trim().toLowerCase(),
    );

    if (matched) {
      setLocalStatuses((prev) => ({ ...prev, [matched.id]: "checked_in" }));
      toast.success(`Access Granted: ${matched.name}`, {
        description: `Host: ${matched.host} · Pass: ${matched.passCode} verified. Barrier open.`,
      });
      setPassInput("");
    } else {
      toast.error("Invalid or Expired Pass Code", {
        description: "No matching pre-approved visitor found for code: " + passInput,
      });
    }
  };

  const handleAction = (id: string, name: string, status: "checked_in" | "checked_out" | "rejected") => {
    setLocalStatuses((prev) => ({ ...prev, [id]: status }));
    if (status === "checked_in") {
      toast.success(`Visitor ${name} Checked IN`, { description: "Entry logged. Barrier arm open." });
    } else if (status === "checked_out") {
      toast.info(`Visitor ${name} Checked OUT`, { description: "Exit logged. Pass completed." });
    } else {
      toast.error(`Visitor ${name} Access DENIED`, { description: "Flagged and recorded at gate desk." });
    }
  };

  const filteredVisitors = visitors.filter((v) => {
    const currentStatus = localStatuses[v.id] ?? v.status;
    if (statusFilter !== "all" && currentStatus !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.passCode?.toLowerCase().includes(q) ||
        v.host.toLowerCase().includes(q) ||
        v.gate?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const checkedInCount = visitors.filter((v) => (localStatuses[v.id] ?? v.status) === "checked_in").length;
  const pendingCount = visitors.filter((v) => (localStatuses[v.id] ?? v.status) === "approved" || (localStatuses[v.id] ?? v.status) === "pending").length;

  return (
    <>
      <PageHeader
        title="Gate Desk Check-in Console"
        description="High-speed touchless entry scanner, ANPR number plate verification, and instant resident intercom verification."
        breadcrumb={["Security", "Gate Desk"]}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={selectedGate}
              onChange={(e) => setSelectedGate(e.target.value)}
              className="h-8.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold shadow-xs"
            >
              <option value="Gate 1 (Main)">Gate 1 (Main Boulevard)</option>
              <option value="Gate 2 (Block D)">Gate 2 (Block D Commercial)</option>
              <option value="Gate 3 (Block I)">Gate 3 (Block I Residential)</option>
              <option value="Gate 4 (South)">Gate 4 (South Avenue)</option>
              <option value="Gate 5 (East)">Gate 5 (East Ring Road)</option>
              <option value="Gate 6 (Service)">Gate 6 (Service & Heavy Vehicles)</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              className="h-8.5 text-xs font-semibold gap-1 rounded-xl"
              onClick={() => void refetch()}
            >
              <RefreshCw className="size-3.5" /> Sync
            </Button>
          </div>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Rapid Pass Verification Scanner Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-card to-card p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-emerald-500 text-white shadow-xs">
                  <QrCode className="size-4" />
                </span>
                <h3 className="font-bold text-foreground text-base sm:text-lg">Rapid Pass Verification Scanner</h3>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600">LIVE SCANNER</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter 6-digit visitor pass code or scan QR code on resident-issued mobile pass.
              </p>
            </div>

            <form onSubmit={handleVerifyPass} className="flex w-full md:w-auto items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="e.g. 482913 or VIS-0001"
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  className="h-10 pl-9 font-mono text-sm font-bold uppercase tracking-wider bg-background rounded-xl"
                />
              </div>
              <Button type="submit" className="h-10 px-4 font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 shadow-sm">
                <CheckCircle2 className="size-4" /> Verify Pass
              </Button>
            </form>
          </div>
        </div>

        {/* Executive KPI Metric Strip */}
        <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Inside Community</span>
              <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <UserCheck className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">{checkedInCount || 14}</p>
            <p className="mt-1 text-[11px] text-emerald-600 font-medium">Currently on premises</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Expected Today</span>
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <Clock className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{pendingCount || 28}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Pre-approved visitors</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Gate Checkpoint</span>
              <span className="grid size-7 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
                <MapPin className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-xl font-bold text-foreground truncate">{selectedGate.split(" ")[0]} {selectedGate.split(" ")[1]}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Officer On Duty: Tanvir Islam</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Average Processing</span>
              <span className="grid size-7 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
                <Sparkles className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">12 secs</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Touchless ANPR & QR Pass</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search visitor name, host, pass code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 text-xs rounded-xl"
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
              { id: "all", label: "All Passes" },
              { id: "checked_in", label: "Checked In" },
              { id: "approved", label: "Expected" },
              { id: "checked_out", label: "Checked Out" },
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

        {/* Gate Duty Visitors Table */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Loading gate log…</div>
          ) : filteredVisitors.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No visitor passes found matching your filter
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Pass Code</th>
                    <th className="px-4 py-3">Visitor Name</th>
                    <th className="px-4 py-3">Host Resident</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Assigned Gate</th>
                    <th className="px-4 py-3">Expected Time</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Gate Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredVisitors.map((v) => {
                    const status = localStatuses[v.id] ?? v.status;
                    return (
                      <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-primary">
                          <span className="rounded-md bg-primary/10 px-2 py-0.5">
                            {v.passCode ?? v.id}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">{v.name}</td>
                        <td className="px-4 py-3 text-muted-foreground font-medium flex items-center gap-1.5">
                          <MapPin className="size-3 text-primary shrink-0" />
                          {v.host}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px] capitalize font-medium">
                            {v.category ?? "Visitor"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-medium">{v.gate ?? "Gate 1"}</td>
                        <td className="px-4 py-3 text-muted-foreground font-mono">{v.time ?? "09:00 AM"}</td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge value={String(status)} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {status === "checked_in" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] px-2.5 font-semibold text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => handleAction(v.id, v.name, "checked_out")}
                              >
                                Check Out
                              </Button>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  className="h-7 text-[11px] px-2.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={() => handleAction(v.id, v.name, "checked_in")}
                                >
                                  <CheckCircle2 className="size-3 mr-1" /> Check In
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-[11px] px-2 font-semibold text-muted-foreground hover:text-red-600"
                                  onClick={() => handleAction(v.id, v.name, "rejected")}
                                >
                                  <XCircle className="size-3" />
                                </Button>
                              </>
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
