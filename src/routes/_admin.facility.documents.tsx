import { useSyncExternalStore } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download, ShieldCheck, Building2, Eye, Filter, Search } from "lucide-react";
import { PageHeader, Section } from "@/components/app/primitives";
import { facilityStore, getFacilitySnapshot } from "@/services/facilityStore";

export const Route = createFileRoute("/_admin/facility/documents")({
  head: () => ({
    meta: [
      { title: "Facility Documents — Facility Core Service" },
      { name: "description", content: "Facility Document Vault: Warranties, AMC contracts, certificates, inspection reports, technical manuals." },
    ],
  }),
  component: FacilityDocumentsPage,
});

function FacilityDocumentsPage() {
  const store = useSyncExternalStore(facilityStore.getSummary ? () => {} : () => {}, getFacilitySnapshot);

  return (
    <>
      <PageHeader
        title="Facility Central Document Vault"
        description="Linked asset warranties, AMC contracts, equipment manuals, fire safety licenses, and inspection certificates."
        breadcrumb={["Facility", "Documents"]}
      />

      <div className="space-y-6 p-4 sm:p-6">
        <Section title="Document Library" description="Searchable repository linked to assets, buildings and compliance">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { code: "DOC-GEN-01", name: "Cummins 500kVA Technical Manual & Wiring Diagram.pdf", type: "Manual", linkedTo: "GEN-A-001 Generator", date: "2023-02-01" },
              { code: "DOC-LFT-01", name: "KONE Elevator Safety Certificate & Test Report.pdf", type: "Certificate", linkedTo: "LFT-A-001 Lift", date: "2025-01-15" },
              { code: "DOC-FIR-01", name: "Fire Service Bangladesh Hydrant Clearance 2025.pdf", type: "License", linkedTo: "Meghna Tower Fire System", date: "2025-03-15" },
              { code: "DOC-AMC-01", name: "KONE Comprehensive AMC Agreement 2025.pdf", type: "Contract", linkedTo: "KONE Bangladesh Ltd", date: "2025-01-01" },
              { code: "DOC-PMP-01", name: "Grundfos Hydro-Pneumatic Pump Warranty Card.pdf", type: "Warranty", linkedTo: "PMP-A-002 Pump", date: "2023-04-12" },
            ].map((doc) => (
              <div key={doc.code} className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-sm text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-primary">{doc.code}</span>
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px]">{doc.type}</span>
                </div>
                <p className="font-semibold text-foreground truncate">{doc.name}</p>
                <p className="text-muted-foreground">Linked to: {doc.linkedTo}</p>
                <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                  <span>Uploaded: {doc.date}</span>
                  <span className="text-primary hover:underline cursor-pointer">Download →</span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
