import { useMemo, useState } from "react";
import { Layers, Minus, Plus, Search } from "lucide-react";
import type { MapMarker } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge } from "./primitives";
import { cn } from "@/lib/utils";

const LAYERS: { key: MapMarker["layer"]; label: string; color: string }[] = [
  { key: "blocks", label: "Blocks", color: "bg-primary" },
  { key: "gates", label: "Gates", color: "bg-info" },
  { key: "cctv", label: "CCTV", color: "bg-chart-5" },
  { key: "incidents", label: "Incidents", color: "bg-warning" },
  { key: "emergency", label: "Emergency", color: "bg-destructive" },
  { key: "parking", label: "Parking", color: "bg-muted-foreground" },
  { key: "maintenance", label: "Maintenance", color: "bg-chart-3" },
];

export function CommunityMap({ markers, height = 420 }: { markers: MapMarker[]; height?: number }) {
  const [enabled, setEnabled] = useState<string[]>(LAYERS.map((l) => l.key));
  const [zoom, setZoom] = useState(1);
  const [term, setTerm] = useState("");
  const [openLayers, setOpenLayers] = useState(false);
  const [selected, setSelected] = useState<MapMarker | null>(null);

  const visible = useMemo(
    () =>
      markers.filter(
        (m) =>
          enabled.includes(m.layer) &&
          (!term || m.label.toLowerCase().includes(term.toLowerCase())),
      ),
    [markers, enabled, term],
  );

  return (
    <div className="relative overflow-hidden rounded-md border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <div className="relative min-w-[180px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search block, gate, camera…"
            aria-label="Search map"
            className="h-9 pl-8"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpenLayers((v) => !v)} aria-expanded={openLayers}>
          <Layers className="size-3.5" /> Layers
        </Button>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="size-9" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}>
            <Minus className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-9" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}>
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {openLayers ? (
        <div className="flex flex-wrap gap-3 border-b border-border bg-muted/40 px-3 py-2">
          {LAYERS.map((l) => (
            <label key={l.key} className="flex items-center gap-2 text-xs">
              <Checkbox
                checked={enabled.includes(l.key)}
                onCheckedChange={(v) =>
                  setEnabled((s) => (v ? [...s, l.key] : s.filter((k) => k !== l.key)))
                }
              />
              <span className={cn("size-2 rounded-full", l.color)} aria-hidden />
              {l.label}
            </label>
          ))}
        </div>
      ) : null}

      <div
        className="relative overflow-hidden bg-[color-mix(in_oklab,var(--color-primary)_5%,var(--color-card))]"
        style={{ height }}
      >
        <div
          className="absolute inset-0 origin-center transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          <svg className="absolute inset-0 size-full" aria-hidden>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke="var(--color-border)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <path d="M0 12% H100%" stroke="var(--color-border)" strokeWidth="10" />
          </svg>
          {visible.map((m) => {
            const layer = LAYERS.find((l) => l.key === m.layer)!;
            return (
              <button
                key={`${m.layer}-${m.id}`}
                type="button"
                onClick={() => setSelected(m)}
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`${layer.label}: ${m.label}`}
              >
                <span className="flex items-center gap-1.5 rounded border border-border bg-card/95 px-1.5 py-0.5 text-[10px] font-medium shadow-sm hover:border-primary">
                  <span className={cn("size-2 rounded-full", layer.color)} aria-hidden />
                  <span className="max-w-[110px] truncate">{m.label}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="pointer-events-none absolute bottom-2 left-3 rounded border border-border bg-card/90 px-2 py-1 text-[10px] text-muted-foreground">
          Schematic community map · {visible.length} markers · live geospatial layer connects via map API
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{selected?.label}</SheetTitle>
            <SheetDescription>{selected?.detail}</SheetDescription>
          </SheetHeader>
          <div className="space-y-3 px-4">
            <StatusBadge value={selected?.status ?? "unknown"} />
            <p className="text-sm text-muted-foreground">
              Layer: <span className="capitalize text-foreground">{selected?.layer}</span>
            </p>
            <p className="text-sm text-muted-foreground">Marker ID: {selected?.id}</p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}