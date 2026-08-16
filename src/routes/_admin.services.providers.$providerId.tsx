import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Clock, Star, Timer } from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge, TableSkeleton, StatLine, EmptyState } from "@/components/app/primitives";
import {
  serviceProviderService, serviceReviewService, serviceOrderService, serviceBidService,
} from "@/services";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/services/providers/$providerId")({
  head: ({ params }) => ({
    meta: [
      { title: `Provider ${params.providerId} — Bashundhara R/A` },
      { name: "description", content: "Verified service provider profile: services, pricing, trust score, reviews, live orders and bids inside Bashundhara R/A." },
      { property: "og:title", content: "Service provider profile — Bashundhara R/A" },
      { property: "og:description", content: "Trust score, verification stage, reviews and order history for a marketplace provider." },
    ],
  }),
  component: ProviderProfile,
});

function ProviderProfile() {
  const { providerId } = Route.useParams();
  const { data: provider, isLoading } = useQuery({ queryKey: ["provider", providerId], queryFn: () => serviceProviderService.get(providerId) });
  const { data: reviews = [] } = useQuery({ queryKey: ["service-reviews"], queryFn: () => serviceReviewService.all() });
  const { data: orders = [] } = useQuery({ queryKey: ["service-orders"], queryFn: () => serviceOrderService.all() });
  const { data: bids = [] } = useQuery({ queryKey: ["service-bids"], queryFn: () => serviceBidService.all() });

  if (isLoading || !provider) return <div className="p-6"><TableSkeleton rows={5} cols={4} /></div>;

  const myReviews = reviews.filter((r) => r.providerId === providerId);
  const myOrders = orders.filter((o) => o.providerId === providerId);
  const myBids = bids.filter((b) => b.providerId === providerId);

  return (
    <>
      <PageHeader
        title={provider.business}
        description={provider.description}
        breadcrumb={["Services", "Providers", provider.id]}
        actions={
          <Link to="/services/providers" className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-sm hover:bg-accent">
            <ArrowLeft className="size-4" /> All providers
          </Link>
        }
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Rating" value={provider.rating.toFixed(1)} hint={`${myReviews.length} community reviews`} icon={Star} tone="success" />
          <KpiCard label="Completed jobs" value={String(provider.completedJobs)} hint={`Since ${provider.since}`} icon={BadgeCheck} tone="neutral" />
          <KpiCard label="Response time" value={`${provider.responseMins} min`} hint="Median first response" icon={Timer} tone="info" />
          <KpiCard label="Trust score" value={`${provider.trustScore}/100`} hint={`Complaint rate ${provider.complaintRate}% · no-show ${provider.noShowRate}%`} icon={Clock} tone={provider.trustScore > 80 ? "success" : "warning"} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Section title="Business profile" description="Verification and service coverage">
            <dl className="px-1 pb-2">
              <StatLine label="Verification" value={<StatusBadge value={provider.verification} />} />
              <StatLine label="Status" value={<StatusBadge value={provider.status} />} />
              <StatLine label="Category" value={provider.category.replace(/_/g, " ")} />
              <StatLine label="Services" value={provider.services} />
              <StatLine label="Price range" value={`${bdt(provider.priceFrom)} – ${bdt(provider.priceTo)}`} />
              <StatLine label="Hours" value={provider.hours} />
              <StatLine label="Service area" value={provider.serviceArea} />
              <StatLine label="Contact" value={`${provider.contactName} · ${provider.phone}`} />
            </dl>
          </Section>

          <Section title="Live orders" description="Orders handled inside the community" className="lg:col-span-2">
            {myOrders.length === 0 ? (
              <EmptyState title="No orders yet" description="This provider has no service orders in the current window." />
            ) : (
              <ul className="divide-y divide-border">
                {myOrders.slice(0, 8).map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="min-w-0">
                      <Link to="/services/orders/$orderId" params={{ orderId: o.id }} className="block truncate text-sm font-medium hover:underline">
                        {o.service} · Flat {o.flatId}
                      </Link>
                      <span className="block truncate text-xs text-muted-foreground">{o.scheduledDate} · {o.pickupWindow} · gate {o.gate}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="tabular text-sm">{bdt(o.amount)}</span>
                      <StatusBadge value={o.status} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Reviews" description="Quality, behaviour, timeliness, price and carefulness">
            {myReviews.length === 0 ? (
              <EmptyState title="No reviews yet" description="Reviews appear after a resident confirms a completed order." />
            ) : (
              <ul className="divide-y divide-border">
                {myReviews.slice(0, 8).map((r) => (
                  <li key={r.id} className="px-4 py-2.5">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium">{r.residentName}</span>
                      <span className="tabular text-sm">{r.overall.toFixed(1)} ★</span>
                    </span>
                    <span className="block text-xs text-muted-foreground">{r.comment}</span>
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      Quality {r.quality} · Behaviour {r.behaviour} · Timeliness {r.timeliness} · Price {r.price} · Care {r.carefulness} · {r.date}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
          <Section title="Bids submitted" description="Competitive quotes on resident requests">
            {myBids.length === 0 ? (
              <EmptyState title="No bids" description="This provider has not quoted on open requests." />
            ) : (
              <ul className="divide-y divide-border">
                {myBids.slice(0, 8).map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{b.requestId}</span>
                      <span className="block truncate text-xs text-muted-foreground">{b.note}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="tabular text-sm">{bdt(b.price)}</span>
                      <StatusBadge value={b.status} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </div>
    </>
  );
}
