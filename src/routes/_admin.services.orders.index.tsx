import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PackageCheck, ShieldCheck, Timer, TriangleAlert } from "lucide-react";
import { ModulePage } from "@/components/app/module-page";
import { KpiCard, StatusBadge } from "@/components/app/primitives";
import { serviceOrderService, marketplaceService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/services/orders/")({
  head: () => ({
    meta: [
      { title: "Service Orders — Bashundhara R/A" },
      { name: "description", content: "Every marketplace service order from request through gate verification, caretaker handover and resident confirmation." },
      { property: "og:title", content: "Service Orders — Bashundhara R/A" },
      { property: "og:description", content: "Controlled service order lifecycle with chain-of-custody tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  {
    key: "id",
    header: "Order ID",
    render: (r) => (
      <Link to="/services/orders/$orderId" params={{ orderId: String(r.id) }} className="tabular font-medium text-primary hover:underline">
        {r.id}
      </Link>
    ),
  },
  { key: "service", header: "Service", render: (r) => <span className="font-medium">{r.service}</span> },
  { key: "providerName", header: "Provider" },
  { key: "residentName", header: "Resident", hideOnMobile: true },
  { key: "flatId", header: "Flat" },
  { key: "gate", header: "Gate", hideOnMobile: true },
  { key: "scheduledDate", header: "Scheduled", className: "tabular", hideOnMobile: true },
  { key: "itemCount", header: "Items" },
  { key: "amount", header: "Amount", render: (r) => <span className="tabular">{bdt(Number(r.amount))}</span>, value: (r) => Number(r.amount) },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "status", label: "Lifecycle status", options: ["scheduled", "provider_approaching", "at_gate", "security_verified", "caretaker_assigned", "picked_up", "processing", "return_to_gate", "caretaker_received", "delivered", "resident_confirmed", "completed", "cancelled", "no_show", "disputed", "lost_damaged"] },
  { key: "paymentStatus", label: "Payment", options: ["unpaid", "paid", "refunded"] },
];

function Page() {
  const { data } = useQuery({ queryKey: ["marketplace-summary"], queryFn: () => marketplaceService.summary() });
  return (
    <ModulePage
      title="Service Orders"
      description="Requested → selected → gate verified → caretaker handover → processing → return → resident confirmed."
      breadcrumb={["Services", "Orders"]}
      service={serviceOrderService as never}
      queryKey="service-orders"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id} · ${r.service}`}
      above={
        <div className="grid gap-px overflow-hidden rounded-md sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Live orders" value={String(data?.liveOrders ?? "—")} hint="In the controlled workflow" icon={PackageCheck} tone="info" />
          <KpiCard label="Handover events" value={String(data?.handoversToday ?? "—")} hint="Chain-of-custody records" icon={Timer} tone="primary" />
          <KpiCard label="Verified providers" value={String(data?.verifiedProviders ?? "—")} hint="Community verified" icon={ShieldCheck} tone="success" />
          <KpiCard label="Open disputes" value={String(data?.openDisputes ?? "—")} hint="Awaiting resolution" icon={TriangleAlert} tone="warning" />
        </div>
      }
    />
  );
}
