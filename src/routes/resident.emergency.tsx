import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle, Flame, HeartPulse, ShieldAlert, Zap, Droplets, PhoneCall,
  Siren, CheckCircle2, Clock, MapPin, Radio, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Section, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { emergencyService } from "@/services";
import { opsStore } from "@/services/opsStore";
import { useAuth } from "@/hooks/useAuth";
import { humanizeError } from "@/services/api";

export const Route = createFileRoute("/resident/emergency")({
  head: () => ({
    meta: [
      { title: "Emergency SOS — Bashundhara R/A" },
      { name: "description", content: "Raise a medical, fire, security, gas or electrical emergency and alert the Bashundhara R/A control room instantly." },
      { property: "og:title", content: "Emergency SOS — Bashundhara R/A" },
      { property: "og:description", content: "One-tap SOS to the community control room with live response status." },
    ],
  }),
  component: EmergencyPage,
});

const TYPES = [
  { type: "medical", label: "Medical Emergency", icon: HeartPulse, color: "bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20" },
  { type: "fire", label: "Fire / Smoke Alert", icon: Flame, color: "bg-orange-500/10 text-orange-600 border-orange-500/30 hover:bg-orange-500/20" },
  { type: "security", label: "Security Threat / Intrusion", icon: ShieldAlert, color: "bg-purple-500/10 text-purple-600 border-purple-500/30 hover:bg-purple-500/20" },
  { type: "gas", label: "Gas Leak", icon: AlertTriangle, color: "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20" },
  { type: "electrical", label: "Electrical Short Circuit", icon: Zap, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/20" },
  { type: "water", label: "Major Water Burst", icon: Droplets, color: "bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20" },
] as const;

const HOTLINES = [
  { name: "Bashundhara Control Room (24/7)", number: "+880 9612 000 000", tag: "Fastest Response · Gate 1" },
  { name: "Evercare Hospital Emergency", number: "10678", tag: "Plot 81, Block E" },
  { name: "Kuril Fire & Rescue Station", number: "+880 2 841 2222", tag: "Fire Unit 4" },
  { name: "Vatara Police Station Patrol", number: "+880 2 841 5555", tag: "Dhaka Metro Police" },
];

function EmergencyPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeSOS, setActiveSOS] = useState<string | null>(null);
  const { data = [], isLoading } = useQuery({ queryKey: ["resident-emergencies"], queryFn: () => emergencyService.all() });

  const raise = useMutation({
    mutationFn: async (type: string) => {
      // 1. Post to local emergency service
      const res = await emergencyService.create({
        type: type as never,
        resident: user?.name ?? "Tanvir Hasan",
        propertyId: user?.propertyId ?? "PRP-0007",
        block: user?.block ?? "Block A",
        location: `${user?.block ?? "Block A"} · Flat 4B · Meghna Tower`,
        status: "in_progress",
        raisedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
        responseMins: 2,
        team: "Security Rapid Response Unit 1",
      } as never);

      // 2. Also register in live Ops Board for central control room visibility
      opsStore.addRequest({
        type: "emergency",
        category: type.toUpperCase(),
        title: `🚨 SOS: ${type.toUpperCase()} Emergency at Flat 4B`,
        description: `Triggered by resident ${user?.name ?? "Tanvir Hasan"} at ${user?.block ?? "Block A"} (Flat 4B, Meghna Tower). Immediate dispatch requested.`,
        priority: "urgent",
        requesterName: user?.name ?? "Tanvir Hasan",
        flatId: "4B",
        buildingId: "BLD-004",
        block: user?.block ?? "Block A",
        department: "Security Operations",
        assignedRole: "Security Officer",
        assigneeName: "Rakib Sarker (Patrol Unit 1)",
        handlingMode: "self_service",
        needsAccessPass: true,
        slaMinutes: 5,
      });

      return res;
    },
    onSuccess: (_d, type) => {
      setActiveSOS(type);
      toast.error(`🚨 ${type.toUpperCase()} SOS DISPATCHED`, {
        description: "Control Room & Rapid Response Patrol have been alerted and dispatched to your flat.",
        duration: 8000,
      });
      void qc.invalidateQueries({ queryKey: ["resident-emergencies"] });
    },
    onError: (e) => toast.error(humanizeError(e)),
  });

  const mine = data.filter((e) => e.propertyId === (user?.propertyId ?? "PRP-0007"));

  return (
    <>
      <PageHeader
        title="Emergency SOS & Rapid Response"
        description="One-tap high-priority emergency broadcast to the 24/7 Bashundhara Community Command Center and on-duty security patrol."
        breadcrumb={["Resident", "Emergency"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        {/* Active Emergency Banner if Triggered */}
        {activeSOS && (
          <div className="rounded-xl border border-destructive bg-destructive/10 p-5 animate-pulse text-destructive">
            <div className="flex items-start gap-4">
              <Siren className="size-8 text-destructive animate-spin shrink-0" />
              <div className="space-y-1">
                <h3 className="font-bold text-lg">EMERGENCY ACTIVE: {activeSOS.toUpperCase()}</h3>
                <p className="text-sm">
                  Patrol Unit 1 and Caretaker Jamal Uddin have received your location (<strong>Flat 4B, Meghna Tower, {user?.block ?? "Block A"}</strong>).
                </p>
                <div className="flex items-center gap-2 pt-2 text-xs font-semibold">
                  <Badge variant="destructive">Status: Dispatched</Badge>
                  <span>ETA: ~2 minutes</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SOS Action Tiles */}
        <Section title="Broadcast Immediate SOS" description="Tap an emergency category. Dispatch happens instantaneously.">
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.type}
                  onClick={() => raise.mutate(t.type)}
                  disabled={raise.isPending}
                  className={`flex items-center gap-4 rounded-xl border p-5 text-left transition-all shadow-sm ${t.color} disabled:opacity-60`}
                >
                  <div className="rounded-xl bg-background/80 p-3 shadow-inner">
                    <Icon className="size-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{t.label}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Alerts Control Room & Patrol</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Emergency Hotlines Directory */}
        <Section title="Community Emergency Contacts" description="Direct 24/7 hotlines for immediate telephone coordination">
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            {HOTLINES.map((h) => (
              <div key={h.name} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors">
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-sm text-foreground">{h.name}</h4>
                  <p className="text-xs text-muted-foreground">{h.tag}</p>
                </div>
                <Button size="sm" variant="outline" className="font-mono text-xs gap-1.5 h-8" asChild>
                  <a href={`tel:${h.number.replace(/\s+/g, "")}`}>
                    <PhoneCall className="size-3.5 text-primary" /> {h.number}
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </Section>

        {/* Incident History Table */}
        <Section title="My Flat's Emergency History" description="Status and audit records of recent emergency requests">
          {isLoading ? (
            <TableSkeleton rows={3} cols={3} />
          ) : (
            <ul className="divide-y divide-border">
              {mine.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted/10 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold capitalize text-foreground">{e.type} SOS · {e.id}</span>
                      <StatusBadge value={e.status} />
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Clock className="size-3" /> {e.raisedAt} · {e.team}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">24/7 Logged</Badge>
                </li>
              ))}
              {mine.length === 0 && (
                <li className="p-6 text-center text-sm text-muted-foreground">
                  <ShieldCheck className="size-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  No active or past emergency incidents on record for your flat.
                </li>
              )}
            </ul>
          )}
        </Section>
      </div>
    </>
  );
}
