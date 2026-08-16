import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { workerService } from "@/services";
import type { Column } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/workers")({
  head: () => ({
    meta: [
      { title: "Workers & Service Providers — Bashundhara R/A" },
      { name: "description", content: "Domestic workers, drivers and technicians with verification status and pass validity." },
      { property: "og:title", content: "Workers & Service Providers — Bashundhara R/A" },
      { property: "og:description", content: "Domestic workers, drivers and technicians with verification status and pass validity." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Worker ID", className: "tabular" },
    { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "category", header: "Category", render: (r) => <StatusBadge value={String(r.category)} /> },
    { key: "employer", header: "Employer" },
    { key: "block", header: "Block", hideOnMobile: true },
    { key: "validTill", header: "Pass valid till", hideOnMobile: true },
    { key: "verified", header: "Verified", render: (r) => <StatusBadge value={r.verified ? "verified" : "pending"} /> },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "category", label: "Category", options: ["domestic_worker", "driver", "gardener", "electrician", "plumber", "technician", "cleaner", "construction"] },
  { key: "status", label: "Status", options: ["active", "expired", "blocked"] },
];

const createFields: FieldDef[] = [
  { name: "name", label: "Worker name", type: "text", required: true },
  { name: "phone", label: "Mobile number", type: "tel", required: true },
  { name: "category", label: "Category", type: "select", required: true, options: ["domestic_worker", "driver", "gardener", "electrician", "plumber", "technician", "cleaner", "construction"] },
  { name: "employer", label: "Employer / household", type: "text", required: true },
  { name: "block", label: "Block", type: "select", required: true, options: ["Block A", "Block B", "Block C", "Block D", "Block E"] },
  { name: "validTill", label: "Pass valid till", type: "date", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Workers & Service Providers"
      description="Domestic workers, drivers and technicians with verification status and pass validity."
      breadcrumb={["People", "Workers"]}
      service={workerService as never}
      queryKey="workers"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Register worker"
      detailTitle={(r: any) => r.name}
    />
  );
}
