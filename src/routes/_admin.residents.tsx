import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { residentService } from "@/services";
import type { Column } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/residents")({
  head: () => ({
    meta: [
      { title: "Residents — Bashundhara R/A" },
      { name: "description", content: "Verified resident directory with NID verification, tenancy type and dues position." },
      { property: "og:title", content: "Residents — Bashundhara R/A" },
      { property: "og:description", content: "Verified resident directory with NID verification, tenancy type and dues position." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Resident ID", className: "tabular" },
    { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "phone", header: "Phone", className: "tabular", hideOnMobile: true },
    { key: "block", header: "Block" },
    { key: "address", header: "Address", hideOnMobile: true },
    { key: "type", header: "Type", render: (r) => <StatusBadge value={String(r.type)} /> },
    { key: "nidVerified", header: "NID", render: (r) => <StatusBadge value={r.nidVerified ? "verified" : "pending"} /> },
    { key: "dues", header: "Dues", render: (r) => <span className="tabular">{bdt(r.dues as number)}</span>, value: (r) => r.dues as number },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "block", label: "Block", options: ["Block A", "Block B", "Block C", "Block D", "Block E"] },
  { key: "type", label: "Resident type", options: ["owner", "tenant", "family_member", "authorized", "temporary"] },
  { key: "status", label: "Status", options: ["active", "pending", "inactive"] },
];

const createFields: FieldDef[] = [
  { name: "name", label: "Full name", type: "text", required: true },
  { name: "phone", label: "Mobile number", type: "tel", required: true, placeholder: "+8801712345678" },
  { name: "email", label: "Email", type: "email" },
  { name: "nid", label: "NID number", type: "text", required: true, help: "10 or 17 digit National ID" },
  { name: "type", label: "Resident type", type: "select", required: true, options: ["owner", "tenant", "family_member", "authorized", "temporary"] },
  { name: "block", label: "Block", type: "select", required: true, options: ["Block A", "Block B", "Block C", "Block D", "Block E"] },
  { name: "address", label: "Address", type: "text", required: true },
  { name: "propertyId", label: "Property ID", type: "text", placeholder: "PRP-0012" },
];

function Page() {
  return (
    <ModulePage
      title="Residents"
      description="Verified resident directory with NID verification, tenancy type and dues position."
      breadcrumb={["People", "Residents"]}
      service={residentService as never}
      queryKey="residents"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Register resident"
      detailTitle={(r: any) => r.name}
    />
  );
}
