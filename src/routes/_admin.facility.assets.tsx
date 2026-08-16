import { useSyncExternalStore, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2, CheckCircle2, ChevronRight, Clock, FileText, Filter, HardHat,
  Plus, QrCode, Search, ShieldCheck, Wrench, X, Eye, AlertCircle, MapPin,
} from "lucide-react";
import { PageHeader, Section, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";
import { bdt } from "@/lib/format";
import type { AssetCategory, FacilityAsset } from "@/types/facility";

export const Route = createFileRoute("/_admin/facility/assets")({
  head: () => ({
    meta: [
      { title: "Asset Management — Facility Core Service" },
      { name: "description", content: "Facility Asset Directory: Generators, Lifts, Water Pumps, Transformers, HVAC, Fire Safety, and Biomedical." },
    ],
  }),
  component: FacilityAssetsPage,
});

const CATEGORIES: AssetCategory[] = [
  "Generator", "Lift", "Water Pump", "Electrical Panel", "Transformer",
  "HVAC", "AC", "Water Treatment Equipment", "Fire Safety Equipment", "CCTV",
  "Access Control Equipment", "Solar Equipment", "Plumbing Equipment", "Medical Equipment", "Other",
];

function QRModal({ asset, onClose }: { asset: FacilityAsset; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-semibold text-sm">Asset QR Code Tag</h3>
          <Button variant="ghost" size="sm" onClick={onClose}><X className="size-4" /></Button>
        </div>

        <div className="mx-auto grid size-44 place-items-center rounded-xl border-2 border-dashed border-primary/40 bg-muted/30 p-3">
          {/* Simulated QR Code Canvas */}
          <div className="grid size-36 grid-cols-6 gap-1 bg-background p-2 border rounded">
            {Array.from({ length: 36 }).map((_, i) => (
              <div
                key={i}
                className={i % 2 === 0 || i % 7 === 0 || i < 6 || i > 30 ? "bg-foreground" : "bg-muted"}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="font-mono text-base font-bold text-primary">{asset.assetCode}</p>
          <p className="font-medium text-sm mt-0.5">{asset.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            <MapPin className="inline size-3 mr-1" />
            {asset.room}, {asset.buildingName}
          </p>
        </div>

        <div className="rounded-md bg-muted p-2.5 text-[11px] text-muted-foreground text-left space-y-1">
          <p>• Scan using mobile technician camera or reader.</p>
          <p>• Direct access to Asset Profile, Work Orders & AMC status.</p>
          <p className="italic text-amber-600 dark:text-amber-400">• Frontend QR code tag placeholder for physical equipment labeling.</p>
        </div>

        <Button className="w-full" size="sm" onClick={onClose}>Close Tag</Button>
      </div>
    </div>
  );
}

function FacilityAssetsPage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [qrAsset, setQrAsset] = useState<FacilityAsset | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Asset Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState<AssetCategory>("Generator");
  const [buildingName, setBuildingName] = useState("Meghna Tower");
  const [room, setRoom] = useState("Substation Room");
  const [cost, setCost] = useState("150000");

  const filteredAssets = store.assets.filter((a) => {
    if (catFilter !== "all" && a.category !== catFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.assetCode.toLowerCase().includes(q) ||
        a.buildingName.toLowerCase().includes(q) ||
        a.manufacturer.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    facilityStore.addAsset({
      name,
      category,
      subcategory: category,
      manufacturer: "Enterprise Manufacturer",
      brand: "Standard",
      model: "V-2026",
      serialNumber: `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      purchaseDate: new Date().toISOString().slice(0, 10),
      installationDate: new Date().toISOString().slice(0, 10),
      purchaseCost: Number(cost) || 100000,
      currentValue: Number(cost) || 100000,
      warrantyExpiry: "2027-12-31",
      community: "Bashundhara R/A",
      block: "Block A",
      road: "Road 5",
      buildingId: "BLD-004",
      buildingName,
      floor: "Ground Floor",
      room,
      facilityArea: "Common Facility",
      responsibleDepartment: "Facility Operations",
      responsiblePerson: "Facility Supervisor",
      status: "Operational",
      condition: "Excellent",
      expectedLifeYears: 15,
      lastMaintenanceDate: new Date().toISOString().slice(0, 10),
      nextMaintenanceDate: "2026-09-01",
      notes: "Newly registered asset.",
    });
    setShowAddForm(false);
    setName("");
  };

  return (
    <>
      <PageHeader
        title="Asset Management & Directory"
        description="Physical community equipment inventory, specifications, locations, warranties, and maintenance status."
        breadcrumb={["Facility", "Assets"]}
        actions={
          <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="mr-1.5 size-4" /> Register New Asset
          </Button>
        }
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Add Asset Form Modal / Card */}
        {showAddForm && (
          <form onSubmit={handleCreateAsset} className="rounded-xl border border-primary/30 bg-card p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-semibold text-base">Register New Facility Asset</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}><X className="size-4" /></Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Asset Name *</Label>
                <Input className="mt-1" required placeholder="e.g. Substation Transformer 200kVA" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Category *</Label>
                <select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value as AssetCategory)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label>Building *</Label>
                <Input className="mt-1" required value={buildingName} onChange={(e) => setBuildingName(e.target.value)} />
              </div>
              <div>
                <Label>Room / Area *</Label>
                <Input className="mt-1" required value={room} onChange={(e) => setRoom(e.target.value)} />
              </div>
              <div>
                <Label>Purchase Cost (BDT)</Label>
                <Input className="mt-1" type="number" min="0" value={cost} onChange={(e) => setCost(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button type="submit" size="sm">Register Asset</Button>
            </div>
          </form>
        )}

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Search className="size-4 text-muted-foreground" />
            <Input
              placeholder="Search assets by name, code, building, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <select className="h-9 rounded-md border border-border bg-background px-3 text-xs" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="h-9 rounded-md border border-border bg-background px-3 text-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="Operational">Operational</option>
              <option value="Active">Active</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Damaged">Damaged</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 space-y-3 hover:border-primary/40 transition-colors">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-primary">{asset.assetCode}</span>
                    <h3 className="font-semibold text-sm text-foreground mt-0.5 line-clamp-1">{asset.name}</h3>
                  </div>
                  <StatusBadge value={asset.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {asset.category} · {asset.manufacturer} ({asset.model})
                </p>

                <div className="mt-3 rounded-lg bg-muted/40 p-2.5 space-y-1 text-xs">
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0 text-primary" />
                    <span>{asset.room}, <strong>{asset.buildingName}</strong> ({asset.block})</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <Wrench className="size-3.5 shrink-0 text-amber-500" />
                    <span>Next Maintenance: <strong className="text-foreground">{asset.nextMaintenanceDate}</strong></span>
                  </p>
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <ShieldCheck className="size-3.5 shrink-0 text-emerald-500" />
                    <span>AMC: <strong>{asset.amcName ?? "No Active AMC"}</strong></span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                <span className="font-mono font-medium">{bdt(asset.currentValue)}</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1" onClick={() => setQrAsset(asset)}>
                    <QrCode className="size-3.5" /> Tag QR
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {qrAsset && <QRModal asset={qrAsset} onClose={() => setQrAsset(null)} />}
    </>
  );
}
