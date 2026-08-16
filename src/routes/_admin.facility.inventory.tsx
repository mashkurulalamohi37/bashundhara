import { useSyncExternalStore, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Boxes, CheckCircle2, Clock, Plus, Search, Minus, AlertTriangle, Layers,
} from "lucide-react";
import { PageHeader, Section, StatusBadge } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/facility/inventory")({
  head: () => ({
    meta: [
      { title: "Facility Inventory & Spare Parts — Facility Core Service" },
      { name: "description", content: "Facility maintenance inventory: spare parts, electrical items, plumbing materials, cleaning chemicals, reorder stock levels." },
    ],
  }),
  component: FacilityInventoryPage,
});

function FacilityInventoryPage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);
  const [search, setSearch] = useState("");

  const handleStockIn = (itemId: string) => {
    facilityStore.adjustInventoryStock(itemId, 5, "Stock In Batch");
  };

  const handleStockOut = (itemId: string) => {
    facilityStore.adjustInventoryStock(itemId, -1, "Stock Out for Maintenance");
  };

  const filteredItems = store.inventoryItems.filter((i) =>
    i.itemName.toLowerCase().includes(search.toLowerCase()) ||
    i.itemCode.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Facility Inventory & Maintenance Spare Parts"
        description="Warehouse stock for building maintenance: mechanical seals, bearings, LED lights, cleaning chemicals, and safety gear."
        breadcrumb={["Facility", "Inventory"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Search */}
        <div className="flex items-center gap-2 max-w-md">
          <Search className="size-4 text-muted-foreground" />
          <Input
            placeholder="Search spare parts, codes, categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        {/* Inventory Items Table */}
        <Section title="Maintenance Parts & Consumables Stock" description="Real-time quantity, reorder alerts, and unit valuation">
          <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden text-xs">
            <div className="grid grid-cols-7 gap-2 bg-muted/60 p-3 font-semibold text-muted-foreground">
              <span>Part Code</span>
              <span className="col-span-2">Item Name & Category</span>
              <span>Storage Location</span>
              <span>In Stock</span>
              <span>Unit Cost</span>
              <span className="text-right">Stock Action</span>
            </div>
            {filteredItems.map((item) => (
              <div key={item.id} className="grid grid-cols-7 gap-2 p-3 items-center hover:bg-muted/20">
                <span className="font-mono font-bold text-primary">{item.itemCode}</span>
                <div className="col-span-2 space-y-0.5">
                  <p className="font-semibold text-foreground text-xs">{item.itemName}</p>
                  <p className="text-[10px] text-muted-foreground">{item.category} · Supplier: {item.supplierName}</p>
                </div>
                <span>{item.storageLocation}</span>
                <div className="space-y-0.5">
                  <span className={`font-bold ${item.quantityInStock <= item.reorderLevel ? "text-red-500" : "text-foreground"}`}>
                    {item.quantityInStock} {item.unit}
                  </span>
                  <StatusBadge value={item.status} />
                </div>
                <span className="font-mono">{bdt(item.unitCostBDT)}</span>
                <div className="text-right flex items-center justify-end gap-1">
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0" title="Stock Out (-1)" onClick={() => handleStockOut(item.id)}>
                    <Minus className="size-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0" title="Stock In (+5)" onClick={() => handleStockIn(item.id)}>
                    <Plus className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
