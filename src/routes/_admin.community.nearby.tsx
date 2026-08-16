import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/community/nearby")({
  beforeLoad: () => {
    throw redirect({ to: "/nearby" });
  },
});
