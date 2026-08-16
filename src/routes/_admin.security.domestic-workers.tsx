import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/security/domestic-workers")({
  beforeLoad: () => {
    throw redirect({ to: "/security/domestic-access" });
  },
});
