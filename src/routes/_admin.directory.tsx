import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { directoryService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/directory")({
  head: () => ({
    meta: [
      { title: "Health & Emergency Directory — Bashundhara R/A" },
      { name: "description", content: "Hospitals, clinics, pharmacies and ambulance contacts serving Bashundhara R/A." },
      { property: "og:title", content: "Health & Emergency Directory — Bashundhara R/A" },
      { property: "og:description", content: "Hospitals, clinics, pharmacies and ambulance contacts serving Bashundhara R/A." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "ID", className: "tabular" },
    { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "kind", header: "Type", render: (r) => <StatusBadge value={String(r.kind)} /> },
    { key: "address", header: "Address", hideOnMobile: true },
    { key: "phone", header: "Phone", className: "tabular" },
    { key: "open24h", header: "24 hours", render: (r) => <StatusBadge value={r.open24h ? "verified" : "pending"} /> },
];

const filters = [
  { key: "kind", label: "Type", options: ["hospital", "clinic", "pharmacy", "ambulance", "doctor", "emergency_contact"] },
];

function Page() {
  return (
    <ModulePage
      title="Health & Emergency Directory"
      description="Hospitals, clinics, pharmacies and ambulance contacts serving Bashundhara R/A."
      breadcrumb={["Services", "Directory"]}
      service={directoryService as never}
      queryKey="directory"
      columns={columns}
      filters={filters}
    />
  );
}
