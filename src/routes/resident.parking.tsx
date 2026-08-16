import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Section, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { parkingService, vehicleService } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/resident/parking")({
  head: () => ({
    meta: [
      { title: "My Parking — Bashundhara R/A" },
      { name: "description", content: "Parking slots allocated to your flat, monthly fees, visitor parking availability and zone details." },
      { property: "og:title", content: "My Parking — Bashundhara R/A" },
      { property: "og:description", content: "Allocated slots and visitor parking availability for your block." },
    ],
  }),
  component: ResidentParking,
});

function ResidentParking() {
  const { user } = useAuth();
  const block = user?.block ?? "Block C";
  const propertyId = user?.propertyId ?? "PRP-0007";
  const { data: spaces = [], isLoading } = useQuery({ queryKey: ["parking-spaces"], queryFn: () => parkingService.all() });
  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: () => vehicleService.all() });

  const mine = spaces.filter((s) => s.allocatedTo === propertyId);
  const visitor = spaces.filter((s) => s.block === block && s.type === "visitor");

  return (
    <>
      <PageHeader title="My Parking" description={`Slots allocated to ${propertyId} and visitor parking availability in ${block}.`} breadcrumb={["Resident", "Parking"]} />
      <div className="space-y-4 p-4 sm:p-6">
        {isLoading ? <TableSkeleton rows={4} cols={3} /> : (
          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Allocated slots" description="Billed with your monthly service charge">
              <ul className="divide-y divide-border">
                {mine.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                    <span>{s.code} · <span className="text-muted-foreground">{s.zone} · {bdt(s.monthlyFee)}/mo</span></span>
                    <StatusBadge value={s.status} />
                  </li>
                ))}
                {mine.length === 0 ? <li className="px-4 py-3 text-sm text-muted-foreground">No slot allocated. Contact the management office.</li> : null}
              </ul>
            </Section>
            <Section title="Visitor parking" description={`Availability in ${block}`}>
              <ul className="divide-y divide-border">
                {visitor.slice(0, 10).map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                    <span>{s.code} · <span className="text-muted-foreground">{s.zone}</span></span>
                    <StatusBadge value={s.status} />
                  </li>
                ))}
              </ul>
            </Section>
            <Section title="My vehicles" description="Linked to the slots above">
              <ul className="divide-y divide-border">
                {vehicles.filter((v) => v.propertyId === propertyId).map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                    <span>{v.registration} · <span className="text-muted-foreground">{v.brand} {v.model}</span></span>
                    <StatusBadge value={v.status} />
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        )}
      </div>
    </>
  );
}
