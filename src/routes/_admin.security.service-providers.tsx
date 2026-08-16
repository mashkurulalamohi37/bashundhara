import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/security/service-providers")({
  beforeLoad: () => {
    throw redirect({ to: "/security/service-access" });
  },
});
