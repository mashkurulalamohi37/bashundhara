import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { familyService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/families")({
  head: () => ({
    meta: [
      { title: "Families — Bashundhara R/A" },
      { name: "description", content: "Family units mapped to properties with head of family and household staff counts." },
      { property: "og:title", content: "Families — Bashundhara R/A" },
      { property: "og:description", content: "Family units mapped to properties with head of family and household staff counts." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Family ID", className: "tabular" },
    { key: "name", header: "Family", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "head", header: "Head of family" },
    { key: "propertyId", header: "Property", className: "tabular", hideOnMobile: true },
    { key: "block", header: "Block" },
    { key: "members", header: "Members", className: "tabular" },
    { key: "workers", header: "Staff", className: "tabular", hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "block", label: "Block", options: ["Block A", "Block B", "Block C", "Block D", "Block E"] },
  { key: "status", label: "Status", options: ["active", "inactive"] },
];

function Page() {
  return (
    <ModulePage
      title="Families"
      description="Family units mapped to properties with head of family and household staff counts."
      breadcrumb={["People", "Families"]}
      service={familyService as never}
      queryKey="families"
      columns={columns}
      filters={filters}
    />
  );
}
