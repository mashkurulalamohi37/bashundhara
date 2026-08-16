import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { authorizedResidentService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/authorized-residents")({
  head: () => ({
    meta: [
      { title: "Authorized Residents — Bashundhara R/A" },
      { name: "description", content: "People living in a flat who are not the owner, tenant or immediate family — with time-bound authorization." },
      { property: "og:title", content: "Authorized Residents — Bashundhara R/A" },
      { property: "og:description", content: "People living in a flat who are not the owner, tenant or immediate family — with time-bound authorization." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Authorization ID", className: "tabular" },
  { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
  { key: "flatId", header: "Flat" },
  { key: "category", header: "Category", render: (r) => <StatusBadge value={String(r.category ?? "—")} /> },
  { key: "sponsorName", header: "Sponsor", hideOnMobile: true },
  { key: "sponsorType", header: "Sponsor type", hideOnMobile: true },
  { key: "authorizedFrom", header: "From", hideOnMobile: true },
  { key: "authorizedTo", header: "Until" },
  { key: "accessLevel", header: "Access", render: (r) => <StatusBadge value={String(r.accessLevel ?? "—")} /> },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "category", label: "Category", options: ["relative", "long_term_guest", "caregiver", "company_employee", "temporary"] }, { key: "status", label: "Status", options: ["active", "expiring", "expired", "revoked"] }];

function Page() {
  return (
    <ModulePage
      title="Authorized Residents"
      description="People living in a flat who are not the owner, tenant or immediate family — with time-bound authorization."
      breadcrumb={["People", "Authorized Residents"]}
      service={authorizedResidentService as never}
      queryKey="authorized-residents"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
