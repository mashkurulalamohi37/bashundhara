import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/residents/domestic-workers")({
  beforeLoad: () => {
    throw redirect({ to: "/domestic-workers" });
  },
});
