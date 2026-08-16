import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/owner/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/building/overview" });
  },
});
