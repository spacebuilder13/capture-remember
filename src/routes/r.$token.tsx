import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { familyLinkHead } from "@/lib/remember-share";
import { getRememberPreviewMeta } from "@/lib/remember.functions";

// Short alias for the Remember When family link. It carries its own preview tags
// so link-preview readers that don't follow redirects still see the story.
export const Route = createFileRoute("/r/$token")({
  loader: ({ params }) => getRememberPreviewMeta({ data: { token: params.token } }).catch(() => null),
  head: ({ params, loaderData }) => familyLinkHead(params.token, loaderData),
  component: ShortLink,
});

function ShortLink() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  useEffect(() => {
    void navigate({ to: "/remember-when/$token", params: { token }, replace: true });
  }, [token, navigate]);
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <Link to="/remember-when/$token" params={{ token }} className="rounded-sm bg-primary px-6 py-3 font-semibold text-primary-foreground">
        Open story
      </Link>
    </main>
  );
}
