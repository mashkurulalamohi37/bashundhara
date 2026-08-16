import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge, TableSkeleton, EmptyState, StatLine } from "@/components/app/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  flatService, flatDossierService, visitorService, vehicleService, parkingService,
  invoiceService, complaintService, documentService,
} from "@/services";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/flats/$flatId")({
  head: ({ params }) => ({
    meta: [
      { title: `Flat ${params.flatId} dossier — Bashundhara R/A` },
      { name: "description", content: "Complete flat dossier: owners, tenant and lease, household, authorized residents, domestic workers, vehicles, payments and history." },
      { property: "og:title", content: `Flat ${params.flatId} — Bashundhara R/A` },
      { property: "og:description", content: "Owner, tenant, family, worker, vehicle, payment and occupancy record for a single flat." },
    ],
  }),
  component: FlatDetail,
});

function Rows({ rows, cols }: { rows: readonly any[]; cols: { key: string; label: string }[] }) {
  if (rows.length === 0) return <EmptyState title="Nothing recorded" description="No records linked to this flat yet." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            {cols.map((c) => <th key={c.key} className="px-4 py-2 font-medium">{c.label}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={String(r["id"] ?? i)} className="hover:bg-accent/40">
              {cols.map((c) => {
                const v = r[c.key];
                const isStatus = /status|verification|paymentStatus|accessLevel|occupancy/i.test(c.key);
                return (
                  <td key={c.key} className="px-4 py-2 align-middle">
                    {v == null || v === "" ? "—" : isStatus ? <StatusBadge value={String(v)} /> : String(v)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FlatDetail() {
  const { flatId } = Route.useParams();
  const { data: flat, isLoading } = useQuery({ queryKey: ["flat", flatId], queryFn: () => flatService.get(flatId) });
  const { data: dossier } = useQuery({ queryKey: ["flat-dossier", flatId], queryFn: () => flatDossierService.get(flatId) });
  const { data: visitors = [] } = useQuery({ queryKey: ["visitors"], queryFn: () => visitorService.all() });
  const { data: vehicles = [] } = useQuery({ queryKey: ["vehicles"], queryFn: () => vehicleService.all() });
  const { data: parking = [] } = useQuery({ queryKey: ["parking"], queryFn: () => parkingService.all() });
  const { data: invoices = [] } = useQuery({ queryKey: ["invoices"], queryFn: () => invoiceService.all() });
  const { data: complaints = [] } = useQuery({ queryKey: ["complaints"], queryFn: () => complaintService.all() });
  const { data: documents = [] } = useQuery({ queryKey: ["documents"], queryFn: () => documentService.all() });

  if (isLoading || !flat) {
    return <div className="p-6"><TableSkeleton rows={6} cols={4} /></div>;
  }

  const pid = flat.propertyId;
  const flatVisitors = visitors.filter((v) => v.propertyId === pid).slice(0, 25);
  const flatVehicles = vehicles.filter((v) => v.propertyId === pid);
  const flatInvoices = invoices.filter((i) => i.propertyId === pid);
  const flatComplaints = complaints.filter((c) => c.block === flat.block).slice(0, 20);
  const flatParking = parking.filter((p) => p.allocatedTo === pid || p.block === flat.block).slice(0, 12);
  const flatDocs = documents.filter((d) => d.category === "property" || d.category === "lease" || d.category === "ownership").slice(0, 15);
  const outstanding = flatInvoices.reduce((s, i) => s + (i.amount - i.paid), 0);
  const owners = dossier?.owners ?? [];
  const tenants = dossier?.tenants ?? [];

  return (
    <>
      <PageHeader
        title={`Flat ${flat.number}`}
        description={`${flat.block} · ${flat.sizeSqft} sqft · ${flat.bedrooms} bedrooms · monthly charge ${bdt(flat.monthlyCharge)}`}
        breadcrumb={["Community", "Flats", flat.id]}
        actions={
          <Link to="/flats" className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-sm hover:bg-accent">
            <ArrowLeft className="size-4" /> All flats
          </Link>
        }
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Occupancy" value={flat.occupancy === "occupied" ? "Occupied" : "Vacant"} hint={`${owners.length} owner(s) on record`} tone={flat.occupancy === "occupied" ? "success" : "neutral"} />
          <KpiCard label="Current tenant" value={tenants[0]?.name ?? "Owner occupied"} hint={tenants[0] ? `Lease to ${tenants[0].leaseEnd}` : "No active lease"} tone="info" />
          <KpiCard label="Outstanding" value={bdt(outstanding, true)} hint={`${flatInvoices.length} bills issued`} tone={outstanding > 0 ? "warning" : "success"} />
          <KpiCard label="People linked" value={String((dossier?.familyMembers.length ?? 0) + (dossier?.authorizedResidents.length ?? 0) + (dossier?.domesticWorkers.length ?? 0))} hint="Family, authorized residents & workers" tone="neutral" />
        </div>

        <Section title="Flat dossier" description="Ownership, tenancy, household and activity in one record">
          <Tabs defaultValue="overview" className="p-3">
            <TabsList className="flex w-full flex-wrap justify-start gap-1">
              {["overview","owners","tenant","family","residents","workers","vehicles","parking","visitors","payments","complaints","documents","history"].map((t) => (
                <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="pt-3">
              <dl className="grid gap-x-8 sm:grid-cols-2">
                <StatLine label="Flat ID" value={flat.id} />
                <StatLine label="Property" value={flat.propertyId} />
                <StatLine label="Block" value={flat.block} />
                <StatLine label="Size" value={`${flat.sizeSqft} sqft`} />
                <StatLine label="Bedrooms" value={flat.bedrooms} />
                <StatLine label="Monthly charge" value={bdt(flat.monthlyCharge)} />
                <StatLine label="Owners" value={owners.map((o) => `${o.name} (${o.ownershipPct}%)`).join(", ") || "—"} />
                <StatLine label="Tenant" value={tenants[0]?.name ?? "—"} />
              </dl>
            </TabsContent>

            <TabsContent value="owners" className="pt-3">
              <Rows rows={owners} cols={[{key:"id",label:"Owner"},{key:"name",label:"Name"},{key:"ownershipPct",label:"Share %"},{key:"ownershipStart",label:"Since"},{key:"occupancy",label:"Occupancy"},{key:"phone",label:"Phone"},{key:"status",label:"Status"}]} />
            </TabsContent>
            <TabsContent value="tenant" className="pt-3">
              <Rows rows={tenants} cols={[{key:"id",label:"Tenant"},{key:"name",label:"Name"},{key:"leaseStart",label:"Lease start"},{key:"leaseEnd",label:"Lease end"},{key:"monthlyRent",label:"Rent"},{key:"securityDeposit",label:"Deposit"},{key:"paymentStatus",label:"Payment"}]} />
            </TabsContent>
            <TabsContent value="family" className="pt-3">
              <Rows rows={dossier?.households ?? []} cols={[{key:"id",label:"Household"},{key:"type",label:"Type"},{key:"headName",label:"Head"},{key:"members",label:"Members"},{key:"moveIn",label:"Move in"},{key:"status",label:"Status"}]} />
              <div className="pt-3">
                <Rows rows={dossier?.familyMembers ?? []} cols={[{key:"name",label:"Member"},{key:"relationship",label:"Relationship"},{key:"gender",label:"Gender"},{key:"dob",label:"DOB"},{key:"phone",label:"Phone"},{key:"accessLevel",label:"Access"},{key:"status",label:"Status"}]} />
              </div>
            </TabsContent>
            <TabsContent value="residents" className="pt-3">
              <Rows rows={dossier?.authorizedResidents ?? []} cols={[{key:"name",label:"Name"},{key:"category",label:"Category"},{key:"sponsorName",label:"Sponsor"},{key:"authorizedFrom",label:"From"},{key:"authorizedTo",label:"To"},{key:"accessLevel",label:"Access"},{key:"status",label:"Status"}]} />
            </TabsContent>
            <TabsContent value="workers" className="pt-3">
              <Rows rows={dossier?.domesticWorkers ?? []} cols={[{key:"name",label:"Worker"},{key:"workerType",label:"Type"},{key:"employerName",label:"Employer"},{key:"accessWindow",label:"Access window"},{key:"passCode",label:"Pass"},{key:"verification",label:"Verification"},{key:"status",label:"Status"}]} />
            </TabsContent>
            <TabsContent value="vehicles" className="pt-3">
              <Rows rows={flatVehicles} cols={[{key:"registration",label:"Registration"},{key:"type",label:"Type"},{key:"brand",label:"Brand"},{key:"ownerName",label:"Owner"},{key:"sticker",label:"Sticker"},{key:"status",label:"Status"}]} />
            </TabsContent>
            <TabsContent value="parking" className="pt-3">
              <Rows rows={flatParking} cols={[{key:"code",label:"Slot"},{key:"zone",label:"Zone"},{key:"type",label:"Type"},{key:"allocatedTo",label:"Allocated to"},{key:"monthlyFee",label:"Fee"},{key:"status",label:"Status"}]} />
            </TabsContent>
            <TabsContent value="visitors" className="pt-3">
              <Rows rows={flatVisitors} cols={[{key:"name",label:"Visitor"},{key:"category",label:"Category"},{key:"host",label:"Host"},{key:"gate",label:"Gate"},{key:"date",label:"Date"},{key:"time",label:"Time"},{key:"status",label:"Status"}]} />
            </TabsContent>
            <TabsContent value="payments" className="pt-3">
              <Rows rows={flatInvoices} cols={[{key:"id",label:"Invoice"},{key:"head",label:"Head"},{key:"amount",label:"Amount"},{key:"paid",label:"Paid"},{key:"dueDate",label:"Due"},{key:"status",label:"Status"}]} />
            </TabsContent>
            <TabsContent value="complaints" className="pt-3">
              <Rows rows={flatComplaints} cols={[{key:"id",label:"Complaint"},{key:"title",label:"Title"},{key:"category",label:"Category"},{key:"assignedTo",label:"Assigned"},{key:"createdAt",label:"Created"},{key:"status",label:"Status"}]} />
            </TabsContent>
            <TabsContent value="documents" className="pt-3">
              <Rows rows={flatDocs} cols={[{key:"id",label:"Doc"},{key:"name",label:"Name"},{key:"category",label:"Category"},{key:"owner",label:"Owner"},{key:"uploadedAt",label:"Uploaded"},{key:"verification",label:"Verification"}]} />
            </TabsContent>
            <TabsContent value="history" className="pt-3">
              <ol className="space-y-2 text-sm">
                {owners.map((o) => (
                  <li key={o.id} className="rounded border border-border p-3">
                    <span className="font-medium">Ownership · {o.name}</span>
                    <span className="block text-xs text-muted-foreground">{o.ownershipStart} → {o.ownershipEnd ?? "present"} · {o.ownershipPct}% share</span>
                  </li>
                ))}
                {tenants.map((t) => (
                  <li key={t.id} className="rounded border border-border p-3">
                    <span className="font-medium">Tenancy · {t.name}</span>
                    <span className="block text-xs text-muted-foreground">{t.leaseStart} → {t.leaseEnd} · rent {bdt(t.monthlyRent)}</span>
                  </li>
                ))}
                {(dossier?.serviceOrders ?? []).slice(0, 8).map((o) => (
                  <li key={o.id} className="rounded border border-border p-3">
                    <span className="font-medium">Service order · {o.service}</span>
                    <span className="block text-xs text-muted-foreground">{o.scheduledDate} · {o.providerName} · {o.status.replace(/_/g, " ")}</span>
                  </li>
                ))}
              </ol>
            </TabsContent>
          </Tabs>
        </Section>
      </div>
    </>
  );
}
