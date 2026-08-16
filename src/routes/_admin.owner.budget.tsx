import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/owner/budget")({
  beforeLoad: () => {
    throw redirect({ to: "/building/budget" });
  },
});
