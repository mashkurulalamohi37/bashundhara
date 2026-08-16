import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck, Boxes, ClipboardCheck, FileWarning, Gauge, Radio, ShieldCheck, Siren, Timer, Users,
} from "lucide-react";
import { PageHeader, KpiCard, Section, TableSkeleton } from "@/components/app/primitives";
import { controlService } from "@/services";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/control/")({
  head: () => ({
    meta: [
      { title: "Enterprise Control Center — Bashundhara R/A" },
      { name: "description", content: "Identity, access, SLA, workflow, inventory and compliance health in one operational view." },
      { property: "og:title", content: "Enterprise Control Center — Bashundhara R/A" },
      { property: "og:description", content: "Identity, access, SLA, workflow, inventory and compliance health in one operational view." },
    ],
  }),
  component: Page,
});

const LINKS = [
  { to: "/control/ops-board", label: "Live Ops Board", icon: Radio, hint: "Real-time request management" },
  { to: "/control/people", label: "Person registry", icon: Users, hint: "One identity, many roles" },
  { to: "/control/access-policies", label: "Access policies", icon: ShieldCheck, hint: "Who may enter where and when" },
  { to: "/control/zones", label: "Access zones", icon: BadgeCheck, hint: "Community to flat hierarchy" },
  { to: "/control/sla", label: "SLA rules", icon: Timer, hint: "Response and resolution targets" },
  { to: "/control/escalations", label: "Escalation matrix", icon: Siren, hint: "Automatic role ladders" },
  { to: "/control/workflows", label: "Approval workflows", icon: ClipboardCheck, hint: "Multi-step sign-off" },
  { to: "/control/dispatch", label: "Emergency dispatch", icon: Radio, hint: "SOS to resolution" },
  { to: "/control/compliance", label: "Compliance", icon: FileWarning, hint: "Licences and expiries" },
  { to: "/control/meters", label: "Meters", icon: Gauge, hint: "Consumption and billing" },
  { to: "/inventory/items", label: "Inventory", icon: Boxes, hint: "Stores and reorder levels" },
] as const;

function Page() {
  const { data } = useQuery({ queryKey: ["control-summary"], queryFn: () => controlService.summary() });

  return (
    <>
      <PageHeader
        title="Enterprise Control Center"
        description="Identity, access, service levels, approvals, stock and compliance — the operational backbone."
        breadcrumb={["Control", "Overview"]}
      />
      <div className="space-y-4 p-4 sm:p-6">
        {!data ? <Section><TableSkeleton rows={6} cols={4} /></Section> : (
          <>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border lg:grid-cols-5">
              <KpiCard label="Registered people" value={data.people} icon={Users} tone="primary" hint={`${data.verifiedPeople} verified`} />
              <KpiCard label="Active access policies" value={data.activePolicies} icon={ShieldCheck} tone="info" hint={`${data.expiringPolicies} expired`} />
              <KpiCard label="Open tickets" value={data.openTickets} icon={Timer} tone="warning" hint={`${data.breachedTickets} SLA breached`} />
              <KpiCard label="Pending approvals" value={data.pendingApprovals} icon={ClipboardCheck} tone="warning" />
              <KpiCard label="Avg SOS response" value={`${data.avgResponseMinutes} min`} icon={Siren} tone="success" />
            </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-border lg:grid-cols-4">
              <KpiCard label="Stock value" value={bdt(data.stockValue, true)} icon={Boxes} tone="primary" />
              <KpiCard label="Items needing action" value={data.lowStockItems} tone="warning" hint="Low, reorder or out of stock" />
              <KpiCard label="Documents expiring" value={data.expiringDocuments} icon={FileWarning} tone="warning" hint={`${data.expiredDocuments} already expired`} />
              <KpiCard label="Unbilled meters" value={data.unbilledMeters} icon={Gauge} tone="info" />
            </div>
            <Section title="Control workspaces">
              <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
                {LINKS.map((l) => (
                  <Link key={l.to} to={l.to} className="flex items-start gap-3 bg-card p-4 hover:bg-accent">
                    <l.icon className="mt-0.5 size-4 text-primary" />
                    <span>
                      <span className="block text-sm font-medium">{l.label}</span>
                      <span className="block text-xs text-muted-foreground">{l.hint}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </Section>
          </>
        )}
      </div>
    </>
  );
}
