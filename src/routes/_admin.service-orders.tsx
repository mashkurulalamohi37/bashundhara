import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/service-orders")({
  beforeLoad: () => {
    throw redirect({ to: "/services/orders" });
  },
});
