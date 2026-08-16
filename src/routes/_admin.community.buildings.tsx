import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/community/buildings")({
  beforeLoad: () => {
    throw redirect({ to: "/buildings" });
  },
});
