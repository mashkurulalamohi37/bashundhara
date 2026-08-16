import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Gavel, Sparkles, Store, Timer } from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { marketplaceService, serviceProviderService, serviceRequestService } from "@/services";
import { bdt, titleize } from "@/lib/format";

export const Route = createFileRoute("/_admin/services/marketplace")({
  head: () => ({
    meta: [
      { title: "Community Service Marketplace — Bashundhara R/A" },
      { name: "description", content: "Verified laundry, cleaning, AC, plumbing and household service providers with bids, trust scores and controlled community access." },
      { property: "og:title", content: "Community Service Marketplace — Bashundhara R/A" },
      { property: "og:description", content: "Verified providers, competitive bids and controlled service handovers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Marketplace,
});

function Marketplace() {
  const { data: summary } = useQuery({ queryKey: ["marketplace-summary"], queryFn: () => marketplaceService.summary() });
  const { data: providers = [], isLoading } = useQuery({ queryKey: ["service-providers"], queryFn: () => serviceProviderService.all() });
  const { data: requests = [] } = useQuery({ queryKey: ["service-requests"], queryFn: () => serviceRequestService.all() });

  return (
    <>
      <PageHeader
        title="Community Service Marketplace"
        description="Verified providers serving Bashundhara R/A under the controlled gate → caretaker → resident handover protocol."
        breadcrumb={["Services", "Marketplace"]}
        actions={
          <Link to="/services/requests" className="rounded border border-border px-3 py-1.5 text-sm hover:bg-accent">Open requests</Link>
        }
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid gap-px overflow-hidden rounded-md sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Verified providers" value={`${summary?.verifiedProviders ?? "—"} / ${summary?.providers ?? "—"}`} hint="Community verification passed" icon={BadgeCheck} tone="success" />
          <KpiCard label="Open requests" value={String(summary?.openRequests ?? "—")} hint="Awaiting provider response" icon={Sparkles} tone="info" />
          <KpiCard label="Active bids" value={String(summary?.activeBids ?? "—")} hint="Competitive quotes in play" icon={Gavel} tone="primary" />
          <KpiCard label="Average rating" value={String(summary?.avgRating ?? "—")} hint="Across all verified providers" icon={Timer} tone="neutral" />
        </div>

        <Section title="Verified providers" description="Trust score combines rating, completed jobs, complaint rate and no-show rate">
          {isLoading ? (
            <TableSkeleton rows={6} cols={4} />
          ) : (
            <div className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-3">
              {providers.slice(0, 18).map((p) => (
                <article key={p.id} className="rounded-md border border-border bg-background p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold">{p.business}</h3>
                      <p className="text-xs text-muted-foreground">{titleize(p.category)} · {p.serviceArea}</p>
                    </div>
                    <StatusBadge value={p.verification} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{p.services}</p>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded border border-border p-1.5">
                      <dt className="text-[10px] uppercase text-muted-foreground">Rating</dt>
                      <dd className="tabular text-sm font-semibold">{p.rating}</dd>
                    </div>
                    <div className="rounded border border-border p-1.5">
                      <dt className="text-[10px] uppercase text-muted-foreground">Jobs</dt>
                      <dd className="tabular text-sm font-semibold">{p.completedJobs}</dd>
                    </div>
                    <div className="rounded border border-border p-1.5">
                      <dt className="text-[10px] uppercase text-muted-foreground">Response</dt>
                      <dd className="tabular text-sm font-semibold">{p.responseMins}m</dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Trust score {p.trustScore}% · from {bdt(p.priceFrom)} · {p.hours}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Link to="/services/requests" className="flex-1 rounded bg-primary px-2 py-1.5 text-center text-xs font-medium text-primary-foreground hover:opacity-90">Request service</Link>
                    <Link to="/services/providers" className="flex-1 rounded border border-border px-2 py-1.5 text-center text-xs hover:bg-accent">View profile</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Section>

        <Section title="Latest resident requests" description="Fixed price, quote request and competitive bid models" actions={<Store className="size-4 text-muted-foreground" />}>
          <ul className="divide-y divide-border">
            {requests.slice(0, 8).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{r.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {r.id} · {r.location} · {r.preferredDate} · budget {bdt(r.budgetFrom)}–{bdt(r.budgetTo)} · {r.bids} bids
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <StatusBadge value={r.pricingModel} />
                  <StatusBadge value={r.status} />
                </span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  );
}
