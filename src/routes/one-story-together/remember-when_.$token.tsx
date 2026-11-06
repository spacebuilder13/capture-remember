import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/one-story-together/remember-when_/$token")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/remember-when/$token", params: { token: params.token } });
  },
});
