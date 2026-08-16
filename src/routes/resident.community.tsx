import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ModulePage } from "@/components/app/module-page";
import { communityPostService, eventService } from "@/services";
import { useAuth } from "@/hooks/useAuth";
import { Section, StatusBadge } from "@/components/app/primitives";
import type { Column } from "@/components/app/data-table";

export const Route = createFileRoute("/resident/community")({
  head: () => ({
    meta: [
      { title: "Community Feed — Bashundhara R/A" },
      { name: "description", content: "Neighbourhood posts, recommendations, lost and found, deals and upcoming events across Bashundhara R/A blocks." },
      { property: "og:title", content: "Community Feed — Bashundhara R/A" },
      { property: "og:description", content: "Share posts and follow neighbourhood conversations in Bashundhara R/A." },
    ],
  }),
  component: ResidentCommunity,
});

const columns: Column<any>[] = [
  { key: "title", header: "Post", render: (r) => <span className="font-medium">{r.title}</span> },
  { key: "type", header: "Type" },
  { key: "author", header: "Author", hideOnMobile: true },
  { key: "group", header: "Group", hideOnMobile: true },
  { key: "postedOn", header: "Posted", hideOnMobile: true },
  { key: "likes", header: "Likes", hideOnMobile: true },
  { key: "status", header: "Status", render: (r) => <StatusBadge value={String(r.status)} /> },
];

function ResidentCommunity() {
  const { user } = useAuth();
  const { data: events = [] } = useQuery({ queryKey: ["events"], queryFn: () => eventService.all() });
  const service = useMemo(() => {
    const base = communityPostService as any;
    return {
      ...base,
      create: (payload: any) =>
        base.create({
          ...payload,
          author: user?.name ?? "Resident",
          authorFlat: user?.propertyId ?? "PRP-0007",
          block: user?.block ?? "Block C",
          likes: 0,
          comments: 0,
          postedOn: new Date().toISOString().slice(0, 10),
          status: "published",
        }),
    };
  }, [user?.name, user?.block, user?.propertyId]);

  return (
    <ModulePage
      title="Community Feed"
      description="Posts, questions, recommendations and alerts from your neighbours."
      breadcrumb={["Resident", "Community"]}
      service={service as never}
      queryKey="resident-community-feed"
      columns={columns}
      createFields={[
        { name: "title", label: "Title", required: true },
        { name: "type", label: "Type", type: "select", options: ["post", "question", "recommendation", "lost_found", "deal", "alert"], required: true },
        { name: "group", label: "Group", required: true },
        { name: "body", label: "Message", type: "textarea", required: true },
      ]}
      createLabel="New post"
      emptyTitle="No posts yet"
      emptyDescription="Start a conversation with your neighbours."
      above={
        <Section title="Upcoming events" description="Organised by the welfare society">
          <ul className="divide-y divide-border">
            {events.slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{e.title}</span>
                  <span className="block text-xs text-muted-foreground">{e.date} · {e.time} · {e.venue} · {e.registered}/{e.capacity} registered</span>
                </span>
                <StatusBadge value={e.status} />
              </li>
            ))}
          </ul>
        </Section>
      }
    />
  );
}
