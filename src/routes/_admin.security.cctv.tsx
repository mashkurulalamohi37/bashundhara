import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { cameraService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/security/cctv")({
  head: () => ({
    meta: [
      { title: "CCTV Network — Bashundhara R/A" },
      { name: "description", content: "Camera inventory across gates, roads, parking and critical zones with health status." },
      { property: "og:title", content: "CCTV Network — Bashundhara R/A" },
      { property: "og:description", content: "Camera inventory across gates, roads, parking and critical zones with health status." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
    { key: "id", header: "Camera ID", className: "tabular" },
    { key: "name", header: "Camera", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "location", header: "Location" },
    { key: "block", header: "Block", hideOnMobile: true },
    { key: "zone", header: "Zone", render: (r) => <StatusBadge value={String(r.zone)} /> },
    { key: "lastActive", header: "Last active", hideOnMobile: true },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

const filters = [
  { key: "zone", label: "Zone", options: ["gate", "road", "parking", "building", "critical"] },
  { key: "status", label: "Status", options: ["online", "offline", "degraded"] },
];

function Page() {
  return (
    <ModulePage
      title="CCTV Network"
      description="Camera inventory across gates, roads, parking and critical zones with health status."
      breadcrumb={["Security", "CCTV"]}
      service={cameraService as never}
      queryKey="cameras"
      columns={columns}
      filters={filters}
    />
  );
}
