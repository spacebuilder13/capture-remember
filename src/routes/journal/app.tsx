import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/journal/app")({
  beforeLoad: () => {
    throw redirect({ to: "/journal" });
  },
});
