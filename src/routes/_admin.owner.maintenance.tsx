import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/owner/maintenance")({
  beforeLoad: () => {
    throw redirect({ to: "/maintenance" });
  },
});
