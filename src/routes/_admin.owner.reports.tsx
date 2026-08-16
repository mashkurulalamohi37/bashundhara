import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/owner/reports")({
  beforeLoad: () => {
    throw redirect({ to: "/reports" });
  },
});
