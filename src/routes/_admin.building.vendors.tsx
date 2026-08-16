import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { vendorService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/building/vendors")({
  head: () => ({
    meta: [
      { title: "Building Vendors — Bashundhara R/A" },
      { name: "description", content: "Contracted vendors serving the building with contract value, outstanding payable and rating." },
      { property: "og:title", content: "Building Vendors — Bashundhara R/A" },
      { property: "og:description", content: "Contracted vendors serving the building with contract value, outstanding payable and rating." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Vendor ID", className: "tabular" },
  { key: "company", header: "Company", render: (r) => <span className="font-medium">{r.company}</span> },
  { key: "category", header: "Category" },
  { key: "contactName", header: "Contact", hideOnMobile: true },
  { key: "phone", header: "Phone", className: "tabular", hideOnMobile: true },
  { key: "buildingId", header: "Building" },
  { key: "contractValue", header: "Contract", render: (r) => <span className="tabular">{bdt(Number(r.contractValue ?? 0))}</span>, value: (r) => Number(r.contractValue ?? 0) },
  { key: "outstanding", header: "Outstanding", render: (r) => <span className="tabular">{bdt(Number(r.outstanding ?? 0))}</span>, value: (r) => Number(r.outstanding ?? 0) },
  { key: "rating", header: "Rating", hideOnMobile: true },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "status", label: "Status", options: ["active", "on_hold", "terminated"] }];

function Page() {
  return (
    <ModulePage
      title="Building Vendors"
      description="Contracted vendors serving the building with contract value, outstanding payable and rating."
      breadcrumb={["Building", "Vendors"]}
      service={vendorService as never}
      queryKey="vendors"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
