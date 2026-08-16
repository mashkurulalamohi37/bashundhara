import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/owner/rent")({
  beforeLoad: () => {
    throw redirect({ to: "/building/rent" });
  },
});
