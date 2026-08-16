import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/service-requests")({
  beforeLoad: () => {
    throw redirect({ to: "/services/requests" });
  },
});
