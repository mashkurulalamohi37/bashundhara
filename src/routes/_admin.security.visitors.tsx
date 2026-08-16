import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/security/visitors")({
  beforeLoad: () => {
    throw redirect({ to: "/visitors" });
  },
});
