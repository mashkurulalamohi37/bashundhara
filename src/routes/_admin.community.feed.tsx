import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Heart, MessageSquare, Vote } from "lucide-react";
import { PageHeader, Section, StatusBadge, TableSkeleton, EmptyState } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { communityPostService, pollService } from "@/services";
import { titleize } from "@/lib/format";

export const Route = createFileRoute("/_admin/community/feed")({
  head: () => ({
    meta: [
      { title: "Community Feed — Bashundhara R/A" },
      { name: "description", content: "Resident community feed: posts, questions, recommendations, lost & found, local deals, alerts, notices and open polls." },
      { property: "og:title", content: "Community Feed — Bashundhara R/A" },
      { property: "og:description", content: "Where Bashundhara R/A residents discover people, places, services and information." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Feed,
});

const TYPES = ["all", "post", "question", "recommendation", "lost_found", "deal", "alert", "notice"] as const;

function Feed() {
  const [type, setType] = useState<string>("all");
  const { data: posts = [], isLoading } = useQuery({ queryKey: ["community-posts"], queryFn: () => communityPostService.all() });
  const { data: polls = [] } = useQuery({ queryKey: ["polls"], queryFn: () => pollService.all() });

  const rows = posts.filter((p) => (type === "all" ? true : p.type === type));

  return (
    <>
      <PageHeader
        title="Community Feed"
        description="The resident community layer — discussions, recommendations, lost & found, deals, alerts and polls."
        breadcrumb={["Community", "Feed"]}
      />
      <div className="space-y-4 p-4 sm:p-6">
        <Section>
          <div className="flex flex-wrap gap-1.5 p-3">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded border px-2 py-1 text-xs ${type === t ? "border-primary bg-primary-soft text-accent-foreground" : "border-border hover:bg-accent"}`}
              >
                {t === "all" ? "All" : titleize(t)}
              </button>
            ))}
          </div>
        </Section>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {isLoading ? (
              <Section><TableSkeleton rows={6} cols={3} /></Section>
            ) : rows.length ? (
              rows.slice(0, 24).map((p) => (
                <article key={p.id} className="rounded-md border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold">{p.title}</h2>
                      <p className="text-xs text-muted-foreground">
                        {p.author} · {p.authorFlat} · {p.block} · {p.group} · {p.postedOn}
                      </p>
                    </div>
                    <StatusBadge value={p.type} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => toast.success("Liked")}>
                      <Heart className="size-3.5" /> {p.likes}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toast.success("Comments coming from the resident app")}>
                      <MessageSquare className="size-3.5" /> {p.comments}
                    </Button>
                    {p.status !== "published" ? <StatusBadge value={p.status} /> : null}
                  </div>
                </article>
              ))
            ) : (
              <Section><EmptyState title="No posts in this category" description="Try another filter." /></Section>
            )}
          </div>

          <Section title="Open polls" description="Community decisions in progress">
            <ul className="divide-y divide-border">
              {polls.map((poll) => (
                <li key={poll.id} className="px-4 py-3">
                  <p className="text-sm font-medium">{poll.question}</p>
                  <p className="text-xs text-muted-foreground">{poll.options} · {poll.votes} votes · closes {poll.closesOn}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge value={poll.status} />
                    <Button size="sm" variant="outline" onClick={() => toast.success("Vote recorded")} disabled={poll.status === "closed"}>
                      <Vote className="size-3.5" /> Vote
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </>
  );
}
