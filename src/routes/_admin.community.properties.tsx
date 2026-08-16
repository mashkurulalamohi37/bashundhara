import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/community/properties")({
  beforeLoad: () => {
    throw redirect({ to: "/properties" });
  },
});
