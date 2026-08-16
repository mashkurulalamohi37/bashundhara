import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/owner/profit-loss")({
  beforeLoad: () => {
    throw redirect({ to: "/building/pnl" });
  },
});
