import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/service-providers")({
  beforeLoad: () => {
    throw redirect({ to: "/services/providers" });
  },
});
