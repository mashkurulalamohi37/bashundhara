import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { committeeService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/governance/committee")({
  head: () => ({
    meta: [
      { title: "Welfare Committee — Bashundhara R/A" },
      { name: "description", content: "Elected committee members, portfolios and term expiry." },
      { property: "og:title", content: "Welfare Committee — Bashundhara R/A" },
      { property: "og:description", content: "Elected committee members, portfolios and term expiry." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Member ID", className: "tabular" },
    { key: "name", header: "Member", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "designation", header: "Designation" },
    { key: "department", header: "Portfolio", hideOnMobile: true },
    { key: "block", header: "Block" },
    { key: "phone", header: "Phone", className: "tabular", hideOnMobile: true },
    { key: "termEnds", header: "Term ends", hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "status", label: "Status", options: ["active", "inactive"] },
];

function Page() {
  return (
    <ModulePage
      title="Welfare Committee"
      description="Elected committee members, portfolios and term expiry."
      breadcrumb={["Governance", "Committee"]}
      service={committeeService as never}
      queryKey="committee"
      columns={columns}
      filters={filters}
    />
  );
}
