import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const text = z.string().trim().max(180).optional();

export const submitMemoryContribution = createServerFn({ method: "POST" })
  .inputValidator((d) => {
    if (!(d instanceof FormData)) throw new Error("Bad input");
    const photo = d.get("photo");
    if (!(photo instanceof File)) throw new Error("No photo");
    const fields = z
      .object({ remembers: text, missing: text, email: z.string().trim().email().max(320) })
      .parse({ remembers: d.get("remembers") ?? undefined, missing: d.get("missing") ?? undefined, email: d.get("email") });
    return { photo, ...fields };
  })
  .handler(async ({ data }) => {
    const ext = TYPES[data.photo.type];
    if (!ext) return { error: "Choose a JPG, PNG, or WebP photo." };
    if (data.photo.size <= 0 || data.photo.size > 10 * 1024 * 1024) return { error: "Choose a photo smaller than 10 MB." };
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await db.from("memory_contributions").select("id", { count: "exact", head: true }).gte("created_at", since);
    if ((count ?? 0) > 300) return { error: "Too many memories right now. Please try again soon." };
    const path = `incoming/${crypto.randomUUID()}.${ext}`;
    const up = await db.storage.from("memory-contributions").upload(path, await data.photo.arrayBuffer(), { contentType: data.photo.type, upsert: false });
    if (up.error) {
      console.error(up.error);
      return { error: "Your photo could not be saved. Please try again." };
    }
    const ins = await db.from("memory_contributions").insert({
      photo_path: path,
      happened: null,
      remembers: data.remembers || null,
      missing: data.missing || null,
      email: data.email,
      status: "requested",
    });
    if (ins.error) {
      console.error(ins.error);
      await db.storage.from("memory-contributions").remove([path]);
      return { error: "Your memory could not be saved. Please try again." };
    }
    return { ok: true };
  });
