import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/security/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/security" });
  },
});
