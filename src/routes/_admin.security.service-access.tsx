import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { QrCode, ShieldCheck, ShieldX, UserCheck } from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { accessControlService, accessPassService } from "@/services";
import { humanizeError } from "@/services/api";
import { titleize } from "@/lib/format";

export const Route = createFileRoute("/_admin/security/service-access")({
  head: () => ({
    meta: [
      { title: "Service Provider Access — Bashundhara R/A" },
      { name: "description", content: "Gate desk view of today's service providers: who is authorized, why, for which flat, for how long and which zones they may enter." },
      { property: "og:title", content: "Service Provider Access — Bashundhara R/A" },
      { property: "og:description", content: "Verify service access passes and control provider movement inside the community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ServiceAccess,
});

function ServiceAccess() {
  const [code, setCode] = useState("");
  const { data: passes = [], isLoading, refetch } = useQuery({ queryKey: ["access-passes"], queryFn: () => accessPassService.all() });
  const providers = passes.filter((p) => p.personType === "service_provider" || p.personType === "delivery");

  const verify = useMutation({
    mutationFn: (value: string) => accessControlService.verifyPass(value),
    onSuccess: (r) => toast.success(`Pass ${r.code} verified`, { description: r.zoneAccess }),
    onError: (e) => toast.error(humanizeError(e)),
  });
  const decide = useMutation({
    mutationFn: (v: { id: string; decision: "allow" | "deny" }) => accessControlService.decide(v.id, v.decision),
    onSuccess: (r) => {
      toast.success(`${r.id} — ${r.decision === "allow" ? "entry allowed" : "entry denied"}`, {
        description: r.decision === "allow" ? "Caretaker notified for handover." : "Recorded in the access log.",
      });
      void refetch();
    },
    onError: (e) => toast.error(humanizeError(e)),
  });

  const count = (s: string) => providers.filter((p) => p.status === s).length;

  return (
    <>
      <PageHeader
        title="Service Provider Access"
        description="Providers never get free movement — each pass is time-bound, flat-linked and zone-restricted to the collection point."
        breadcrumb={["Security", "Service Provider Access"]}
      />
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid gap-px overflow-hidden rounded-md sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Expected today" value={String(count("expected"))} hint="Scheduled arrivals" icon={QrCode} tone="info" />
          <KpiCard label="At gate" value={String(count("at_gate"))} hint="Awaiting verification" icon={ShieldCheck} tone="warning" />
          <KpiCard label="Inside" value={String(count("inside") + count("at_collection_point"))} hint="Within authorized zone" icon={UserCheck} tone="primary" />
          <KpiCard label="Denied" value={String(count("denied") + count("expired"))} hint="Rejected or expired passes" icon={ShieldX} tone="danger" />
        </div>

        <Section title="Verify a pass" description="Scan the QR code or type the pass code from the provider's service order">
          <form
            className="flex flex-wrap items-center gap-2 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (code.trim()) verify.mutate(code.trim());
            }}
          >
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="SAP-1234" className="h-9 max-w-xs tabular" aria-label="Access pass code" />
            <Button type="submit" size="sm" disabled={verify.isPending}>
              <QrCode className="size-4" /> {verify.isPending ? "Verifying…" : "Verify pass"}
            </Button>
          </form>
        </Section>

        <Section title="Today's service providers" description="Provider · service · flat · gate · window · authorized zone">
          {isLoading ? (
            <TableSkeleton rows={8} cols={6} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Pass</th>
                    <th className="px-4 py-2 text-left font-medium">Provider</th>
                    <th className="px-4 py-2 text-left font-medium">Purpose</th>
                    <th className="px-4 py-2 text-left font-medium">Flat</th>
                    <th className="px-4 py-2 text-left font-medium">Gate</th>
                    <th className="px-4 py-2 text-left font-medium">Valid window</th>
                    <th className="px-4 py-2 text-left font-medium">Zone access</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    <th className="px-4 py-2 text-right font-medium">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {providers.slice(0, 30).map((p) => (
                    <tr key={p.id} className="hover:bg-accent/50">
                      <td className="tabular px-4 py-2">{p.passCode}</td>
                      <td className="px-4 py-2 font-medium">{p.personName}</td>
                      <td className="px-4 py-2 text-muted-foreground">{p.purpose}</td>
                      <td className="px-4 py-2">{p.flatId}</td>
                      <td className="px-4 py-2">{p.gate}</td>
                      <td className="tabular px-4 py-2 text-xs">{p.validFrom.slice(-5)}–{p.validTo.slice(-5)}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{p.zoneAccess}</td>
                      <td className="px-4 py-2"><StatusBadge value={p.status} /></td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="outline" onClick={() => decide.mutate({ id: p.id, decision: "allow" })}>Allow</Button>
                          <Button size="sm" variant="ghost" onClick={() => decide.mutate({ id: p.id, decision: "deny" })}>Deny</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section title="Access legend" description="Security sees authorization scope only — never rent, balances or private household data">
          <ul className="grid gap-2 p-4 text-sm text-muted-foreground sm:grid-cols-2">
            {["service_provider", "domestic_worker", "delivery", "contractor", "visitor"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <StatusBadge value={t} />
                <span>{titleize(t)} passes carry their own zone rules and verification workflow.</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  );
}
