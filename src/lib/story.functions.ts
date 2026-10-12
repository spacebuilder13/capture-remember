import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const token = z.string().regex(/^[gcr]_[A-Za-z0-9_-]{40,}$/);
const STEPS = [
  "parent_setup",
  "grandparent_opened",
  "grandparent_recorded",
  "child_played",
  "child_chose",
  "return_sent",
  "reply_opened",
  "reply_recorded",
] as const;
const KINDS = ["story", "question", "own_line", "roar", "reply"] as const;
type Kind = (typeof KINDS)[number];
const ROLE_KINDS: Record<string, Kind[]> = { g: ["story", "question", "own_line"], c: ["roar"], r: ["reply"] };
const MAX_SECONDS: Record<Kind, number> = { story: 300, question: 30, own_line: 30, roar: 30, reply: 300 };

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function newToken(prefix: string) {
  const b = crypto.getRandomValues(new Uint8Array(32));
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return `${prefix}_${btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
}

function column(t: string) {
  return t.startsWith("g_") ? "grandparent_token" : t.startsWith("c_") ? "child_token" : "reply_token";
}

async function findStory(t: string) {
  const db = await admin();
  const { data } = await db.from("family_stories").select("*").eq(column(t), t).maybeSingle();
  return data;
}

export const createStory = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        childName: z.string().trim().min(1).max(30),
        ageBand: z.enum(["3–4", "5–7"]),
        theme: z.enum(["dinosaurs", "space", "animals"]),
        detail: z.string().trim().max(80),
        grandparentLabel: z.string().trim().min(1).max(20),
        device: z.string().max(20),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await db.from("family_stories").select("id", { count: "exact", head: true }).gte("created_at", since);
    if ((count ?? 0) > 300) return { error: "Too many stories right now. Please try again soon." };
    const row = {
      grandparent_token: newToken("g"),
      child_token: newToken("c"),
      reply_token: newToken("r"),
      child_name: data.childName,
      age_band: data.ageBand,
      theme: data.theme,
      detail: data.detail || null,
      grandparent_label: data.grandparentLabel,
      steps: { parent_setup: new Date().toISOString() },
      devices: { parent: data.device },
    };
    const { error } = await db.from("family_stories").insert(row);
    if (error) {
      console.error(error);
      return { error: "We could not save the story. Please try again." };
    }
    return { grandparentToken: row.grandparent_token, childToken: row.child_token, replyToken: row.reply_token };
  });

export const getStory = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token }).parse(d))
  .handler(async ({ data }) => {
    const story = await findStory(data.token);
    if (!story) return { error: "not_found" as const };
    const db = await admin();
    const { data: recs } = await db
      .from("story_recordings")
      .select("kind, path, duration_seconds, created_at")
      .eq("story_id", story.id)
      .order("created_at", { ascending: false });
    const role = data.token[0] as "g" | "c" | "r";
    const visible: Record<string, Kind[]> = { g: ["story", "question", "own_line"], c: ["story", "question", "own_line", "roar", "reply"], r: ["roar"] };
    const urls: Partial<Record<Kind, string>> = {};
    for (const r of recs ?? []) {
      const k = r.kind as Kind;
      if (urls[k] || !(visible[role] ?? []).includes(k)) continue;
      const { data: s } = await db.storage.from("story-audio").createSignedUrl(r.path, 3600);
      if (s?.signedUrl) urls[k] = s.signedUrl;
    }
    const steps = story.steps as Record<string, string>;
    return {
      role,
      childName: story.child_name,
      ageBand: story.age_band as "3–4" | "5–7",
      theme: story.theme,
      detail: story.detail ?? "",
      grandparentLabel: story.grandparent_label,
      choice: story.choice,
      recordings: urls,
      returnSent: story.return_sent,
      replyHeard: Boolean(steps['reply_opened']),
      // only the parent-controlled child link can pass on the other links
      links: role === "c" ? { reply: story.reply_token } : role === "g" ? { child: story.child_token } : {},
    };
  });

export const trackStep = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token, step: z.enum(STEPS), device: z.string().max(20).optional() }).parse(d))
  .handler(async ({ data }) => {
    const story = await findStory(data.token);
    if (!story) return { ok: false };
    const steps = { ...(story.steps as Record<string, string>) };
    if (!steps[data.step]) steps[data.step] = new Date().toISOString();
    const devices = { ...(story.devices as Record<string, string>) };
    const roleName = data.token.startsWith("g_") ? "grandparent" : data.token.startsWith("c_") ? "child" : "reply";
    if (data.device && !devices[roleName]) devices[roleName] = data.device;
    const db = await admin();
    await db
      .from("family_stories")
      .update({ steps, devices, ...(data.step === "return_sent" ? { return_sent: true } : {}) })
      .eq("id", story.id);
    return { ok: true };
  });

export const uploadRecording = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        token,
        kind: z.enum(KINDS),
        audioBase64: z.string().min(10).max(10_000_000),
        mime: z.string().regex(/^audio\/[a-z0-9.+-]+(;.*)?$/i).max(80),
        seconds: z.number().min(0).max(600),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const role = data.token[0] ?? "";
    if (!ROLE_KINDS[role]?.includes(data.kind)) return { error: "This link cannot add that recording." };
    if (data.seconds > MAX_SECONDS[data.kind] + 2) return { error: "That recording is too long." };
    const story = await findStory(data.token);
    if (!story) return { error: "We could not find this story." };
    const db = await admin();
    const { count } = await db.from("story_recordings").select("id", { count: "exact", head: true }).eq("story_id", story.id);
    if ((count ?? 0) >= 30) return { error: "This story has too many recordings." };
    const bytes = Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0));
    if (bytes.byteLength > 7 * 1024 * 1024) return { error: "That recording is too large." };
    const mime = data.mime.split(";")[0] ?? "audio/webm";
    const ext = mime.includes("mp4") ? "m4a" : mime.includes("ogg") ? "ogg" : "webm";
    const path = `${story.id}/${data.kind}-${crypto.randomUUID()}.${ext}`;
    const up = await db.storage.from("story-audio").upload(path, bytes, { contentType: mime });
    if (up.error) {
      console.error(up.error);
      return { error: "We could not save the recording. Please try again." };
    }
    await db.from("story_recordings").insert({ story_id: story.id, kind: data.kind, path, duration_seconds: data.seconds });
    const steps = { ...(story.steps as Record<string, string>) };
    const now = new Date().toISOString();
    const patch: { own_line_added?: boolean; own_line_seconds?: number; second_exchange?: boolean; second_exchange_by?: string } = {};
    if (data.kind === "story" && !steps['grandparent_recorded']) steps['grandparent_recorded'] = now;
    if (data.kind === "own_line") {
      patch.own_line_added = true;
      patch.own_line_seconds = Math.round(data.seconds * 10) / 10;
    }
    if (data.kind === "reply") {
      if (!steps['reply_recorded']) steps['reply_recorded'] = now;
      patch.second_exchange = true;
      patch.second_exchange_by = "grandparent";
    }
    await db.from("family_stories").update({ ...patch, steps }).eq("id", story.id);
    return { ok: true };
  });

export const saveChoice = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token, choice: z.string().max(60).optional(), response: z.string().max(60).optional() }).parse(d))
  .handler(async ({ data }) => {
    if (!data.token.startsWith("c_")) return { ok: false };
    const story = await findStory(data.token);
    if (!story) return { ok: false };
    const db = await admin();
    await db
      .from("family_stories")
      .update({ ...(data.choice ? { choice: data.choice } : {}), ...(data.response ? { parent_response: data.response } : {}) })
      .eq("id", story.id);
    return { ok: true };
  });

export const deleteStory = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token }).parse(d))
  .handler(async ({ data }) => {
    if (!data.token.startsWith("c_")) return { ok: false };
    const story = await findStory(data.token);
    if (!story) return { ok: true };
    const db = await admin();
    const { data: recs } = await db.from("story_recordings").select("path").eq("story_id", story.id);
    if (recs?.length) await db.storage.from("story-audio").remove(recs.map((r) => r.path));
    await db.from("family_stories").delete().eq("id", story.id);
    return { ok: true };
  });

const phone = z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/);

export const submitSetupRequest = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        parentName: z.string().trim().min(1).max(40),
        parentWhatsapp: phone,
        childName: z.string().trim().min(1).max(30),
        childAge: z.string().trim().min(1).max(10),
        favouriteThing: z.string().trim().min(1).max(80),
        grandparentLabel: z.string().trim().min(1).max(20),
        grandparentWhatsapp: z.string().trim().regex(/^\+[0-9 ()-]{7,20}$/),
        consented: z.literal(true),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await db.from("story_setup_requests").select("id", { count: "exact", head: true }).gte("created_at", since);
    if ((count ?? 0) > 100) return { error: "Too many requests right now. Please try again soon." };
    const { error } = await db.from("story_setup_requests").insert({
      parent_name: data.parentName,
      parent_whatsapp: data.parentWhatsapp,
      child_name: data.childName,
      child_age: data.childAge,
      favourite_thing: data.favouriteThing,
      grandparent_label: data.grandparentLabel,
      grandparent_whatsapp: data.grandparentWhatsapp,
      consented: true,
    });
    if (error) {
      console.error(error);
      return { error: "We could not save this. Please try again." };
    }
    return { ok: true };
  });
