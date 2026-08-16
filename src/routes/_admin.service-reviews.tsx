import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/service-reviews")({
  beforeLoad: () => {
    throw redirect({ to: "/services/reviews" });
  },
});
