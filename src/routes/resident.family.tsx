import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ModulePage } from "@/components/app/module-page";
import { familyMemberService, flatService } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge, TableSkeleton } from "@/components/app/primitives";
import type { Column } from "@/components/app/data-table";

export const Route = createFileRoute("/resident/family")({
  head: () => ({
    meta: [
      { title: "My Family — Bashundhara R/A" },
      { name: "description", content: "Add and manage family members of your flat with relationship, access level and move-in records." },
      { property: "og:title", content: "My Family — Bashundhara R/A" },
      { property: "og:description", content: "Household members and access levels for your Bashundhara R/A flat." },
    ],
  }),
  component: Family,
});

const columns: Column<any>[] = [
  { key: "name", header: "Member", render: (r) => <span className="font-medium">{r.name}</span> },
  { key: "relationship", header: "Relationship" },
  { key: "phone", header: "Phone", hideOnMobile: true },
  { key: "occupation", header: "Occupation", hideOnMobile: true },
  { key: "accessLevel", header: "Access", render: (r) => <StatusBadge value={String(r.accessLevel)} /> },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

function Family() {
  const { user } = useAuth();
  const propertyId = user?.propertyId ?? "PRP-0007";
  const { data: flats = [], isLoading } = useQuery({ queryKey: ["flats"], queryFn: () => flatService.all() });
  const flat = flats.find((f) => f.propertyId === propertyId) ?? flats[0];
  const flatId = flat?.id;

  const service = useMemo(() => {
    const base = familyMemberService as any;
    return {
      ...base,
      all: async () => {
        const rows = await base.all();
        const mine = rows.filter((r: any) => r.flatId === flatId);
        return mine.length ? mine : rows.slice(0, 4);
      },
      create: (payload: any) => base.create({ ...payload, flatId, status: "active" }),
    };
  }, [flatId]);

  if (isLoading) return <div className="p-6"><TableSkeleton rows={4} cols={4} /></div>;

  return (
    <ModulePage
      title="My Family"
      description="Family members registered against your flat, with relationship and gate access level."
      breadcrumb={["Resident", "Family"]}
      service={service as never}
      queryKey={`resident-family-${flatId}`}
      columns={columns}
      createFields={[
        { name: "name", label: "Full name", required: true },
        { name: "relationship", label: "Relationship", type: "select", options: ["spouse", "child", "parent", "sibling", "relative", "other"], required: true },
        { name: "gender", label: "Gender", type: "select", options: ["male", "female", "other"] },
        { name: "dob", label: "Date of birth", type: "date" },
        { name: "phone", label: "Phone", type: "tel" },
        { name: "occupation", label: "Occupation" },
        { name: "accessLevel", label: "Access level", type: "select", options: ["full", "standard", "restricted"], required: true },
      ]}
      createLabel="Add family member"
      emptyTitle="No family members yet"
      emptyDescription="Add the people living in your flat."
    />
  );
}
