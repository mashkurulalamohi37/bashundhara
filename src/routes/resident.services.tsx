import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ModulePage } from "@/components/app/module-page";
import { serviceRequestService, serviceOrderService } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { Section, StatusBadge } from "@/components/app/primitives";
import type { Column } from "@/components/app/data-table";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/resident/services")({
  head: () => ({
    meta: [
      { title: "My Services — Bashundhara R/A" },
      { name: "description", content: "Request laundry, AC servicing, plumbing and more from verified providers, and track caretaker handovers end to end." },
      { property: "og:title", content: "My Services — Bashundhara R/A" },
      { property: "og:description", content: "Raise service requests and follow the resident to caretaker to provider handover chain." },
    ],
  }),
  component: ResidentServices,
});

const columns: Column<any>[] = [
  { key: "id", header: "Request", className: "tabular" },
  { key: "title", header: "Need", render: (r) => <span className="font-medium">{r.title}</span> },
  { key: "category", header: "Category" },
  { key: "preferredDate", header: "Preferred", hideOnMobile: true },
  { key: "bids", header: "Bids", hideOnMobile: true },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

function ResidentServices() {
  const { user } = useAuth();
  const name = user?.name ?? "Resident";
  const { data: orders = [] } = useQuery({ queryKey: ["service-orders"], queryFn: () => serviceOrderService.all() });
  const service = useMemo(() => {
    const base = serviceRequestService as any;
    return {
      ...base,
      create: (payload: any) =>
        base.create({ ...payload, residentName: name, block: user?.block ?? "Block C", bids: 0, status: "open", createdOn: new Date().toISOString().slice(0, 10) }),
    };
  }, [name, user?.block]);

  return (
    <ModulePage
      title="My Services"
      description="Raise a request, collect bids from verified providers and track the controlled handover chain."
      breadcrumb={["Resident", "Services"]}
      service={service as never}
      queryKey="resident-service-requests"
      columns={columns}
      createFields={[
        { name: "title", label: "What do you need?", required: true },
        { name: "category", label: "Category", type: "select", options: ["laundry", "ac_service", "plumbing", "electrical", "cleaning", "pest_control", "appliance_repair", "carpentry"], required: true },
        { name: "location", label: "Where in the flat?", required: true },
        { name: "preferredDate", label: "Preferred date", type: "date", required: true },
        { name: "budgetFrom", label: "Budget from (BDT)", type: "number" },
        { name: "budgetTo", label: "Budget to (BDT)", type: "number" },
        { name: "pricingModel", label: "Pricing", type: "select", options: ["fixed_price", "quote_request", "competitive_bid"], required: true },
        { name: "description", label: "Details", type: "textarea" },
      ]}
      createLabel="Request a service"
      emptyTitle="No service requests"
      emptyDescription="Request laundry, AC servicing, plumbing and more."
      above={
        <Section title="Active service orders" description="Resident → Caretaker → Gate → Provider → Caretaker → Resident">
          <ul className="divide-y divide-border">
            {orders.slice(0, 6).map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="min-w-0">
                  <Link to="/services/orders/$orderId" params={{ orderId: o.id }} className="block truncate text-sm font-medium text-primary hover:underline">
                    {o.service} · {o.providerName}
                  </Link>
                  <span className="block truncate text-xs text-muted-foreground">
                    {o.scheduledDate} · pickup {o.pickupWindow} · OTP {o.otp} · {bdt(o.amount)}
                  </span>
                </span>
                <StatusBadge value={o.status} />
              </li>
            ))}
          </ul>
        </Section>
      }
    />
  );
}
