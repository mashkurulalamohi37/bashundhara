import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { contractorService } from "@/services";
import type { Column } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/contractors")({
  head: () => ({
    meta: [
      { title: "Contractors & Vendors — Bashundhara R/A" },
      { name: "description", content: "Registered vendors with category, performance rating and payment position." },
      { property: "og:title", content: "Contractors & Vendors — Bashundhara R/A" },
      { property: "og:description", content: "Registered vendors with category, performance rating and payment position." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Vendor ID", className: "tabular" },
    { key: "company", header: "Company", render: (r) => <span className="font-medium">{r.company}</span> },
    { key: "contact", header: "Contact" },
    { key: "phone", header: "Phone", className: "tabular", hideOnMobile: true },
    { key: "category", header: "Category", render: (r) => <StatusBadge value={String(r.category)} /> },
    { key: "projects", header: "Projects", className: "tabular", hideOnMobile: true },
    { key: "rating", header: "Rating", className: "tabular" },
    { key: "paymentDue", header: "Payment due", render: (r) => <span className="tabular">{bdt(r.paymentDue as number)}</span>, value: (r) => r.paymentDue as number },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "category", label: "Category", options: ["construction", "electrical", "plumbing", "cleaning", "security", "landscaping", "it", "maintenance"] },
  { key: "status", label: "Status", options: ["active", "suspended", "pending"] },
];

const createFields: FieldDef[] = [
  { name: "company", label: "Company name", type: "text", required: true },
  { name: "contact", label: "Contact person", type: "text", required: true },
  { name: "phone", label: "Mobile number", type: "tel", required: true },
  { name: "category", label: "Category", type: "select", required: true, options: ["construction", "electrical", "plumbing", "cleaning", "security", "landscaping", "it", "maintenance"] },
  { name: "registration", label: "Trade licence no.", type: "text", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Contractors & Vendors"
      description="Registered vendors with category, performance rating and payment position."
      breadcrumb={["Development", "Contractors"]}
      service={contractorService as never}
      queryKey="contractors"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Register vendor"
      detailTitle={(r: any) => r.company}
    />
  );
}
