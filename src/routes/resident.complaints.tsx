import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { complaintService } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/resident/complaints")({
  head: () => ({
    meta: [
      { title: "My Complaints — Bashundhara R/A" },
      { name: "description", content: "Raise issues for your flat or the community and follow resolution progress." },
      { property: "og:title", content: "My Complaints — Bashundhara R/A" },
      { property: "og:description", content: "Raise issues for your flat or the community and follow resolution progress." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
  { key: "id", header: "Ref", className: "tabular" },
  { key: "title", header: "Complaint", render: (r) => <span className="font-medium">{r.title}</span> },
  { key: "category", header: "Category" },
  { key: "assignedTo", header: "Assigned to", hideOnMobile: true },
  { key: "createdAt", header: "Raised", hideOnMobile: true },
  { key: "priority", header: "Priority", render: (r) => <StatusBadge value={String(r.priority)} /> },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

function Page() {
  const { user } = useAuth();
  const propertyId = user?.propertyId ?? "PRP-0007";
  const service = useMemo(() => {
    const base = complaintService as any;
    return {
      ...base,
      all: async () => (await base.all()),
      create: (payload: any) => base.create({ ...payload }),
    };
  }, [propertyId, user?.block]);

  return (
    <ModulePage
      title="My Complaints"
      description="Raise issues for your flat or the community and follow resolution progress."
      breadcrumb={["Resident", "My Complaints"]}
      service={service as never}
      queryKey="resident-complaints"
      columns={columns}
      createFields={[
  { name: "title", label: "What is the problem?", required: true },
  { name: "category", label: "Category", type: "select", options: ["water", "electricity", "drainage", "waste", "cleaning", "parking", "security", "noise", "other"], required: true },
  { name: "location", label: "Location", required: true },
  { name: "description", label: "Details", type: "textarea" },
]}
      createLabel="Raise complaint"
      emptyTitle="Nothing here yet"
      emptyDescription="Use the button above to add your first record."
    />
  );
}
