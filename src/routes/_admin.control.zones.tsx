import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { accessZoneService } from "@/services";
import type { Column, FilterDef } from "@/components/app/data-table";
import type { FieldDef } from "@/components/app/record-form";
import { titleize } from "@/lib/format";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/control/zones")({
  head: () => ({
    meta: [
      { title: "Access Zones — Bashundhara R/A" },
      { name: "description", content: "Community, block, gate, building, collection point and restricted zone hierarchy." },
      { property: "og:title", content: "Access Zones — Bashundhara R/A" },
      { property: "og:description", content: "Community, block, gate, building, collection point and restricted zone hierarchy." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Zone ID" },
  { key: "name", header: "Zone" },
  { key: "kind", header: "Kind", render: (r) => titleize(String(r.kind)) },
  { key: "parent", header: "Parent" },
  { key: "description", header: "Description" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
];

const filters: FilterDef[] = [
  { key: "kind", label: "Kind", options: ["community", "block", "road", "gate", "building", "floor", "flat", "collection_point", "parking", "restricted"] },
];

const createFields: FieldDef[] = [
  { name: "name", label: "Zone name", required: true },
  { name: "kind", label: "Zone kind", type: "select", options: ["community", "block", "road", "gate", "building", "floor", "flat", "collection_point", "parking", "restricted"], required: true },
  { name: "parent", label: "Parent zone", required: true },
  { name: "description", label: "Description", type: "textarea" },
];

function Page() {
  return (
    <ModulePage
      title="Access Zones"
      description="Community, block, gate, building, collection point and restricted zone hierarchy."
      breadcrumb={["Control", "Access Zones"]}
      service={accessZoneService as never}
      queryKey="ctl-zones"
      columns={columns}
      filters={filters}
      createFields={createFields}
      createLabel="Add zone"
    />
  );
}
