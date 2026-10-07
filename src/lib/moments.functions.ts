import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const EVENTS = [
  "page_view",
  "invite_start",
  "photo_selected",
  "context_submitted",
  "message_approved",
  "delivery_chosen",
  "submission_complete",
] as const;

const sessionId = z.string().min(8).max(64);

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function tooMany(sid: string, event: string, limit: number) {
  const db = await admin();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await db
    .from("moment_events")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sid)
    .eq("event", event)
    .gte("created_at", since);
  return (count ?? 0) >= limit;
}

export const logMomentEvent = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ sessionId, event: z.enum(EVENTS) }).parse(d))
  .handler(async ({ data }) => {
    if (await tooMany(data.sessionId, data.event, 30)) return { ok: false };
    const db = await admin();
    await db.from("moment_events").insert({ session_id: data.sessionId, event: data.event });
    return { ok: true };
  });

const INSTRUCTIONS = `You turn a parent's short note about an ordinary moment with their young child into a few warm sentences for a grandparent who lives far away.
Rules:
- Use only facts in the note. Never invent names, places, words the child said, ages, or events.
- Plain conversational English, 2 to 4 sentences, under 70 words.
- No guilt, no "you missed", no sadness about distance, no emojis.
- Address the grandparent directly only if a name is given.`;

export const rewriteMoment = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        sessionId,
        note: z.string().trim().min(8).max(600),
        grandparentName: z.string().trim().max(40).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (await tooMany(data.sessionId, "context_submitted", 10)) {
      return { error: "That's a lot of rewrites for one visit. Please try again in a little while." };
    }
    const db = await admin();
    await db.from("moment_events").insert({ session_id: data.sessionId, event: "context_submitted" });
    const { respond, GatewayError } = await import("./ai-gateway.server");
    try {
      const { text } = await respond(
        [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Grandparent name: ${data.grandparentName || "(none given)"}\nParent's note: ${data.note}`,
              },
            ],
          },
        ],
        {
          instructions: INSTRUCTIONS,
          schema: {
            name: "moment",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: { moment: { type: "string" } },
              required: ["moment"],
            },
          },
        },
      );
      const parsed = JSON.parse(text) as { moment: string };
      if (!parsed.moment?.trim()) throw new Error("empty");
      return { moment: parsed.moment.trim() };
    } catch (e) {
      console.error("rewriteMoment", e);
      if (e instanceof GatewayError && [402, 403, 429].includes(e.status)) return { error: e.message };
      return { error: "We couldn't write that up just now. Please try again." };
    }
  });

export const submitMoment = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        sessionId,
        note: z.string().trim().min(8).max(600),
        rewritten: z.string().trim().min(8).max(1200),
        grandparentName: z.string().trim().max(40).optional(),
        delivery: z.enum(["whatsapp", "email", "imessage"]),
        photoBase64: z.string().max(11_200_000),
        photoType: z.enum(["image/jpeg", "image/png", "image/webp"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    if (await tooMany(data.sessionId, "submission_complete", 5)) {
      return { error: "You've saved a few already. Please try again later." };
    }
    const db = await admin();
    const bytes = Uint8Array.from(atob(data.photoBase64), (c) => c.charCodeAt(0));
    if (bytes.byteLength > 8 * 1024 * 1024) return { error: "That photo is over 8 MB." };
    const ext = data.photoType.split("/")[1];
    const path = `incoming/${data.sessionId}/${crypto.randomUUID()}.${ext}`;
    const up = await db.storage.from("moment-photos").upload(path, bytes, { contentType: data.photoType });
    if (up.error) {
      console.error(up.error);
      return { error: "We couldn't save the photo. Please try again." };
    }
    const ins = await db.from("moment_shares").insert({
      session_id: data.sessionId,
      note: data.note,
      rewritten: data.rewritten,
      grandparent_name: data.grandparentName || null,
      delivery: data.delivery,
      photo_path: path,
    });
    if (ins.error) {
      console.error(ins.error);
      return { error: "We couldn't save your moment. Please try again." };
    }
    await db.from("moment_events").insert({ session_id: data.sessionId, event: "submission_complete" });
    return { ok: true };
  });
