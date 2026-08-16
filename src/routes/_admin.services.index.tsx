import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/services/")({
  beforeLoad: () => {
    throw redirect({ to: "/services/marketplace" });
  },
});
