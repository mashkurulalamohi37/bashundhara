import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  MapPin,
  Users,
  Home,
  Shield,
  Search,
  ArrowRight,
  TrendingUp,
  Map,
  Sparkles,
  TreePine,
  Car,
  Layers,
  ChevronRight,
  Building,
  CheckCircle2,
  Store,
} from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/community/")({
  head: () => ({
    meta: [
      { title: "Community Overview — Bashundhara R/A" },
      { name: "description", content: "Executive overview of blocks, roads, properties, demographics, and infrastructure across Bashundhara R/A." },
      { property: "og:title", content: "Community Overview — Bashundhara R/A" },
      { property: "og:description", content: "Executive overview of blocks, roads, properties, demographics, and infrastructure across Bashundhara R/A." },
    ],
  }),
  component: CommunityOverviewPage,
});

interface BlockData {
  id: string;
  name: string;
  roads: number;
  properties: number;
  residents: number;
  occupancy: number;
  sector: "North" | "Central" | "South" | "Riverview";
  gate: string;
  parks: number;
  mosques: number;
}

const BLOCKS: BlockData[] = [
  { id: "BLK-A", name: "Block A", roads: 13, properties: 285, residents: 1418, occupancy: 94, sector: "North", gate: "Gate 1 (Main)", parks: 2, mosques: 1 },
  { id: "BLK-B", name: "Block B", roads: 14, properties: 439, residents: 1912, occupancy: 91, sector: "North", gate: "Gate 1", parks: 3, mosques: 1 },
  { id: "BLK-C", name: "Block C", roads: 21, properties: 525, residents: 1885, occupancy: 95, sector: "North", gate: "Gate 2", parks: 2, mosques: 2 },
  { id: "BLK-D", name: "Block D", roads: 21, properties: 494, residents: 1754, occupancy: 89, sector: "Central", gate: "Gate 2", parks: 4, mosques: 1 },
  { id: "BLK-E", name: "Block E", roads: 14, properties: 342, residents: 1713, occupancy: 93, sector: "Central", gate: "Gate 3", parks: 2, mosques: 1 },
  { id: "BLK-F", name: "Block F", roads: 17, properties: 416, residents: 1621, occupancy: 88, sector: "Central", gate: "Gate 3", parks: 3, mosques: 1 },
  { id: "BLK-G", name: "Block G", roads: 21, properties: 433, residents: 1719, occupancy: 90, sector: "Central", gate: "Gate 4", parks: 2, mosques: 2 },
  { id: "BLK-H", name: "Block H", roads: 15, properties: 454, residents: 1463, occupancy: 87, sector: "South", gate: "Gate 4", parks: 2, mosques: 1 },
  { id: "BLK-I", name: "Block I", roads: 15, properties: 447, residents: 1252, occupancy: 92, sector: "South", gate: "Gate 5", parks: 3, mosques: 1 },
  { id: "BLK-J", name: "Block J", roads: 12, properties: 320, residents: 1140, occupancy: 86, sector: "South", gate: "Gate 5", parks: 1, mosques: 1 },
  { id: "BLK-K", name: "Block K", roads: 11, properties: 280, residents: 980, occupancy: 82, sector: "Riverview", gate: "Gate 6 (River)", parks: 2, mosques: 1 },
  { id: "BLK-L", name: "Block L", roads: 9, properties: 210, residents: 820, occupancy: 79, sector: "Riverview", gate: "Gate 6", parks: 1, mosques: 1 },
  { id: "BLK-M", name: "Block M", roads: 8, properties: 185, residents: 743, occupancy: 75, sector: "Riverview", gate: "Gate 6", parks: 1, mosques: 0 },
];

function CommunityOverviewPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const totalResidents = BLOCKS.reduce((acc, b) => acc + b.residents, 0);
  const totalProperties = BLOCKS.reduce((acc, b) => acc + b.properties, 0);
  const totalRoads = BLOCKS.reduce((acc, b) => acc + b.roads, 0);
  const avgOccupancy = Math.round(BLOCKS.reduce((acc, b) => acc + b.occupancy, 0) / BLOCKS.length);

  const filteredBlocks = BLOCKS.filter((b) => {
    if (sectorFilter !== "all" && b.sector !== sectorFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.name.toLowerCase().includes(q) || b.gate.toLowerCase().includes(q) || b.sector.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <>
      <PageHeader
        title="Community Overview"
        description="Master distribution of blocks, roads, properties, security gates, and resident population across Bashundhara R/A."
        breadcrumb={["Community", "Overview"]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => void navigate({ to: "/map" })}
            >
              <Map className="size-3.5" /> Interactive Map
            </Button>
            <Button
              size="sm"
              className="gap-1.5 text-xs font-semibold"
              onClick={() => void navigate({ to: "/community/feed" })}
            >
              <Sparkles className="size-3.5" /> Community Feed
            </Button>
          </div>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* KPI Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Residents</span>
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <Users className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{totalResidents.toLocaleString()}</p>
            <p className="mt-1 text-[11px] text-emerald-600 font-medium">↑ +4.2% annual growth</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Properties</span>
              <span className="grid size-7 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
                <Building2 className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{totalProperties.toLocaleString()}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Across 13 designated blocks</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Road Network</span>
              <span className="grid size-7 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
                <Car className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{totalRoads} Roads</p>
            <p className="mt-1 text-[11px] text-muted-foreground">6 Security Gates monitored</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg. Occupancy</span>
              <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <TrendingUp className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">{avgOccupancy}%</p>
            <p className="mt-1 text-[11px] text-muted-foreground">High residential demand</p>
          </div>
        </div>

        {/* Filter and View Switcher Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search Block, Sector, Gate…"
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
          </div>

          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            {["all", "North", "Central", "South", "Riverview"].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setSectorFilter(sec)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0 capitalize",
                  sectorFilter === sec
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {sec === "all" ? "All Sectors" : `${sec} Sector`}
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

        {/* VIEW 1: Visual Interactive Block Cards */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBlocks.map((blk) => (
              <div
                key={blk.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary font-bold text-base group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
                        {blk.name.replace("Block ", "")}
                      </span>
                      <div>
                        <h2 className="text-base font-bold text-foreground leading-none">{blk.name}</h2>
                        <span className="mt-1 inline-block text-[11px] font-medium text-muted-foreground">
                          {blk.sector} Sector · {blk.gate}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                      {blk.occupancy}% Occupied
                    </Badge>
                  </div>

                  {/* Occupancy Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Occupancy Density</span>
                      <span className="font-semibold">{blk.occupancy}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          blk.occupancy > 90 ? "bg-emerald-500" : blk.occupancy > 80 ? "bg-primary" : "bg-amber-500"
                        )}
                        style={{ width: `${blk.occupancy}%` }}
                      />
                    </div>
                  </div>

                  {/* Block Vital Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-muted/20 border border-border/60 p-2.5 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground">Roads</span>
                      <p className="font-bold text-foreground mt-0.5">{blk.roads}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">Properties</span>
                      <p className="font-bold text-foreground mt-0.5">{blk.properties}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">Residents</span>
                      <p className="font-bold text-primary mt-0.5">{blk.residents}</p>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <TreePine className="size-3 text-emerald-600" /> {blk.parks} Parks
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Building className="size-3 text-primary" /> {blk.mosques} Mosques
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                  <Link
                    to="/community/blocks"
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View Properties <ArrowRight className="size-3" />
                  </Link>
                  <Link
                    to="/map"
                    className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  >
                    <MapPin className="size-3" /> Map
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 2: Data Table */}
        {viewMode === "table" && (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Block</th>
                    <th className="px-4 py-3">Sector</th>
                    <th className="px-4 py-3">Assigned Gate</th>
                    <th className="px-4 py-3 text-right">Roads</th>
                    <th className="px-4 py-3 text-right">Properties</th>
                    <th className="px-4 py-3 text-right">Residents</th>
                    <th className="px-4 py-3 text-right">Occupancy</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredBlocks.map((blk) => (
                    <tr key={blk.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                        <span className="grid size-6 place-items-center rounded bg-primary/10 text-primary font-bold text-xs">
                          {blk.name.replace("Block ", "")}
                        </span>
                        {blk.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{blk.sector} Sector</td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">{blk.gate}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium">{blk.roads}</td>
                      <td className="px-4 py-3 text-right font-mono font-medium">{blk.properties}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-primary">{blk.residents.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{blk.occupancy}%</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge value="active" />
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
