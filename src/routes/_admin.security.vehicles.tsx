import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/security/vehicles")({
  beforeLoad: () => {
    throw redirect({ to: "/vehicles" });
  },
});
