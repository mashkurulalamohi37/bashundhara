import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/security/emergency")({
  beforeLoad: () => {
    throw redirect({ to: "/emergency" });
  },
});
