import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/infrastructure/environment")({
  beforeLoad: () => {
    throw redirect({ to: "/environment" });
  },
});
