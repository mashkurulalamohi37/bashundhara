import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/community/directory")({
  beforeLoad: () => {
    throw redirect({ to: "/directory" });
  },
});
