import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { SPARK_KEYS } from "@/lib/remember-sparks";

const token = z.string().regex(/^rw_[A-Za-z0-9_-]{40,}$/);
const tag = z.string().trim().max(40).regex(/^[a-z0-9_-]*$/i).optional();

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function newToken() {
  const b = crypto.getRandomValues(new Uint8Array(32));
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return `rw_${btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
}

export const saveRememberStory = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        spark: z.enum(SPARK_KEYS),
        story: z.string().trim().min(3).max(400),
        mode: z.enum(["spoken", "typed"]),
        source: tag,
        nominatedBy: tag,
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await db.from("remember_stories").select("id", { count: "exact", head: true }).gte("created_at", since);
    if ((count ?? 0) > 500) return { error: "Too many stories right now. Please try again soon." };
    const row = {
      token: newToken(),
      spark: data.spark,
      story: data.story,
      mode: data.mode,
      length_chars: data.story.length,
      source: data.source || null,
      nominated_by: data.nominatedBy || null,
    };
    const { error } = await db.from("remember_stories").insert(row);
    if (error) {
      console.error(error);
      return { error: "We could not save your story. Please try again." };
    }
    return { token: row.token };
  });

export const saveRememberEmail = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token, email: z.string().trim().email().max(200) }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.from("remember_stories").update({ email: data.email.toLowerCase() }).eq("token", data.token).is("email", null);
    if (error) {
      console.error(error);
      return { error: "We could not save your email. Please try again." };
    }
    return { ok: true };
  });

export const getRememberStory = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row } = await db.from("remember_stories").select("id, spark, story, link_opened_at").eq("token", data.token).maybeSingle();
    if (!row) return { error: "This link does not work. It may have been deleted." };
    if (!row.link_opened_at) await db.from("remember_stories").update({ link_opened_at: new Date().toISOString() }).eq("id", row.id);
    const { data: f } = await db.from("remember_followups").select("answer, who").eq("story_id", row.id).order("created_at", { ascending: false }).limit(1);
    return { spark: row.spark, story: row.story, last: f?.[0] ?? null };
  });

export const answerRememberFollowup = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        token,
        answer: z.enum(["joined", "just_me", "not_yet"]),
        who: z.array(z.enum(["partner", "grandparent", "child", "someone_else"])).max(4).default([]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row } = await db.from("remember_stories").select("id").eq("token", data.token).maybeSingle();
    if (!row) return { error: "This link does not work." };
    const { count } = await db.from("remember_followups").select("id", { count: "exact", head: true }).eq("story_id", row.id);
    if ((count ?? 0) > 20) return { ok: true };
    const { error } = await db.from("remember_followups").insert({ story_id: row.id, answer: data.answer, who: data.who });
    if (error) {
      console.error(error);
      return { error: "We could not save your answer. Please try again." };
    }
    return { ok: true };
  });

export const deleteRememberStory = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    await db.from("remember_stories").delete().eq("token", data.token);
    return { ok: true };
  });
