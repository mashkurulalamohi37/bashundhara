import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/owner/owners")({
  beforeLoad: () => {
    throw redirect({ to: "/owners" });
  },
});
