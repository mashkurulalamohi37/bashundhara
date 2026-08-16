import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bell, CalendarDays, CreditCard, LayoutGrid, ParkingSquare, ShieldCheck, Siren,
  Sparkles, Store, Truck, Users, Wrench,
} from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge } from "@/components/app/primitives";
import { announcementService, invoiceService, visitorService, complaintService, bookingService, serviceOrderService, nearbyPlaceService, eventService } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/resident/dashboard")({
  head: () => ({
    meta: [
      { title: "Resident Home — Bashundhara R/A" },
      { name: "description", content: "Your Bashundhara R/A home: visitors, bills, complaints, service orders, bookings, community news and nearby services." },
      { property: "og:title", content: "Resident Home — Bashundhara R/A" },
      { property: "og:description", content: "One place for visitors, payments, services and community life in Bashundhara R/A." },
    ],
  }),
  component: ResidentDashboard,
});

const QUICK = [
  { to: "/resident/emergency", label: "SOS", icon: Siren },
  { to: "/resident/new-request", label: "New Request", icon: Sparkles },
  { to: "/resident/visitors", label: "Visitor", icon: ShieldCheck },
  { to: "/resident/vehicles", label: "Vehicle", icon: Truck },
  { to: "/resident/parking", label: "Parking", icon: ParkingSquare },
  { to: "/resident/complaints", label: "Complaint", icon: Wrench },
  { to: "/resident/payments", label: "Payment", icon: CreditCard },
  { to: "/resident/bookings", label: "Booking", icon: CalendarDays },
  { to: "/resident/services", label: "My Services", icon: Users },
  { to: "/resident/nearby", label: "Nearby", icon: Store },
  { to: "/resident/community", label: "Community", icon: LayoutGrid },
] as const;

function ResidentDashboard() {
  const { user } = useAuth();
  const propertyId = user?.propertyId ?? "PRP-0007";
  const { data: invoices = [] } = useQuery({ queryKey: ["invoices"], queryFn: () => invoiceService.all() });
  const { data: visitors = [] } = useQuery({ queryKey: ["visitors"], queryFn: () => visitorService.all() });
  const { data: notices = [] } = useQuery({ queryKey: ["announcements"], queryFn: () => announcementService.all() });
  const { data: complaints = [] } = useQuery({ queryKey: ["complaints"], queryFn: () => complaintService.all() });
  const { data: bookings = [] } = useQuery({ queryKey: ["bookings"], queryFn: () => bookingService.all() });
  const { data: orders = [] } = useQuery({ queryKey: ["service-orders"], queryFn: () => serviceOrderService.all() });
  const { data: places = [] } = useQuery({ queryKey: ["nearby-places"], queryFn: () => nearbyPlaceService.all() });
  const { data: events = [] } = useQuery({ queryKey: ["events"], queryFn: () => eventService.all() });

  const myInvoices = invoices.filter((i) => i.propertyId === propertyId);
  const due = myInvoices.filter((i) => i.status !== "paid");
  const outstanding = due.reduce((s, i) => s + (i.amount - i.paid), 0);
  const myVisitors = visitors.filter((v) => v.propertyId === propertyId);
  const myComplaints = complaints.filter((c) => c.block === (user?.block ?? "Block C") && c.status !== "closed");
  const myBookings = bookings.filter((b) => b.propertyId === propertyId);
  const myOrders = orders.slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name ?? "Resident"}`}
        description={`${user?.block ?? "Block C"} · ${propertyId} — your home, family, services and community.`}
        breadcrumb={["Resident", "Home"]}
      />
      <div className="space-y-4 p-4 sm:p-6">
        <Section title="Quick actions" description="Everything you use most, one tap away">
          <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-5">
            {QUICK.map((q) => {
              const Icon = q.icon;
              return (
                <Link key={q.to} to={q.to} className="flex flex-col items-center gap-1.5 rounded border border-border p-3 text-center text-xs hover:bg-accent">
                  <Icon className="size-5 text-primary" />
                  {q.label}
                </Link>
              );
            })}
          </div>
        </Section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Outstanding dues" value={bdt(outstanding, true)} hint={`${due.length} unpaid bills`} icon={CreditCard} tone={outstanding > 0 ? "warning" : "success"} />
          <KpiCard label="Visitors today" value={String(myVisitors.filter((v) => v.status === "approved" || v.status === "checked_in").length)} hint={`${myVisitors.length} passes on record`} icon={ShieldCheck} tone="info" />
          <KpiCard label="Open complaints" value={String(myComplaints.length)} hint="Being handled by operations" icon={Wrench} tone={myComplaints.length ? "warning" : "success"} />
          <KpiCard label="Service orders" value={String(myOrders.length)} hint="Pickup, processing and returns" icon={Sparkles} tone="neutral" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Recent bills" description="Service charge and utilities">
            <ul className="divide-y divide-border">
              {due.slice(0, 5).map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{i.head.replace(/_/g, " ")}</span>
                    <span className="block text-xs text-muted-foreground">{i.id} · due {i.dueDate}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="tabular text-sm">{bdt(i.amount)}</span>
                    <StatusBadge value={i.status} />
                  </span>
                </li>
              ))}
              {due.length === 0 ? <li className="px-4 py-3 text-sm text-muted-foreground">All bills settled.</li> : null}
            </ul>
          </Section>

          <Section title="Service orders" description="Controlled pickup and return through the caretaker">
            <ul className="divide-y divide-border">
              {myOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{o.service} · {o.providerName}</span>
                    <span className="block truncate text-xs text-muted-foreground">{o.scheduledDate} · pickup {o.pickupWindow}</span>
                  </span>
                  <StatusBadge value={o.status} />
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Upcoming bookings" description="Community facilities">
            <ul className="divide-y divide-border">
              {myBookings.slice(0, 5).map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{b.facility}</span>
                    <span className="block text-xs text-muted-foreground">{b.date} · {b.slot}</span>
                  </span>
                  <StatusBadge value={b.status} />
                </li>
              ))}
              {myBookings.length === 0 ? <li className="px-4 py-3 text-sm text-muted-foreground">No bookings yet.</li> : null}
            </ul>
          </Section>

          <Section title="Community notices" description="From the welfare society">
            <ul className="divide-y divide-border">
              {notices.slice(0, 6).map((n) => (
                <li key={n.id} className="px-4 py-2.5">
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium">{n.title}</span>
                    <StatusBadge value={n.priority} />
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">{n.body}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Nearby services" description="Verified shops and services around Bashundhara R/A">
            <ul className="divide-y divide-border">
              {places.slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{p.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{p.category.replace(/_/g, " ")} · {p.distanceKm} km</span>
                  </span>
                  <StatusBadge value={p.openNow ? "open" : "closed"} />
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Community events" description="What's happening this month">
            <ul className="divide-y divide-border">
              {events.slice(0, 5).map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{e.title}</span>
                    <span className="block text-xs text-muted-foreground">{e.date} · {e.venue}</span>
                  </span>
                  <Bell className="size-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </>
  );
}
