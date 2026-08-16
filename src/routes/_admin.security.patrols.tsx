import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { officerService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/security/patrols")({
  head: () => ({
    meta: [
      { title: "Patrols & Officers — Bashundhara R/A" },
      { name: "description", content: "Guard roster, shift allocation and patrol checkpoint progress." },
      { property: "og:title", content: "Patrols & Officers — Bashundhara R/A" },
      { property: "og:description", content: "Guard roster, shift allocation and patrol checkpoint progress." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Officer ID", className: "tabular" },
    { key: "name", header: "Officer", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "badge", header: "Badge", className: "tabular" },
    { key: "gate", header: "Post" },
    { key: "shift", header: "Shift", render: (r) => <StatusBadge value={String(r.shift)} /> },
    { key: "zone", header: "Zone", hideOnMobile: true },
    { key: "patrolProgress", header: "Patrol", render: (r) => (<span className="flex items-center gap-2"><span className="h-1.5 w-16 overflow-hidden rounded bg-muted"><span className="block h-full bg-primary" style={{ width: `${r.patrolProgress}%` }} /></span><span className="tabular text-xs">{r.patrolProgress}%</span></span>), value: (r) => r.patrolProgress as number },
    { key: "lastCheckpoint", header: "Last checkpoint", hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "shift", label: "Shift", options: ["morning", "evening", "night"] },
  { key: "status", label: "Status", options: ["on_duty", "off_duty", "on_patrol", "leave"] },
];

function Page() {
  return (
    <ModulePage
      title="Patrols & Officers"
      description="Guard roster, shift allocation and patrol checkpoint progress."
      breadcrumb={["Security", "Patrols"]}
      service={officerService as never}
      queryKey="officers"
      columns={columns}
      filters={filters}
    />
  );
}
