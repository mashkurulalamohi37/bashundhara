import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { familyMemberService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/family-members")({
  head: () => ({
    meta: [
      { title: "Family Members — Bashundhara R/A" },
      { name: "description", content: "Household members with relationship to the head, access level and occupancy dates." },
      { property: "og:title", content: "Family Members — Bashundhara R/A" },
      { property: "og:description", content: "Household members with relationship to the head, access level and occupancy dates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Member ID", className: "tabular" },
  { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
  { key: "householdId", header: "Household", hideOnMobile: true },
  { key: "flatId", header: "Flat" },
  { key: "relationship", header: "Relationship", render: (r) => <StatusBadge value={String(r.relationship ?? "—")} /> },
  { key: "gender", header: "Gender", hideOnMobile: true },
  { key: "dob", header: "Date of birth", hideOnMobile: true },
  { key: "occupation", header: "Occupation", hideOnMobile: true },
  { key: "accessLevel", header: "Access", render: (r) => <StatusBadge value={String(r.accessLevel ?? "—")} /> },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "relationship", label: "Relationship", options: ["self", "spouse", "child", "parent", "sibling", "relative", "other"] }, { key: "status", label: "Status", options: ["active", "moved_out"] }];

function Page() {
  return (
    <ModulePage
      title="Family Members"
      description="Household members with relationship to the head, access level and occupancy dates."
      breadcrumb={["People", "Family Members"]}
      service={familyMemberService as never}
      queryKey="family-members"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
