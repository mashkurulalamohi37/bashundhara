import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, KpiCard, Section, StatLine, StatusBadge } from "@/components/app/primitives";
import { DataTable, type Column, type FilterDef } from "@/components/app/data-table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { personService } from "@/services";
import { humanizeError } from "@/services/api";
import { titleize } from "@/lib/format";
import type { Person } from "@/types";

export const Route = createFileRoute("/_admin/control/people")({
  head: () => ({
    meta: [
      { title: "Unified Person Registry — Bashundhara R/A" },
      { name: "description", content: "One identity per person across owner, tenant, worker, staff and provider relationships." },
      { property: "og:title", content: "Unified Person Registry — Bashundhara R/A" },
      { property: "og:description", content: "One identity per person across owner, tenant, worker, staff and provider relationships." },
    ],
  }),
  component: Page,
});

const filters: FilterDef[] = [
  { key: "primaryRole", label: "Primary role", options: ["owner", "tenant", "resident", "family_member", "domestic_worker", "service_provider", "security_officer", "building_staff", "caretaker", "vendor_contact"] },
  { key: "verification", label: "Verification", options: ["verified", "pending", "rejected"] },
  { key: "accessLevel", label: "Access level", options: ["permanent", "temporary", "restricted", "none"] },
  { key: "status", label: "Status", options: ["active", "inactive"] },
];

function Page() {
  const rows = useQuery({ queryKey: ["people"], queryFn: () => personService.all() });
  const [detail, setDetail] = useState<Person | null>(null);
  const data = rows.data ?? [];

  const columns: Column<Person>[] = [
    { key: "id", header: "Person ID" },
    {
      key: "name", header: "Name",
      render: (r) => (
        <span className="flex items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-[11px] font-semibold text-accent-foreground">{r.photoInitials}</span>
          <span>{r.name}<span className="block text-xs text-muted-foreground">{r.nameBn}</span></span>
        </span>
      ),
    },
    { key: "primaryRole", header: "Primary role", render: (r) => titleize(r.primaryRole) },
    { key: "relationships", header: "Relationships", render: (r) => `${r.relationships.length} linked`, value: (r) => r.relationships.length },
    { key: "phone", header: "Phone", hideOnMobile: true },
    { key: "nid", header: "NID", hideOnMobile: true },
    { key: "accessLevel", header: "Access", render: (r) => <StatusBadge value={r.accessLevel} /> },
    { key: "verification", header: "Verification", render: (r) => <StatusBadge value={r.verification} /> },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Unified Person Registry"
        description="A single verified identity per human being — every role they hold in the community links back to it."
        breadcrumb={["Control", "People"]}
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border lg:grid-cols-4">
          <KpiCard label="Registered people" value={data.length} tone="primary" />
          <KpiCard label="Verified" value={data.filter((p) => p.verification === "verified").length} tone="success" />
          <KpiCard label="Pending verification" value={data.filter((p) => p.verification === "pending").length} tone="warning" />
          <KpiCard label="Multi-role identities" value={data.filter((p) => p.relationships.length > 1).length} tone="info" />
        </div>
        <DataTable<Person>
          rows={data}
          columns={columns}
          loading={rows.isLoading}
          error={rows.isError ? humanizeError(rows.error) : null}
          onRetry={() => void rows.refetch()}
          filters={filters}
          exportName="person-registry"
          searchPlaceholder="Search name, phone or NID…"
          onRowClick={(r) => setDetail(r)}
          rowActions={[
            { label: "Open identity", onSelect: (r) => setDetail(r) },
            { label: "Verify identity", onSelect: (r) => toast.success(`${r.name} verified`) },
            { label: "Suspend access", onSelect: (r) => toast.success(`Access suspended for ${r.name}`), destructive: true },
          ]}
        />
      </div>

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{detail?.name}</SheetTitle>
            <SheetDescription>{detail?.id} · {detail ? titleize(detail.primaryRole) : ""}</SheetDescription>
          </SheetHeader>
          {detail ? (
            <div className="space-y-4 px-4 pb-8">
              <dl>
                <StatLine label="Name (Bangla)" value={detail.nameBn} />
                <StatLine label="Phone" value={detail.phone} />
                <StatLine label="Email" value={detail.email} />
                <StatLine label="NID" value={detail.nid} />
                <StatLine label="Date of birth" value={detail.dob} />
                <StatLine label="Gender" value={titleize(detail.gender)} />
                <StatLine label="Access level" value={<StatusBadge value={detail.accessLevel} />} />
                <StatLine label="Verification" value={<StatusBadge value={detail.verification} />} />
                <StatLine label="Registered on" value={detail.registeredOn} />
              </dl>
              <Section title="Relationships" description="Every role this identity holds">
                <ul className="divide-y divide-border">
                  {detail.relationships.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                      <span>
                        {titleize(r.kind)}
                        <span className="block text-xs text-muted-foreground">{titleize(r.targetType)} · {r.target}</span>
                      </span>
                      <span className="text-right text-xs text-muted-foreground">
                        since {r.since}
                        {r.until ? <span className="block">until {r.until}</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => toast.success(`Access pass issued to ${detail.name}`)}>Issue access pass</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success(`Merge review started for ${detail.id}`)}>Merge duplicate</Button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
