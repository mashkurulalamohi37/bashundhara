import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/owner/families")({
  beforeLoad: () => {
    throw redirect({ to: "/households" });
  },
});
