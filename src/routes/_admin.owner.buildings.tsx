import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/owner/buildings")({
  beforeLoad: () => {
    throw redirect({ to: "/buildings" });
  },
});
