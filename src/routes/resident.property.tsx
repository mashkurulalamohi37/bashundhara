import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge, TableSkeleton, EmptyState } from "@/components/app/primitives";
import { flatService, flatDossierService, vehicleService, parkingService } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/resident/property")({
  head: () => ({
    meta: [
      { title: "My Property — Bashundhara R/A" },
      { name: "description", content: "Your flat details: ownership, tenancy and lease, household, vehicles, parking and monthly charges." },
      { property: "og:title", content: "My Property — Bashundhara R/A" },
      { property: "og:description", content: "Flat ownership, lease and occupancy record for your Bashundhara R/A home." },
    ],
  }),
  component: MyProperty,
});

function MyProperty() {
  const { user } = useAuth();
  const propertyId = user?.propertyId ?? "PRP-0007";
  const { data: flats = [], isLoading } = useQuery({ queryKey: ["flats"], queryFn: () => flatService.all() });
  const flat = flats.find((f) => f.propertyId === propertyId) ?? flats[0];
  const { data: dossier } = useQuery({ queryKey: ["flat-dossier", flat?.id], queryFn: () => flatDossierService.get(flat!.id), enabled: !!flat });
  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: () => vehicleService.all() });
  const { data: parking = [] } = useQuery({ queryKey: ["parking-spaces"], queryFn: () => parkingService.all() });

  if (isLoading || !flat) return <div className="p-6"><TableSkeleton rows={4} cols={3} /></div>;

  const owner = dossier?.owners[0];
  const tenant = dossier?.tenants[0];
  const myVehicles = vehicles.filter((v) => v.propertyId === propertyId);
  const mySlots = parking.filter((p) => p.allocatedTo === propertyId || p.allocatedTo === flat.number);

  return (
    <>
      <PageHeader
        title={`Flat ${flat.number}`}
        description={`${flat.block} · ${flat.sizeSqft} sqft · ${flat.bedrooms} bedrooms`}
        breadcrumb={["Resident", "My Property"]}
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Occupancy" value={flat.occupancy} hint={flat.block} icon={Building2} tone={flat.occupancy === "occupied" ? "success" : "warning"} />
          <KpiCard label="Monthly charge" value={bdt(flat.monthlyCharge)} hint="Service charge" icon={Building2} tone="neutral" />
          <KpiCard label="Vehicles" value={String(myVehicles.length)} hint="Registered to this flat" icon={Building2} tone="neutral" />
          <KpiCard label="Parking slots" value={String(mySlots.length)} hint="Allocated" icon={Building2} tone="neutral" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Ownership" description="Registered owner of record">
            {owner ? (
              <dl className="divide-y divide-border text-sm">
                <Row k="Owner" v={owner.name} />
                <Row k="Phone" v={owner.phone} />
                <Row k="Ownership share" v={`${owner.ownershipPct}%`} />
                <Row k="Owner since" v={owner.ownershipStart} />
              </dl>
            ) : <EmptyState title="No owner record" description="Ownership data is not linked to this flat yet." />}
          </Section>

          <Section title="Tenancy & lease" description="Current lease terms">
            {tenant ? (
              <dl className="divide-y divide-border text-sm">
                <Row k="Tenant" v={tenant.name} />
                <Row k="Lease" v={`${tenant.leaseStart} → ${tenant.leaseEnd}`} />
                <Row k="Monthly rent" v={bdt(tenant.monthlyRent)} />
                <Row k="Deposit" v={bdt(tenant.securityDeposit)} />
              </dl>
            ) : <EmptyState title="Owner occupied" description="No active tenancy on this flat." />}
          </Section>

          <Section title="Vehicles" description="Stickers issued to this flat">
            <ul className="divide-y divide-border">
              {myVehicles.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span>{v.registration} · <span className="text-muted-foreground">{v.brand} {v.model}</span></span>
                  <StatusBadge value={v.status} />
                </li>
              ))}
              {myVehicles.length === 0 ? <li className="px-4 py-3 text-sm text-muted-foreground">No vehicles registered.</li> : null}
            </ul>
          </Section>

          <Section title="Household & workers" description="People linked to this flat">
            <ul className="divide-y divide-border">
              {(dossier?.familyMembers ?? []).slice(0, 6).map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span>{m.name} · <span className="text-muted-foreground">{m.relationship}</span></span>
                  <StatusBadge value={m.status} />
                </li>
              ))}
              {(dossier?.domesticWorkers ?? []).slice(0, 4).map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span>{w.name} · <span className="text-muted-foreground">{w.workerType}</span></span>
                  <StatusBadge value={w.verification} />
                </li>
              ))}
            </ul>
            <div className="border-t border-border px-4 py-2.5 text-sm">
              <Link to="/resident/family" className="text-primary hover:underline">Manage family members</Link>
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
