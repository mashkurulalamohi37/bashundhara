import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { documentService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/governance/policies")({
  head: () => ({
    meta: [
      { title: "Community Policies — Bashundhara R/A" },
      { name: "description", content: "Approved welfare society policies, bylaws and standard operating procedures." },
      { property: "og:title", content: "Community Policies — Bashundhara R/A" },
      { property: "og:description", content: "Approved welfare society policies, bylaws and standard operating procedures." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
  { key: "id", header: "Doc ID", className: "tabular" },
  { key: "name", header: "Policy", render: (r) => <span className="font-medium">{r.name}</span> },
  { key: "category", header: "Category", hideOnMobile: true },
  { key: "owner", header: "Owner", hideOnMobile: true },
  { key: "uploadedAt", header: "Uploaded", hideOnMobile: true },
  { key: "verification", header: "Verification", render: (r) => <StatusBadge value={String(r.verification)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Community Policies"
      description="Approved welfare society policies, bylaws and standard operating procedures."
      breadcrumb={["Governance", "Policies"]}
      service={documentService as never}
      queryKey="governance-policies"
      columns={columns}
      filters={[]}
      createFields={[
  { name: "name", label: "Policy title", required: true },
  { name: "category", label: "Category", required: true },
  { name: "owner", label: "Policy owner", required: true },
]}
      createLabel="Add policy"
    />
  );
}
