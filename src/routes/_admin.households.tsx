import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { householdService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/households")({
  head: () => ({
    meta: [
      { title: "Households — Bashundhara R/A" },
      { name: "description", content: "Owner households and tenant households are maintained separately, with move-in history preserved." },
      { property: "og:title", content: "Households — Bashundhara R/A" },
      { property: "og:description", content: "Owner households and tenant households are maintained separately, with move-in history preserved." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Household ID", className: "tabular" },
  { key: "flatId", header: "Flat" },
  { key: "type", header: "Type", render: (r) => <StatusBadge value={String(r.type ?? "—")} /> },
  { key: "headName", header: "Head of household", render: (r) => <span className="font-medium">{r.headName}</span> },
  { key: "members", header: "Members" },
  { key: "domesticWorkers", header: "Domestic workers", hideOnMobile: true },
  { key: "vehicles", header: "Vehicles", hideOnMobile: true },
  { key: "moveIn", header: "Move-in", hideOnMobile: true },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "type", label: "Household type", options: ["owner_household", "tenant_household"] }, { key: "status", label: "Status", options: ["active", "historical"] }];

function Page() {
  return (
    <ModulePage
      title="Households"
      description="Owner households and tenant households are maintained separately, with move-in history preserved."
      breadcrumb={["People", "Households"]}
      service={householdService as never}
      queryKey="households"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
