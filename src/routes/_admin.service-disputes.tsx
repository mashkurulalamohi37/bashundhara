import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/service-disputes")({
  beforeLoad: () => {
    throw redirect({ to: "/services/disputes" });
  },
});
