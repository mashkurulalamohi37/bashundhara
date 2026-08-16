import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/owner/tenants")({
  beforeLoad: () => {
    throw redirect({ to: "/tenants" });
  },
});
