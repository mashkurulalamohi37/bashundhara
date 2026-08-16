import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/owner/staff")({
  beforeLoad: () => {
    throw redirect({ to: "/building/staff" });
  },
});
