import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { documentService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/documents")({
  head: () => ({
    meta: [
      { title: "Document Vault — Bashundhara R/A" },
      { name: "description", content: "NIDs, ownership deeds, leases, permits and inspection certificates." },
      { property: "og:title", content: "Document Vault — Bashundhara R/A" },
      { property: "og:description", content: "NIDs, ownership deeds, leases, permits and inspection certificates." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Doc ID", className: "tabular" },
    { key: "name", header: "Document", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "category", header: "Category", render: (r) => <StatusBadge value={String(r.category)} /> },
    { key: "owner", header: "Owner" },
    { key: "uploadedAt", header: "Uploaded", hideOnMobile: true },
    { key: "expiry", header: "Expiry", hideOnMobile: true },
    { key: "sizeKb", header: "Size (KB)", className: "tabular", hideOnMobile: true },
    { key: "verification", header: "Verification", render: (r) => <StatusBadge value={String(r.verification)} /> },
];

const filters = [
  { key: "category", label: "Category", options: ["nid", "property", "ownership", "lease", "permit", "contractor", "vehicle", "worker", "inspection"] },
  { key: "verification", label: "Verification", options: ["verified", "pending", "rejected"] },
];

function Page() {
  return (
    <ModulePage
      title="Document Vault"
      description="NIDs, ownership deeds, leases, permits and inspection certificates."
      breadcrumb={["Insight", "Documents"]}
      service={documentService as never}
      queryKey="documents"
      columns={columns}
      filters={filters}
    />
  );
}
