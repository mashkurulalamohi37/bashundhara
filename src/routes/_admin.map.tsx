import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "@/components/app/primitives";
import { CommunityMap } from "@/components/app/community-map";
import * as db from "@/mock/data";

export const Route = createFileRoute("/_admin/map")({
  head: () => ({
    meta: [
      { title: "Community Map — Bashundhara R/A" },
      { name: "description", content: "Interactive schematic map of Bashundhara R/A blocks, gates, CCTV coverage, incidents and parking zones." },
      { property: "og:title", content: "Community Map — Bashundhara R/A" },
      { property: "og:description", content: "Layered operational map of the residential area." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="Community Map" description="Layered schematic view of blocks, gates, cameras, incidents and parking." breadcrumb={["Overview", "Map"]} />
      <div className="p-4 sm:p-6">
        <Section>
          <div className="p-3">
            <CommunityMap markers={db.mapMarkers} height={560} />
          </div>
        </Section>
      </div>
    </>
  ),
});
