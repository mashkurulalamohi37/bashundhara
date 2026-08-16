import { useSyncExternalStore } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Handshake, Star, ShieldCheck, Phone, Mail, MapPin } from "lucide-react";
import { PageHeader, Section, StatusBadge } from "@/components/app/primitives";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";

export const Route = createFileRoute("/_admin/facility/vendors")({
  head: () => ({
    meta: [
      { title: "Vendor & Service Provider Directory — Facility Core Service" },
      { name: "description", content: "Facility vendors: Electrical, Plumbing, HVAC, Lift, Generator, Security, Cleaning, Fire Safety." },
    ],
  }),
  component: FacilityVendorsPage,
});

function FacilityVendorsPage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);

  return (
    <>
      <PageHeader
        title="Facility Vendors & Contract Performance Scorecards"
        description="Verified vendors for lifts, generators, plumbing, electrical, HVAC & fire safety. Tracks SLA compliance and active AMCs."
        breadcrumb={["Facility", "Vendors"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        <Section title="Verified Facility Vendors & Service Contractors" description="Performance rating, active AMCs and SLA compliance rate">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { id: "VND-KNE-01", code: "VND-KNE-01", name: "KONE Bangladesh Ltd", cat: "Lift & Escalator", phone: "+88029881122", rating: 4.8, amcs: 1, sla: "98.5%" },
              { id: "VND-ENG-01", code: "VND-ENG-01", name: "Energypac Engineering", cat: "Generator & Substation", phone: "+88029883344", rating: 4.7, amcs: 1, sla: "96.0%" },
              { id: "VND-PLM-01", code: "VND-PLM-01", name: "Aqua Solutions BD", cat: "Plumbing & Pumps", phone: "+8801711223344", rating: 4.5, amcs: 1, sla: "94.2%" },
            ].map((v) => (
              <div key={v.id} className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-primary">{v.code}</span>
                    <h3 className="font-semibold text-base text-foreground mt-0.5">{v.name}</h3>
                    <p className="text-xs text-muted-foreground">{v.cat}</p>
                  </div>
                  <StatusBadge value="Verified" />
                </div>
                <div className="rounded-lg bg-muted/40 p-3 space-y-1 text-xs">
                  <p className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                    <Star className="size-3.5 fill-current" /> Rating: {v.rating} / 5.0
                  </p>
                  <p>Active AMCs: <strong>{v.amcs} Contract</strong></p>
                  <p>SLA Compliance Rate: <strong>{v.sla}</strong></p>
                  <p className="text-muted-foreground">Phone: {v.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
