import { createFileRoute, redirect } from "@tanstack/react-router";

// Stable entry for experiment 05 (Instagram traffic). Reuses Remember When, tagged opt2m.
export const Route = createFileRoute("/one-photo-two-memories/")({
  beforeLoad: () => {
    throw redirect({ to: "/remember-when", search: { src: "opt2m", from: undefined } });
  },
});
