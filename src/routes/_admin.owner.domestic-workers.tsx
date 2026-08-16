import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/owner/domestic-workers")({
  beforeLoad: () => {
    throw redirect({ to: "/domestic-workers" });
  },
});
