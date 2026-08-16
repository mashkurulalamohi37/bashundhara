import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Camera, Eye, Video, ShieldCheck, MapPin, Search, RefreshCw,
  Maximize2, Radio, CheckCircle2, AlertTriangle, Play, Pause,
} from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cameraService } from "@/services";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/security/cctv")({
  head: () => ({
    meta: [
      { title: "CCTV Video Surveillance — Bashundhara R/A Security" },
      { name: "description", content: "Live multi-camera perimeter feeds, ANPR detection, and PTZ controls." },
      { property: "og:title", content: "CCTV Video Surveillance — Bashundhara R/A Security" },
      { property: "og:description", content: "Live multi-camera perimeter feeds, ANPR detection, and PTZ controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CCTVNetworkPage,
});

const featuredFeeds = [
  { id: "CAM-01", name: "Gate 1 Inbound Lane (ANPR)", zone: "Perimeter Gate", location: "Main Boulevard Entrance", status: "online", bitrate: "4.2 Mbps", fps: "30 FPS", ai: "ANPR Active: DHA-METRO-GA-21-4567" },
  { id: "CAM-02", name: "Gate 3 Commercial Cross", zone: "Commercial Access", location: "Block I Intersection", status: "online", bitrate: "3.8 Mbps", fps: "30 FPS", ai: "Vehicle Count: 14/min" },
  { id: "CAM-03", name: "Central Park & Walkway", zone: "Public Amenities", location: "Block C Recreation", status: "online", bitrate: "3.2 Mbps", fps: "25 FPS", ai: "Normal Movement Detected" },
  { id: "CAM-04", name: "Basement B1 Parking Sector", zone: "Parking & Access", location: "Building 004 Basement", status: "online", bitrate: "4.0 Mbps", fps: "30 FPS", ai: "Occupancy: 82%" },
];

function CCTVNetworkPage() {
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null);

  const { data: cameras = [], isLoading, refetch } = useQuery({ queryKey: ["cameras"], queryFn: () => cameraService.all() });

  const filteredCameras = cameras.filter((c) => {
    if (zoneFilter !== "all" && c.zone !== zoneFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.block?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <>
      <PageHeader
        title="CCTV Video Surveillance & AI Vision Network"
        description="Live perimeter surveillance matrix, automated number plate recognition (ANPR), and optical health telemetry."
        breadcrumb={["Security", "CCTV"]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold gap-1.5 rounded-xl"
              onClick={() => toast.success("Snapshot Captured", { description: "High-resolution frame saved to incident archives." })}
            >
              <Camera className="size-3.5" /> Capture Frame
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold gap-1.5 rounded-xl"
              onClick={() => void refetch()}
            >
              <RefreshCw className="size-3.5" /> Sync Feeds
            </Button>
          </div>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Live Multi-Camera Surveillance Wall */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Video className="size-4 text-emerald-600 animate-pulse" /> Live Surveillance Multi-Feed
            </h3>
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500 animate-ping" /> REC · 1080p 60Hz
            </span>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            {featuredFeeds.map((feed) => (
              <div
                key={feed.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-black/90 p-3 shadow-md text-white transition-all hover:border-emerald-500/50"
              >
                {/* Simulated Video Canvas */}
                <div className="relative aspect-video w-full rounded-xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-black overflow-hidden flex flex-col justify-between p-2.5 border border-white/10">
                  {/* Top Bar inside Feed */}
                  <div className="flex items-center justify-between z-10">
                    <span className="rounded-md bg-black/60 backdrop-blur-xs px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                      {feed.id} · {feed.fps}
                    </span>
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase animate-pulse">
                      LIVE
                    </span>
                  </div>

                  {/* AI Detection Overlay */}
                  <div className="z-10 rounded-lg bg-black/70 backdrop-blur-xs p-1.5 border border-white/10 text-[10px] font-mono">
                    <span className="text-emerald-400 block font-bold truncate">{feed.ai}</span>
                    <span className="text-neutral-400 text-[9px]">{feed.location}</span>
                  </div>

                  {/* Scanline Grid Background */}
                  <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%]" />
                </div>

                {/* Bottom Meta */}
                <div className="mt-2.5 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-white text-xs truncate">{feed.name}</h4>
                    <p className="text-[10px] text-neutral-400">{feed.zone}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] px-2 text-neutral-300 hover:text-white"
                    onClick={() => {
                      setSelectedFeed(feed.id);
                      toast.info(`Fullscreen monitor opened for ${feed.name}`);
                    }}
                  >
                    <Maximize2 className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Executive KPI Metric Strip */}
        <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Optical Nodes</span>
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <Camera className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{cameras.length || 64}</p>
            <p className="mt-1 text-[11px] text-primary font-medium">Across all 12 blocks</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Online</span>
              <span className="grid size-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">
              {cameras.filter((c) => c.status === "online").length || 61}
            </p>
            <p className="mt-1 text-[11px] text-emerald-600 font-medium">95.3% uptime health</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">ANPR Gate Nodes</span>
              <span className="grid size-7 place-items-center rounded-lg bg-blue-500/10 text-blue-600">
                <Radio className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">12 Nodes</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Inbound & outbound lanes</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Storage Retention</span>
              <span className="grid size-7 place-items-center rounded-lg bg-amber-500/10 text-amber-600">
                <Video className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">60 Days</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Encrypted cloud + NVR raid</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search camera ID, name, location, block…"
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
              { id: "all", label: "All Zones" },
              { id: "gate", label: "Gates" },
              { id: "road", label: "Roads" },
              { id: "parking", label: "Parking" },
              { id: "building", label: "Buildings" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setZoneFilter(tab.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shrink-0",
                  zoneFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Camera Inventory Table */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Loading camera nodes…</div>
          ) : filteredCameras.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No camera nodes found matching your filter
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Node ID</th>
                    <th className="px-4 py-3">Camera Name</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Block</th>
                    <th className="px-4 py-3">Zone Type</th>
                    <th className="px-4 py-3">Last Active Ping</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Feed Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredCameras.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-primary">{c.id}</td>
                      <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-1.5">
                        <Camera className="size-3.5 text-primary shrink-0" />
                        {c.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">{c.location}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{c.block ?? "Block A"}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[10px] capitalize font-medium">
                          {c.zone}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono">{c.lastActive ?? "Just now"}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge value={String(c.status)} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px] px-2.5 font-semibold text-primary hover:underline gap-1"
                          onClick={() => toast.success(`Stream opened for ${c.name}`)}
                        >
                          <Eye className="size-3" /> View Stream
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
