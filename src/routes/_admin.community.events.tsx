import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/community/events")({
  beforeLoad: () => {
    throw redirect({ to: "/events" });
  },
});
