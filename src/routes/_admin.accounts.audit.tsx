import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { accountingAuditService } from "@/services";
import { StatusBadge } from "@/components/app/primitives";
import type { Column, FilterDef } from "@/components/app/data-table";
import { titleize } from "@/lib/format";

export const Route = createFileRoute("/_admin/accounts/audit")({
  head: () => ({
    meta: [
      { title: "Accounting Audit Trail — Bashundhara R/A" },
      { name: "description", content: "Immutable log of every accounting action with user, role, before and after state." },
      { property: "og:title", content: "Accounting Audit Trail — Bashundhara R/A" },
      { property: "og:description", content: "Immutable log of every accounting action with user, role, before and after state." },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "timestamp", header: "Timestamp" },
  { key: "user", header: "User" },
  { key: "role", header: "Role" },
  { key: "action", header: "Action", render: (r) => <StatusBadge value={r.action} /> },
  { key: "entity", header: "Entity", render: (r) => titleize(r.entity) },
  { key: "entityId", header: "Record" },
  { key: "source", header: "Source", render: (r) => titleize(r.source) },
  { key: "before", header: "Before" },
  { key: "after", header: "After" },
];

const filters: FilterDef[] = [
  { key: "role", label: "Role", options: ["Accountant", "Finance Manager", "Super Admin", "Building Manager", "Auditor"] },
  { key: "source", label: "Source", options: ["manual", "invoice", "payment", "expense", "depreciation", "procurement"] },
];

function Page() {
  return (
    <ModulePage
      title="Accounting Audit Trail"
      description="Who changed what, when and from which module — the accounting record of record."
      breadcrumb={["Accounts", "Audit Trail"]}
      service={accountingAuditService as never}
      queryKey="accounting-audit"
      columns={columns}
      filters={filters}
    />
  );
}
