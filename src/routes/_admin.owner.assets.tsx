import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/owner/assets")({
  beforeLoad: () => {
    throw redirect({ to: "/building/assets" });
  },
});
