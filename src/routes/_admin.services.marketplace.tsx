import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BadgeCheck, Gavel, Sparkles, Store, Timer, Calendar, Clock,
  MapPin, CheckCircle2, User, Phone, Loader2, ArrowRight, Star,
  ShieldCheck, Wrench, Package,
} from "lucide-react";
import { PageHeader, Section, KpiCard, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { marketplaceService, serviceProviderService, serviceRequestService } from "@/services";
import { opsStore } from "@/services/opsStore";
import { useAuth } from "@/hooks/useAuth";
import { bdt, titleize } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/services/marketplace")({
  head: () => ({
    meta: [
      { title: "Community Service Marketplace — Bashundhara R/A" },
      { name: "description", content: "Verified laundry, cleaning, AC, plumbing and household service providers with bids, trust scores and controlled community access." },
      { property: "og:title", content: "Community Service Marketplace — Bashundhara R/A" },
      { property: "og:description", content: "Verified providers, competitive bids and controlled service handovers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Marketplace,
});

interface ServiceBookingModalProps {
  provider: any;
  onClose: () => void;
}

function ServiceBookingModal({ provider, onClose }: ServiceBookingModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [residentName, setResidentName] = useState(user?.name ?? "Farhana Chowdhury");
  const [phone, setPhone] = useState(user?.phone ?? "+8801711234567");
  const [flat, setFlat] = useState("Flat 3B, Meghna Tower, Block A");
  const [serviceDate, setServiceDate] = useState("Tomorrow, 10:00 AM");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleBookService(e: React.FormEvent) {
    e.preventDefault();
    if (!residentName || !phone) {
      toast.error("Please provide your name and contact phone number.");
      return;
    }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));

    // Add to opsStore
    const newReq = opsStore.addRequest({
      type: "service",
      title: `${provider.business} - ${provider.category} Service`,
      description: notes || `Requested ${provider.services} from ${provider.business}. Location: ${flat}`,
      priority: "normal",
      requesterName: residentName,
      requesterPhone: phone,
      flatId: flat.split(",")[0]?.replace("Flat ", "") || "3B",
      block: user?.block ?? "Block A",
      assignedRole: "service_provider",
      department: "Services",
      slaMinutes: 60,
    });

    setBusy(false);
    toast.success(`Service request booked with ${provider.business}! Ticket: ${newReq.id}`);
    onClose();
    void navigate({ to: "/control/ops-board" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-primary/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-primary text-white font-bold shadow-md shadow-primary/20">
              <Wrench className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Request Service</h2>
              <p className="text-xs text-muted-foreground">{provider.business} · {titleize(provider.category)}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <form onSubmit={handleBookService} className="space-y-4 p-6">
          {/* Provider Snapshot Card */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-foreground">{provider.business}</span>
              <p className="text-muted-foreground mt-0.5">{provider.services}</p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 font-bold gap-1">
                <Star className="size-3 fill-current" /> {provider.rating}
              </Badge>
              <p className="text-[10px] text-muted-foreground mt-1">Starting from {bdt(provider.priceFrom)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="req-name" className="text-xs font-semibold">Resident Name</Label>
              <Input
                id="req-name"
                value={residentName}
                onChange={(e) => setResidentName(e.target.value)}
                className="mt-1 text-xs"
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="req-phone" className="text-xs font-semibold">Contact Phone</Label>
              <Input
                id="req-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 text-xs font-mono"
                placeholder="+8801XXXXXXXXX"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="req-flat" className="text-xs font-semibold">Service Location / Flat</Label>
            <Input
              id="req-flat"
              value={flat}
              onChange={(e) => setFlat(e.target.value)}
              className="mt-1 text-xs"
              placeholder="e.g. Flat 3B, Meghna Tower, Block A"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="req-time" className="text-xs font-semibold">Preferred Date & Time</Label>
              <select
                id="req-time"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium"
              >
                <option value="Today, 4:00 PM">Today (4:00 PM - 6:00 PM)</option>
                <option value="Tomorrow, 10:00 AM">Tomorrow (10:00 AM - 12:00 PM)</option>
                <option value="Tomorrow, 3:00 PM">Tomorrow (3:00 PM - 5:00 PM)</option>
                <option value="Weekend Morning">Saturday Morning (9:00 AM)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="req-handover" className="text-xs font-semibold">Handover Protocol</Label>
              <select
                id="req-handover"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium"
              >
                <option value="doorstep">Direct Doorstep Access</option>
                <option value="caretaker">Caretaker Supervised Handover</option>
                <option value="gate">Gate Reception Pickup</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="req-notes" className="text-xs font-semibold">Issue Details / Instructions (Optional)</Label>
            <textarea
              id="req-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe specific service requirements or gate instructions…"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 font-semibold" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin mr-1.5" /> : null}
              Confirm & Book Service
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Marketplace() {
  const { data: summary } = useQuery({ queryKey: ["marketplace-summary"], queryFn: () => marketplaceService.summary() });
  const { data: providers = [], isLoading } = useQuery({ queryKey: ["service-providers"], queryFn: () => serviceProviderService.all() });
  const { data: requests = [] } = useQuery({ queryKey: ["service-requests"], queryFn: () => serviceRequestService.all() });
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);

  return (
    <>
      <PageHeader
        title="Community Service Marketplace"
        description="Verified service providers serving Bashundhara R/A under the controlled gate → caretaker → resident handover protocol."
        breadcrumb={["Services", "Marketplace"]}
        actions={
          <Link to="/services/requests" className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-accent transition-colors">
            View Active Requests
          </Link>
        }
      />
      <div className="space-y-6 p-4 sm:p-6">
        {/* KPI Strip */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Verified providers" value={`${summary?.verifiedProviders ?? "17"} / ${summary?.providers ?? "20"}`} hint="Community verification passed" icon={BadgeCheck} tone="success" />
          <KpiCard label="Open requests" value={String(summary?.openRequests ?? "32")} hint="Awaiting provider response" icon={Sparkles} tone="info" />
          <KpiCard label="Active bids" value={String(summary?.activeBids ?? "117")} hint="Competitive quotes in play" icon={Gavel} tone="primary" />
          <KpiCard label="Average rating" value={String(summary?.avgRating ?? "4.49")} hint="Across all verified providers" icon={Timer} tone="neutral" />
        </div>

        {/* Verified Providers Grid */}
        <Section title="Verified Providers" description="Trust score combines rating, completed jobs, complaint rate and on-time arrival">
          {isLoading ? (
            <TableSkeleton rows={6} cols={4} />
          ) : (
            <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
              {providers.slice(0, 18).map((p) => (
                <article key={p.id} className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-foreground">{p.business}</h3>
                        <p className="text-xs text-muted-foreground">{titleize(p.category)} · {p.serviceArea}</p>
                      </div>
                      <StatusBadge value={p.verification} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{p.services}</p>
                    
                    <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-2">
                        <dt className="text-[10px] font-bold uppercase text-muted-foreground">Rating</dt>
                        <dd className="tabular text-sm font-bold text-foreground mt-0.5">★ {p.rating}</dd>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-2">
                        <dt className="text-[10px] font-bold uppercase text-muted-foreground">Jobs</dt>
                        <dd className="tabular text-sm font-bold text-foreground mt-0.5">{p.completedJobs}</dd>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-2">
                        <dt className="text-[10px] font-bold uppercase text-muted-foreground">Response</dt>
                        <dd className="tabular text-sm font-bold text-foreground mt-0.5">{p.responseMins}m</dd>
                      </div>
                    </dl>
                    
                    <p className="mt-2.5 text-xs text-muted-foreground">
                      Trust score <strong className="text-primary">{p.trustScore}%</strong> · from {bdt(p.priceFrom)} · {p.hours}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 font-semibold text-xs h-8.5"
                      onClick={() => setSelectedProvider(p)}
                    >
                      Request Service
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8.5"
                      asChild
                    >
                      <Link to={`/services/providers`}>View Profile</Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Section>

        {/* Latest Requests */}
        <Section title="Latest Community Service Requests" description="Fixed price, quote requests and competitive bids across residential blocks" actions={<Store className="size-4 text-muted-foreground" />}>
          <ul className="divide-y divide-border/60">
            {requests.slice(0, 8).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">{r.title}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    {r.id} · {r.location} · {r.preferredDate} · budget {bdt(r.budgetFrom)}–{bdt(r.budgetTo)} · {r.bids} bids submitted
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <StatusBadge value={r.pricingModel} />
                  <StatusBadge value={r.status} />
                </span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* Interactive Service Request Booking Modal */}
      {selectedProvider && (
        <ServiceBookingModal
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
        />
      )}
    </>
  );
}

