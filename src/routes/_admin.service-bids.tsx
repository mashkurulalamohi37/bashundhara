import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/service-bids")({
  beforeLoad: () => {
    throw redirect({ to: "/services/bids" });
  },
});
