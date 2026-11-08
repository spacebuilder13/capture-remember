import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { SPARK_KEYS } from "@/lib/remember-sparks";
import { PHOTO_EXT, PHOTO_PATH, checkPhoto } from "@/lib/remember-photo";

// Accepts both the old long codes (40+ chars) and the new short ones (11).
const token = z.string().regex(/^rw_[A-Za-z0-9_-]{10,}$/);
const tag = z.string().trim().max(40).regex(/^[a-z0-9_-]*$/i).optional();

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export function previewPathFor(photoPath: string) {
  return photoPath.replace(/^pending\//, "preview/").replace(/\.[a-z]+$/, ".jpg");
}

async function extraPhotos(db: Awaited<ReturnType<typeof admin>>, storyId: string) {
  const { data: rows } = await db.from("remember_photos").select("path, added_by").eq("story_id", storyId).order("created_at");
  const out: { url: string; addedBy: string | null }[] = [];
  for (const r of rows ?? []) {
    const { data: s } = await db.storage.from("remember-photos").createSignedUrl(r.path, 3600);
    if (s?.signedUrl) out.push({ url: s.signedUrl, addedBy: r.added_by });
  }
  return out;
}

function newToken(prefix = "rw_") {
  // 8 random bytes -> 11 base64url chars; ~64 bits of entropy, still unguessable.
  const b = crypto.getRandomValues(new Uint8Array(8));
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return `${prefix}${btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
}

export const uploadRememberPhoto = createServerFn({ method: "POST" })
  .inputValidator((d) => {
    if (!(d instanceof FormData)) throw new Error("Bad input");
    const f = d.get("photo");
    if (!(f instanceof File)) throw new Error("No photo");
    const p = d.get("preview");
    return { file: f, preview: p instanceof File ? p : null };
  })
  .handler(async ({ data }) => {
    const bad = checkPhoto(data.file.type, data.file.size);
    if (bad) return { error: bad };
    const db = await admin();
    const id = crypto.randomUUID();
    const path = `pending/${id}.${PHOTO_EXT[data.file.type]}`;
    const { error } = await db.storage.from("remember-photos").upload(path, await data.file.arrayBuffer(), { contentType: data.file.type });
    if (error) {
      console.error(error);
      return { error: "We could not save your photo. Please try again." };
    }
    // Blurred share-preview copy (made on the phone). Optional; failures only lose the preview.
    if (data.preview && data.preview.type === "image/jpeg" && data.preview.size > 0 && data.preview.size < 600_000) {
      const r = await db.storage.from("remember-photos").upload(previewPathFor(path), await data.preview.arrayBuffer(), { contentType: "image/jpeg" });
      if (r.error) console.error(r.error);
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
    const pv = previewPathFor(data.photoPath);
    const { data: pvFound } = await db.storage.from("remember-photos").list("preview", { search: pv.split("/")[1] ?? "" });
    const row = {
      photo_path: data.photoPath,
      preview_path: pvFound?.some((o) => `preview/${o.name}` === pv) ? pv : null,
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
    return { spark: row.spark, story: row.story, senderName: row.sender_name, childName: row.child_name, photoUrl, photos: await extraPhotos(db, row.id), last: f?.[0] ?? null };
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
    const { data: followups } = await db.from("remember_followups").select("answer, who").eq("story_id", row.id).order("created_at", { ascending: false }).limit(1);
    return { spark: row.spark, story: row.story, childName: row.child_name, familyToken: row.token, photoUrl: await signed(db, row.photo_path), photos: await extraPhotos(db, row.id), replies: replies ?? [], last: followups?.[0] ?? null };
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
    const { data: row } = await db.from("remember_stories").select("id, photo_path, preview_path").eq("owner_token", data.token).maybeSingle();
    if (!row) return { error: "This link does not work." };
    const failure = { error: "We could not finish deleting your story. Please try again." };
    const { data: extra } = await db.from("remember_photos").select("path").eq("story_id", row.id);
    const paths = [row.photo_path, row.preview_path, ...(extra ?? []).map((e) => e.path)].filter((x): x is string => !!x);
    if (paths.length) {
      const { error } = await db.storage.from("remember-photos").remove(paths);
      if (error) return failure;
    }
    const photos = await db.from("remember_photos").delete().eq("story_id", row.id);
    if (photos.error) return failure;
    const followups = await db.from("remember_followups").delete().eq("story_id", row.id);
    if (followups.error) return failure;
    const replies = await db.from("remember_replies").delete().eq("story_id", row.id);
    if (replies.error) return failure;
    const story = await db.from("remember_stories").delete().eq("id", row.id);
    if (story.error) return failure;
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

export const MAX_ADDED_PHOTOS = 12;

export const addRememberPhoto = createServerFn({ method: "POST" })
  .inputValidator((d) => {
    if (!(d instanceof FormData)) throw new Error("Bad input");
    const f = d.get("photo");
    if (!(f instanceof File)) throw new Error("No photo");
    const t = token.parse(d.get("token"));
    const n = z.string().trim().max(40).optional().parse(d.get("name") ?? undefined);
    return { file: f, token: t, name: n };
  })
  .handler(async ({ data }) => {
    const bad = checkPhoto(data.file.type, data.file.size);
    if (bad) return { error: bad };
    const db = await admin();
    const owner = data.token.startsWith("rw_o_");
    const { data: row } = await db.from("remember_stories").select("id").eq(owner ? "owner_token" : "token", data.token).maybeSingle();
    if (!row) return { error: "This link does not work." };
    const { count } = await db.from("remember_photos").select("id", { count: "exact", head: true }).eq("story_id", row.id);
    if ((count ?? 0) >= MAX_ADDED_PHOTOS) return { error: "This story has lots of photos already. Thank you!" };
    const path = `added/${row.id}/${crypto.randomUUID()}.${PHOTO_EXT[data.file.type]}`;
    const up = await db.storage.from("remember-photos").upload(path, await data.file.arrayBuffer(), { contentType: data.file.type });
    if (up.error) {
      console.error(up.error);
      return { error: "We could not save your photo. Please try again." };
    }
    const { error } = await db.from("remember_photos").insert({ story_id: row.id, path, added_by: data.name || null, role: owner ? "owner" : "family" });
    if (error) {
      await db.storage.from("remember-photos").remove([path]);
      return { error: "We could not save your photo. Please try again." };
    }
    return { photos: await extraPhotos(db, row.id) };
  });

// Public, safe-to-share preview facts for a family link (names only, no story text or photo URLs).
export const getRememberPreviewMeta = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ token: z.string().max(80) }).parse(d))
  .handler(async ({ data }) => {
    if (!/^rw_(?!o_)[A-Za-z0-9_-]{10,}$/.test(data.token)) return null;
    const db = await admin();
    const { data: row } = await db.from("remember_stories").select("sender_name, child_name, preview_path").eq("token", data.token).maybeSingle();
    if (!row) return null;
    return { sender: row.sender_name, child: row.child_name, hasPreview: !!row.preview_path };
  });
