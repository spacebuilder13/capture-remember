import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/one-story-together/remember-when")({
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/remember-when", search: search as never });
  },
});
