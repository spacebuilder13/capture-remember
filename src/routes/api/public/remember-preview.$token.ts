import { createFileRoute } from "@tanstack/react-router";

// Serves ONLY the blurred share-preview copy for a family link, so WhatsApp can show it without sign-in.
// The original photo is never served here.
export const Route = createFileRoute("/api/public/remember-preview/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const t = params.token.replace(/\.jpg$/, "");
        if (!/^rw_(?!o_)[A-Za-z0-9_-]{10,80}$/.test(t)) return new Response("Not found", { status: 404 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: row } = await supabaseAdmin.from("remember_stories").select("preview_path").eq("token", t).maybeSingle();
        if (!row?.preview_path?.startsWith("preview/")) return new Response("Not found", { status: 404 });
        const { data: blob, error } = await supabaseAdmin.storage.from("remember-photos").download(row.preview_path);
        if (error || !blob) return new Response("Not found", { status: 404 });
        return new Response(blob, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=3600", "X-Robots-Tag": "noindex" } });
      },
    },
  },
});
