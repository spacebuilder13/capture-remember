import { createFileRoute, redirect } from "@tanstack/react-router";

// Short alias for the Remember When family link, so shared messages stay short.
export const Route = createFileRoute("/r/$token")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/remember-when/$token", params: { token: params.token }, replace: true });
  },
});
