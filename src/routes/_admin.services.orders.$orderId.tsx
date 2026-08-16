import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Circle, QrCode } from "lucide-react";
import { PageHeader, Section, StatLine, StatusBadge, EmptyState } from "@/components/app/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { serviceOrderDetailService } from "@/services";
import { bdt, titleize } from "@/lib/format";

export const Route = createFileRoute("/_admin/services/orders/$orderId")({
  head: ({ params }) => ({
    meta: [
      { title: `Service order ${params.orderId} — Bashundhara R/A` },
      { name: "description", content: "Service order detail with items, schedule, chain-of-custody handover timeline, security verification, payment and reviews." },
      { property: "og:title", content: `Service order ${params.orderId} — Bashundhara R/A` },
      { property: "og:description", content: "Controlled handover timeline for a Bashundhara R/A marketplace service order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrderDetail,
});

const LIFECYCLE = [
  "requested", "provider_selected", "scheduled", "provider_approaching", "at_gate",
  "security_verified", "caretaker_assigned", "picked_up", "processing", "return_to_gate",
  "caretaker_received", "delivered", "resident_confirmed", "completed",
] as const;

function OrderDetail() {
  const { orderId } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["service-order", orderId],
    queryFn: () => serviceOrderDetailService.get(orderId),
  });

  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <>
        <PageHeader title="Service order" description="Not found" breadcrumb={["Services", "Orders"]} />
        <div className="p-6">
          <Section>
            <EmptyState
              title="Order not found"
              description={`No service order matches ${orderId}.`}
              action={<Link to="/services/orders" className="text-sm text-primary hover:underline">Back to service orders</Link>}
            />
          </Section>
        </div>
      </>
    );
  }

  const { order, provider, items, handovers, reviews, disputes, pass } = data;
  const reached = LIFECYCLE.indexOf(order.status as (typeof LIFECYCLE)[number]);

  return (
    <>
      <PageHeader
        title={`${order.id} · ${order.service}`}
        description={`${order.providerName} → Gate ${order.gate.replace("Gate ", "")} → Caretaker → Flat ${order.flatId}`}
        breadcrumb={["Services", "Orders", order.id]}
        actions={
          <>
            <StatusBadge value={order.status} />
            <Link to="/services/orders" className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-sm hover:bg-accent">
              <ArrowLeft className="size-3.5" /> All orders
            </Link>
          </>
        }
      />

      <div className="space-y-4 p-4 sm:p-6">
        <Section title="Lifecycle" description="Controlled workflow from request to resident confirmation">
          <ol className="flex flex-wrap gap-2 p-4">
            {LIFECYCLE.map((step, i) => {
              const done = reached >= 0 && i <= reached;
              return (
                <li
                  key={step}
                  className={`flex items-center gap-1.5 rounded border px-2 py-1 text-xs ${done ? "border-primary/30 bg-primary-soft text-accent-foreground" : "border-border bg-muted text-muted-foreground"}`}
                >
                  {done ? <CheckCircle2 className="size-3.5" /> : <Circle className="size-3.5" />}
                  {titleize(step)}
                </li>
              );
            })}
          </ol>
        </Section>

        <Tabs defaultValue="overview">
          <TabsList className="flex-wrap">
            {["overview", "customer", "provider", "items", "schedule", "handover", "security", "payment", "reviews", "dispute"].map((t) => (
              <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <Section title="Order overview">
              <dl className="grid gap-x-8 px-4 py-2 sm:grid-cols-2">
                <StatLine label="Order ID" value={order.id} />
                <StatLine label="Service" value={order.service} />
                <StatLine label="Category" value={titleize(order.category)} />
                <StatLine label="Linked request" value={order.requestId ?? "Direct booking"} />
                <StatLine label="Items" value={order.itemCount} />
                <StatLine label="Amount" value={bdt(order.amount)} />
                <StatLine label="Created" value={order.createdOn} />
                <StatLine label="Status" value={<StatusBadge value={order.status} />} />
              </dl>
            </Section>
          </TabsContent>

          <TabsContent value="customer">
            <Section title="Customer">
              <dl className="grid gap-x-8 px-4 py-2 sm:grid-cols-2">
                <StatLine label="Resident" value={order.residentName} />
                <StatLine label="Flat" value={order.flatId} />
                <StatLine label="Building" value={order.buildingId} />
                <StatLine label="Block" value={order.block} />
                <StatLine label="Confirmation OTP" value={<span className="tabular">•••{order.otp.slice(-3)}</span>} />
              </dl>
            </Section>
          </TabsContent>

          <TabsContent value="provider">
            <Section title="Service provider">
              <dl className="grid gap-x-8 px-4 py-2 sm:grid-cols-2">
                <StatLine label="Business" value={order.providerName} />
                <StatLine label="Verification" value={<StatusBadge value={provider?.verification ?? "pending"} />} />
                <StatLine label="Rating" value={provider ? `${provider.rating} / 5` : "—"} />
                <StatLine label="Completed jobs" value={provider?.completedJobs ?? "—"} />
                <StatLine label="Response time" value={provider ? `${provider.responseMins} min` : "—"} />
                <StatLine label="Trust score" value={provider ? `${provider.trustScore}%` : "—"} />
              </dl>
            </Section>
          </TabsContent>

          <TabsContent value="items">
            <Section title="Items & package tracking" description="Condition recorded on collection and on return">
              {items.length ? (
                <ul className="divide-y divide-border">
                  {items.map((it) => (
                    <li key={it.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{it.description}</span>
                        <span className="block text-xs text-muted-foreground">
                          {it.quantity} pcs · {it.weightKg} kg · out: {it.conditionOut} · in: {it.conditionIn} · {it.photos} photos
                        </span>
                      </span>
                      <StatusBadge value={it.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No physical items" description="This service does not involve item pickup." />
              )}
            </Section>
          </TabsContent>

          <TabsContent value="schedule">
            <Section title="Schedule">
              <dl className="grid gap-x-8 px-4 py-2 sm:grid-cols-2">
                <StatLine label="Scheduled date" value={order.scheduledDate} />
                <StatLine label="Pickup window" value={order.pickupWindow} />
                <StatLine label="Return window" value={order.returnWindow} />
                <StatLine label="Assigned caretaker" value={order.caretakerName} />
                <StatLine label="Gate" value={order.gate} />
              </dl>
            </Section>
          </TabsContent>

          <TabsContent value="handover">
            <Section title="Chain of custody" description="Every physical handover is timestamped and confirmed">
              <ol className="space-y-0 p-4">
                {handovers.map((h) => (
                  <li key={h.id} className="relative flex gap-3 pb-5 pl-1 last:pb-0">
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                    <span className="absolute bottom-0 left-[7px] top-4 w-px bg-border last:hidden" aria-hidden />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        <span className="tabular text-muted-foreground">{h.timestamp}</span> — {h.notes}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {h.personName} ({titleize(h.personRole)}) · {h.location} · confirmed by {h.confirmation.toUpperCase()} · {h.photos} photos
                      </p>
                    </div>
                  </li>
                ))}
                {!handovers.length ? <EmptyState title="No handovers yet" description="The order has not reached the gate." /> : null}
              </ol>
            </Section>
          </TabsContent>

          <TabsContent value="security">
            <Section title="Service access pass" description="Providers get zone-restricted, time-bound access only">
              <dl className="grid gap-x-8 px-4 py-2 sm:grid-cols-2">
                <StatLine label="Pass code" value={<span className="tabular inline-flex items-center gap-1.5"><QrCode className="size-3.5" />{order.accessPassCode}</span>} />
                <StatLine label="Gate" value={pass?.gate ?? order.gate} />
                <StatLine label="Valid from" value={pass?.validFrom ?? `${order.scheduledDate} ${order.pickupWindow.split("–")[0]}`} />
                <StatLine label="Valid to" value={pass?.validTo ?? `${order.scheduledDate} ${order.returnWindow.split("–")[1]}`} />
                <StatLine label="Zone access" value={pass?.zoneAccess ?? "Gate → Collection point only"} />
                <StatLine label="Pass status" value={<StatusBadge value={pass?.status ?? "expected"} />} />
              </dl>
            </Section>
          </TabsContent>

          <TabsContent value="payment">
            <Section title="Payment">
              <dl className="grid gap-x-8 px-4 py-2 sm:grid-cols-2">
                <StatLine label="Order value" value={bdt(order.amount)} />
                <StatLine label="Payment status" value={<StatusBadge value={order.paymentStatus} />} />
                <StatLine label="Billed to" value={`${order.residentName} · ${order.flatId}`} />
              </dl>
            </Section>
          </TabsContent>

          <TabsContent value="reviews">
            <Section title="Resident reviews">
              {reviews.length ? (
                <ul className="divide-y divide-border">
                  {reviews.map((r) => (
                    <li key={r.id} className="px-4 py-3">
                      <p className="text-sm font-medium">{r.overall} / 5 · {r.residentName}</p>
                      <p className="text-xs text-muted-foreground">
                        Quality {r.quality} · Behaviour {r.behaviour} · Timeliness {r.timeliness} · Price {r.price} · Care {r.carefulness}
                      </p>
                      <p className="mt-1 text-sm">{r.comment}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No reviews yet" description="Reviews open once the resident confirms receipt." />
              )}
            </Section>
          </TabsContent>

          <TabsContent value="dispute">
            <Section title="Disputes">
              {disputes.length ? (
                <ul className="divide-y divide-border">
                  {disputes.map((d) => (
                    <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <span>
                        <span className="block text-sm font-medium">{titleize(d.reason)} · {bdt(d.claimAmount)}</span>
                        <span className="block text-xs text-muted-foreground">{d.providerResponse} · reviewer {d.reviewer}</span>
                      </span>
                      <StatusBadge value={d.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No disputes" description="No issue was reported for this order." />
              )}
            </Section>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
