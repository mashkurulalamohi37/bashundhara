import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, Phone, Search, Star } from "lucide-react";
import { PageHeader, Section, StatusBadge, TableSkeleton, EmptyState } from "@/components/app/primitives";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { nearbyPlaceService } from "@/services";
import { titleize } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/nearby")({
  head: () => ({
    meta: [
      { title: "Nearby Shops & Services — Bashundhara R/A" },
      { name: "description", content: "Discover verified grocery shops, pharmacies, hospitals, banks, salons, schools and services near Bashundhara R/A with distance, hours and ratings." },
      { property: "og:title", content: "Nearby Shops & Services — Bashundhara R/A" },
      { property: "og:description", content: "Verified local businesses around the community, with distance, hours and offers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Nearby,
});

const CATEGORIES = ["all", "grocery", "restaurant", "cafe", "pharmacy", "hospital", "clinic", "bank", "atm", "laundry", "salon", "gym", "school", "mosque", "petrol", "courier", "workshop", "bakery", "market"] as const;

function Nearby() {
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState<string>("all");
  const { data: places = [], isLoading } = useQuery({ queryKey: ["nearby-places"], queryFn: () => nearbyPlaceService.all() });

  const rows = places
    .filter((p) => (category === "all" ? true : p.category === category))
    .filter((p) => `${p.name} ${p.address} ${p.category}`.toLowerCase().includes(term.trim().toLowerCase()))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <>
      <PageHeader
        title="Nearby Shops & Services"
        description="Everything around Bashundhara R/A — verified businesses, distance, opening hours, ratings and resident offers."
        breadcrumb={["Community", "Nearby"]}
      />
      <div className="space-y-4 p-4 sm:p-6">
        <Section>
          <div className="flex flex-wrap items-center gap-2 p-3">
            <div className="relative min-w-56 flex-1">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search shops and services…" className="h-9 pl-8" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.slice(0, 12).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`rounded border px-2 py-1 text-xs capitalize ${category === c ? "border-primary bg-primary-soft text-accent-foreground" : "border-border hover:bg-accent"}`}
                >
                  {c === "all" ? "All" : titleize(c)}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {isLoading ? (
          <Section><TableSkeleton rows={6} cols={4} /></Section>
        ) : rows.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((p) => (
              <article key={p.id} className="rounded-md border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{titleize(p.category)} · {p.distanceKm} km · {p.hours}</p>
                  </div>
                  <StatusBadge value={p.openNow ? "open" : "closed"} />
                </div>
                <p className="mt-2 truncate text-xs text-muted-foreground">{p.address}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1"><Star className="size-3.5 text-warning" /> {p.rating}</span>
                  {p.verified ? <StatusBadge value="verified" /> : null}
                  {p.offers !== "—" ? <span className="rounded border border-border px-1.5 py-0.5 text-[11px]">{p.offers}</span> : null}
                </div>
                <div className="mt-3 flex gap-2">
                  <a href={`tel:${p.phone}`} className="flex-1 rounded border border-border px-2 py-1.5 text-center text-xs hover:bg-accent">
                    <Phone className="mr-1 inline size-3.5" /> Call
                  </a>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.success(`${p.name} saved to favourites`)}>
                    <Heart className="size-3.5" /> Save
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Section><EmptyState title="Nothing nearby matched" description="Try a different category or search term." /></Section>
        )}
      </div>
    </>
  );
}
