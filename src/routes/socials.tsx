import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/socials")({
  beforeLoad: () => {
    throw redirect({ to: "/captured-remembered/socials" });
  },
});
