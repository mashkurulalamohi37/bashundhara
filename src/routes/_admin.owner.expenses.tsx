import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/owner/expenses")({
  beforeLoad: () => {
    throw redirect({ to: "/building/expenses" });
  },
});
