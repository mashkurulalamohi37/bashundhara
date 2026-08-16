import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/inventory/")({
  beforeLoad: () => {
    throw redirect({ to: "/inventory/items" });
  },
});
