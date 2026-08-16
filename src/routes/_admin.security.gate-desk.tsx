import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { visitorService } from "@/services";
import { StatusBadge } from "@/components/app/primitives";
import type { Column } from "@/components/app/data-table";

export const Route = createFileRoute("/_admin/security/gate-desk")({
  head: () => ({
    meta: [
      { title: "Gate Desk — Bashundhara R/A" },
      { name: "description", content: "Fast check-in and check-out console for officers on gate duty." },
      { property: "og:title", content: "Gate Desk — Bashundhara R/A" },
      { property: "og:description", content: "Fast check-in and check-out console for officers on gate duty." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
  { key: "passCode", header: "Pass" },
  { key: "name", header: "Visitor" },
  { key: "host", header: "Host" },
  { key: "gate", header: "Gate" },
  { key: "time", header: "Time" },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Gate Desk"
      description="Fast check-in and check-out console for officers on gate duty."
      breadcrumb={["Security", "Gate Desk"]}
      service={visitorService as never}
      queryKey="gate-desk"
      columns={columns}
    />
  );
}
