import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/caretaker/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/caretaker/console" });
  },
});
