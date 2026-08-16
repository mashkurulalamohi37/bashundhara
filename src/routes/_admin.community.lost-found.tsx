import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/module-page";
import { communityPostService } from "@/services";
import type { Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/primitives";

export const Route = createFileRoute("/_admin/community/lost-found")({
  head: () => ({
    meta: [
      { title: "Lost & Found — Bashundhara R/A" },
      { name: "description", content: "Community lost and found board for items reported inside Bashundhara R/A." },
      { property: "og:title", content: "Lost & Found — Bashundhara R/A" },
      { property: "og:description", content: "Community lost and found board for items reported inside Bashundhara R/A." },
    ],
  }),
  component: Page,
});

const columns: Column<any>[] = [
  { key: "id", header: "Post", className: "tabular" },
  { key: "title", header: "Item", render: (r) => <span className="font-medium">{r.title}</span> },
  { key: "author", header: "Reported by", hideOnMobile: true },
  { key: "authorFlat", header: "Flat", hideOnMobile: true },
  { key: "block", header: "Block", hideOnMobile: true },
  { key: "postedOn", header: "Posted", hideOnMobile: true },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

function Page() {
  return (
    <ModulePage
      title="Lost & Found"
      description="Community lost and found board for items reported inside Bashundhara R/A."
      breadcrumb={["Community", "Lost & Found"]}
      service={communityPostService as never}
      queryKey="community-lost-found"
      columns={columns}
      filters={[{ key: "block", label: "Block", options: ["Block A", "Block B", "Block C", "Block D", "Block E"] }]}
      createFields={[
  { name: "title", label: "Item", required: true },
  { name: "body", label: "Description", type: "textarea", required: true },
  { name: "authorFlat", label: "Your flat", required: true },
]}
      createLabel="Report item"
    />
  );
}
