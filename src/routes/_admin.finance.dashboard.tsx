import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/finance/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/finance" });
  },
});
