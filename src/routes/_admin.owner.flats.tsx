import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/owner/flats")({
  beforeLoad: () => {
    throw redirect({ to: "/flats" });
  },
});
