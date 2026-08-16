import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin, Phone, Star } from "lucide-react";
import { PageHeader, Section, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { nearbyPlaceService } from "@/services";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/resident/nearby")({
  head: () => ({
    meta: [
      { title: "Nearby Shops & Services — Bashundhara R/A" },
      { name: "description", content: "Discover verified grocery stores, pharmacies, clinics, banks and laundries around Bashundhara Residential Area." },
      { property: "og:title", content: "Nearby Shops & Services — Bashundhara R/A" },
      { property: "og:description", content: "Verified local businesses near your block with hours, distance and offers." },
    ],
  }),
  component: Nearby,
});

function Nearby() {
  const [q, setQ] = useState("");
  const { data: places = [], isLoading } = useQuery({ queryKey: ["nearby-places"], queryFn: () => nearbyPlaceService.all() });
  const filtered = places.filter((p) =>
    `${p.name} ${p.category} ${p.address} ${p.block}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Nearby Shops & Services"
        description="Verified local businesses around Bashundhara R/A, sorted by walking distance from your block."
        breadcrumb={["Resident", "Nearby"]}
      />
      <div className="space-y-4 p-4 sm:p-6">
        <Input placeholder="Search pharmacy, grocery, laundry…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        {isLoading ? (
          <TableSkeleton rows={6} cols={3} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <article key={p.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-semibold">{p.name}</h2>
                  <StatusBadge value={p.openNow ? "open" : "closed"} />
                </div>
                <p className="mt-1 text-xs capitalize text-muted-foreground">{p.category.replace(/_/g, " ")}{p.verified ? " · verified" : ""}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3.5" />{p.address} · {p.distanceKm} km</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="size-3.5" />{p.phone} · {p.hours}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Star className="size-3.5" />{p.rating.toFixed(1)} · {p.offers}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
