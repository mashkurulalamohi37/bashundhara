import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { complianceService } from "@/services";
import type { Column, FilterDef } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { num } from "@/lib/format";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/control/compliance")({
  head: () => ({
    meta: [
      { title: "Compliance & Documents — Bashundhara R/A" },
      { name: "description", content: "Licences, certificates, insurance and contracts with expiry tracking." },
      { property: "og:title", content: "Compliance & Documents — Bashundhara R/A" },
      { property: "og:description", content: "Licences, certificates, insurance and contracts with expiry tracking." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Doc ID" },
  { key: "name", header: "Document" },
  { key: "category", header: "Category" },
  { key: "entity", header: "Entity" },
  { key: "entityType", header: "Entity type" },
  { key: "issuedOn", header: "Issued" },
  { key: "expiresOn", header: "Expires" },
  { key: "daysToExpiry", header: "Days left", render: (r) => <span className="tabular">{num(r.daysToExpiry)}</span>, value: (r) => r.daysToExpiry },
  { key: "state", header: "State", render: (r) => <StatusBadge value={r.state} /> },
  { key: "owner", header: "Owner" },
];

const filters: FilterDef[] = [
  { key: "state", label: "State", options: ["valid", "expiring_soon", "expired"] },
  { key: "category", label: "Category", options: ["Licence", "Certificate", "Contract", "Insurance", "Verification"] },
];

const createFields: FieldDef[] = [
  { name: "name", label: "Document name", required: true },
  { name: "category", label: "Category", type: "select", options: ["Licence", "Certificate", "Contract", "Insurance", "Verification"], required: true },
  { name: "entity", label: "Entity", required: true },
  { name: "issuedOn", label: "Issued on", type: "date", required: true },
  { name: "expiresOn", label: "Expires on", type: "date", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Compliance & Documents"
      description="Licences, certificates, insurance and contracts with expiry tracking."
      breadcrumb={["Control", "Compliance"]}
      service={complianceService as never}
      queryKey="ctl-compliance"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Add document"
    />
  );
}
