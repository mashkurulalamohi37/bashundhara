import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { buildingStaffService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";
import { bdt } from "@/lib/format";

export const Route = createFileRoute("/_admin/building/staff")({
  head: () => ({
    meta: [
      { title: "Building Staff — Bashundhara R/A" },
      { name: "description", content: "Caretakers, guards, cleaners and technicians employed by the building — separate from domestic workers." },
      { property: "og:title", content: "Building Staff — Bashundhara R/A" },
      { property: "og:description", content: "Caretakers, guards, cleaners and technicians employed by the building — separate from domestic workers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const columns: Column<any>[] = [
  { key: "id", header: "Staff ID", className: "tabular" },
  { key: "name", header: "Name", render: (r) => <span className="font-medium">{r.name}</span> },
  { key: "role", header: "Role", render: (r) => <StatusBadge value={String(r.role ?? "—")} /> },
  { key: "buildingId", header: "Building" },
  { key: "shift", header: "Shift", hideOnMobile: true },
  { key: "monthlySalary", header: "Salary", render: (r) => <span className="tabular">{bdt(Number(r.monthlySalary ?? 0))}</span>, value: (r) => Number(r.monthlySalary ?? 0) },
  { key: "advance", header: "Advance", render: (r) => <span className="tabular">{bdt(Number(r.advance ?? 0))}</span>, value: (r) => Number(r.advance ?? 0), hideOnMobile: true },
  { key: "overtimeHours", header: "OT hrs", hideOnMobile: true },
  { key: "attendancePct", header: "Attendance %", hideOnMobile: true },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status ?? "—")} /> },
];

const filters = [{ key: "role", label: "Role", options: ["security", "caretaker", "cleaner", "technician", "gardener", "electrician", "plumber", "driver"] }, { key: "status", label: "Status", options: ["active", "on_leave", "suspended", "resigned"] }];

function Page() {
  return (
    <ModulePage
      title="Building Staff"
      description="Caretakers, guards, cleaners and technicians employed by the building — separate from domestic workers."
      breadcrumb={["Building", "Staff"]}
      service={buildingStaffService as never}
      queryKey="building-staff"
      columns={columns}
      filters={filters}
      detailTitle={(r: any) => `${r.id}`}
    />
  );
}
