import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Section, StatusBadge, TableSkeleton } from "@/components/app/primitives";
import { announcementService } from "@/services";

export const Route = createFileRoute("/resident/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — Bashundhara R/A" },
      { name: "description", content: "Official notices from the Bashundhara R/A welfare society: water supply, security advisories, billing and events." },
      { property: "og:title", content: "Announcements — Bashundhara R/A" },
      { property: "og:description", content: "Society notices and advisories delivered to residents." },
    ],
  }),
  component: Announcements,
});

function Announcements() {
  const { data = [], isLoading } = useQuery({ queryKey: ["announcements"], queryFn: () => announcementService.all() });
  return (
    <>
      <PageHeader title="Announcements" description="Official notices from the welfare society and management office." breadcrumb={["Resident", "Announcements"]} />
      <div className="p-4 sm:p-6">
        {isLoading ? <TableSkeleton rows={6} cols={2} /> : (
          <Section title="Latest notices" description={`${data.length} published`}>
            <ul className="divide-y divide-border">
              {data.map((n) => (
                <li key={n.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold">{n.title}</h2>
                    <StatusBadge value={n.priority} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{n.publishedBy} · {n.publishedAt} · {n.audience}</p>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </>
  );
}
