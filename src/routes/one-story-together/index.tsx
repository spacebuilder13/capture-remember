import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/one-story-together/")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
