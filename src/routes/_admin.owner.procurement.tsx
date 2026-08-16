import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/owner/procurement")({
  beforeLoad: () => {
    throw redirect({ to: "/building/procurement" });
  },
});
