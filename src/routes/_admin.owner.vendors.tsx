import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/owner/vendors")({
  beforeLoad: () => {
    throw redirect({ to: "/building/vendors" });
  },
});
