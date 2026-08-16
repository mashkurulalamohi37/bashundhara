import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { projectService } from "@/services";
import type { Column } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/construction")({
  head: () => ({
    meta: [
      { title: "Construction Projects — Bashundhara R/A" },
      { name: "description", content: "Building permissions, approval stages and construction progress by block." },
      { property: "og:title", content: "Construction Projects — Bashundhara R/A" },
      { property: "og:description", content: "Building permissions, approval stages and construction progress by block." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Project ID", className: "tabular" },
    { key: "name", header: "Project", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "block", header: "Block" },
    { key: "contractor", header: "Contractor", hideOnMobile: true },
    { key: "type", header: "Type", render: (r) => <StatusBadge value={String(r.type)} /> },
    { key: "progress", header: "Progress", render: (r) => (<span className="flex items-center gap-2"><span className="h-1.5 w-16 overflow-hidden rounded bg-muted"><span className="block h-full bg-primary" style={{ width: `${r.progress}%` }} /></span><span className="tabular text-xs">{r.progress}%</span></span>), value: (r) => r.progress as number },
    { key: "budget", header: "Budget", render: (r) => <span className="tabular">{bdt(r.budget as number)}</span>, value: (r) => r.budget as number },
    { key: "endDate", header: "Target", hideOnMobile: true },
    { key: "stage", header: "Stage", render: (r) => <StatusBadge value={String(r.stage)} /> },
];

const filters = [
  { key: "type", label: "Type", options: ["new_construction", "renovation", "infrastructure", "utility"] },
  { key: "stage", label: "Stage", options: ["application", "verification", "approved", "construction", "inspection", "completed"] },
];

const createFields: FieldDef[] = [
  { name: "name", label: "Project name", type: "text", required: true },
  { name: "block", label: "Block", type: "select", required: true, options: ["Block A", "Block B", "Block C", "Block D", "Block E"] },
  { name: "road", label: "Road", type: "text" },
  { name: "contractor", label: "Contractor", type: "text", required: true },
  { name: "type", label: "Project type", type: "select", required: true, options: ["new_construction", "renovation", "infrastructure", "utility"] },
  { name: "budget", label: "Budget (BDT)", type: "number", required: true },
  { name: "startDate", label: "Start date", type: "date", required: true },
  { name: "endDate", label: "Target completion", type: "date", required: true },
];

function Page() {
  return (
    <ModulePage
      title="Construction Projects"
      description="Building permissions, approval stages and construction progress by block."
      breadcrumb={["Development", "Construction"]}
      service={projectService as never}
      queryKey="projects"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="New application"
      detailTitle={(r: any) => r.name}
    />
  );
}
