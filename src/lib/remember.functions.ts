import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { SPARK_KEYS } from "@/lib/remember-sparks";
import { PHOTO_EXT, PHOTO_PATH, checkPhoto } from "@/lib/remember-photo";

const token = z.string().regex(/^rw_[A-Za-z0-9_-]{40,}$/);
const tag = z.string().trim().max(40).regex(/^[a-z0-9_-]*$/i).optional();

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function newToken(prefix = "rw_") {
  const b = crypto.getRandomValues(new Uint8Array(32));
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return `${prefix}${btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
}

export const uploadRememberPhoto = createServerFn({ method: "POST" })
  .inputValidator((d) => {
    if (!(d instanceof FormData)) throw new Error("Bad input");
    const f = d.get("photo");
    if (!(f instanceof File)) throw new Error("No photo");
    return { file: f };
  })
  .handler(async ({ data }) => {
    const bad = checkPhoto(data.file.type, data.file.size);
    if (bad) return { error: bad };
    const db = await admin();
    const path = `pending/${crypto.randomUUID()}.${PHOTO_EXT[data.file.type]}`;
    const { error } = await db.storage.from("remember-photos").upload(path, await data.file.arrayBuffer(), { contentType: data.file.type });
    if (error) {
      console.error(error);
      return { error: "We could not save your photo. Please try again." };
    }
    return { path };
  });

export const saveRememberStory = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        photoPath: z.string().regex(PHOTO_PATH),
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
    const [dir = "", name = ""] = data.photoPath.split("/");
    const { data: found } = await db.storage.from("remember-photos").list(dir, { search: name });
    if (!found?.some((o) => o.name === name)) return { error: "Please add your photo again." };
    const row = {
      photo_path: data.photoPath,
      token: newToken(),
      owner_token: newToken("rw_o_"),
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
    return { token: row.token, ownerToken: row.owner_token };
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
    const { data: row } = await db.from("remember_stories").select("id, spark, story, link_opened_at, photo_path, sender_name, child_name").eq("token", data.token).maybeSingle();
    if (!row) return { error: "This link does not work. It may have been deleted." };
    if (!row.link_opened_at) await db.from("remember_stories").update({ link_opened_at: new Date().toISOString() }).eq("id", row.id);
    const { data: f } = await db.from("remember_followups").select("answer, who").eq("story_id", row.id).order("created_at", { ascending: false }).limit(1);
    let photoUrl: string | null = null;
    if (row.photo_path) {
      const { data: s } = await db.storage.from("remember-photos").createSignedUrl(row.photo_path, 3600);
      photoUrl = s?.signedUrl ?? null;
    }
    return { spark: row.spark, story: row.story, senderName: row.sender_name, childName: row.child_name, photoUrl, last: f?.[0] ?? null };
  });

async function signed(db: Awaited<ReturnType<typeof admin>>, path: string | null) {
  if (!path) return null;
  const { data: s } = await db.storage.from("remember-photos").createSignedUrl(path, 3600);
  return s?.signedUrl ?? null;
}

export const getRememberOwnerStory = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row } = await db.from("remember_stories").select("id, spark, story, photo_path, token, child_name").eq("owner_token", data.token).maybeSingle();
    if (!row) return { error: "This link does not work. It may have been deleted." };
    const { data: replies } = await db.from("remember_replies").select("name, memory, created_at").eq("story_id", row.id).order("created_at");
    return { spark: row.spark, story: row.story, childName: row.child_name, familyToken: row.token, photoUrl: await signed(db, row.photo_path), replies: replies ?? [] };
  });

export const addRememberReply = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ token, name: z.string().trim().max(40).optional(), memory: z.string().trim().min(2).max(400) }).parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row } = await db.from("remember_stories").select("id").eq("token", data.token).maybeSingle();
    if (!row) return { error: "This link does not work." };
    const { count } = await db.from("remember_replies").select("id", { count: "exact", head: true }).eq("story_id", row.id);
    if ((count ?? 0) >= 20) return { error: "This story has lots of memories already. Thank you!" };
    const { error } = await db.from("remember_replies").insert({ story_id: row.id, name: data.name || null, memory: data.memory });
    if (error) {
      console.error(error);
      return { error: "We could not save your memory. Please try again." };
    }
    return { ok: true };
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
    const { data: row } = await db.from("remember_stories").select("id").eq("owner_token", data.token).maybeSingle();
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
    const { data: row } = await db.from("remember_stories").select("id, photo_path").eq("owner_token", data.token).maybeSingle();
    if (!row) return { error: "This link does not work." };
    if (row.photo_path) await db.storage.from("remember-photos").remove([row.photo_path]);
    await db.from("remember_followups").delete().eq("story_id", row.id);
    await db.from("remember_replies").delete().eq("story_id", row.id);
    await db.from("remember_stories").delete().eq("id", row.id);
    return { ok: true };
  });

const personName = z.string().trim().min(1).max(40);

export const setRememberNames = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token, sender: personName, child: personName }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { error } = await db.from("remember_stories").update({ sender_name: data.sender, child_name: data.child }).eq("owner_token", data.token);
    if (error) {
      console.error(error);
      return { error: "We could not save the names." };
    }
    return { ok: true };
  });
