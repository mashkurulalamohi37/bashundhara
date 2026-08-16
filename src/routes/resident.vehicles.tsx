import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { vehicleService } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/resident/vehicles")({
  head: () => ({
    meta: [
      { title: "My Vehicles — Bashundhara R/A" },
      { name: "description", content: "Vehicles registered to your flat with sticker validity and parking slot." },
      { property: "og:title", content: "My Vehicles — Bashundhara R/A" },
      { property: "og:description", content: "Vehicles registered to your flat with sticker validity and parking slot." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
  { key: "registration", header: "Registration", render: (r) => <span className="font-medium">{r.registration}</span> },
  { key: "type", header: "Type" },
  { key: "brand", header: "Brand", hideOnMobile: true },
  { key: "ownerName", header: "Owner", hideOnMobile: true },
  { key: "sticker", header: "Sticker", hideOnMobile: true },
  { key: "parkingSlot", header: "Slot", hideOnMobile: true },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

function Page() {
  const { user } = useAuth();
  const propertyId = user?.propertyId ?? "PRP-0007";
  const service = useMemo(() => {
    const base = vehicleService as any;
    return {
      ...base,
      all: async () => (await base.all()).filter((r: any) => r.propertyId === propertyId),
      create: (payload: any) => base.create({ ...payload, propertyId, block: user?.block ?? "Block C" }),
    };
  }, [propertyId, user?.block]);

  return (
    <ModulePage
      title="My Vehicles"
      description="Vehicles registered to your flat with sticker validity and parking slot."
      breadcrumb={["Resident", "My Vehicles"]}
      service={service as never}
      queryKey="resident-vehicles"
      columns={columns}
      createFields={[
  { name: "registration", label: "Registration", required: true },
  { name: "type", label: "Type", type: "select", options: ["car", "microbus", "motorcycle", "bicycle"], required: true },
  { name: "brand", label: "Brand", required: true },
  { name: "model", label: "Model", required: true },
  { name: "ownerName", label: "Owner name", required: true },
]}
      createLabel="Register vehicle"
      emptyTitle="Nothing here yet"
      emptyDescription="Use the button above to add your first record."
    />
  );
}
