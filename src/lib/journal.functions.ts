import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "journal-media";

function ownPath(userId: string, path: string) {
  if (!path.startsWith(`${userId}/`)) throw new Error("Not your file.");
}

function safe<T>(fn: () => Promise<T>) {
  return fn().catch((e: unknown) => {
    const message = e instanceof Error ? e.message : "Something went wrong.";
    return { error: message } as const;
  });
}

/** Voice note → transcript, saved as an entry. */
export const addVoiceEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ path: z.string().min(1).max(300) }).parse(d))
  .handler(async ({ data, context }) =>
    safe(async () => {
      ownPath(context.userId, data.path);
      const { transcribeAudio } = await import("./ai-gateway.server");
      const dl = await context.supabase.storage.from(BUCKET).download(data.path);
      if (dl.error) throw new Error("Couldn't read your recording.");
      const transcript = await transcribeAudio(new Blob([await dl.data.arrayBuffer()], { type: "audio/webm" }), "voice.webm");
      const ins = await context.supabase
        .from("journal_entries")
        .insert({ user_id: context.userId, source: "voice", transcript: transcript.slice(0, 8000), media_path: data.path })
        .select()
        .single();
      if (ins.error) throw new Error("Couldn't save your entry.");
      return { entry: ins.data };
    }),
  );

/** Notebook photo → handwriting read, saved as an entry. */
export const addNotebookEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ path: z.string().min(1).max(300) }).parse(d))
  .handler(async ({ data, context }) =>
    safe(async () => {
      ownPath(context.userId, data.path);
      const { respond, toDataUrl } = await import("./ai-gateway.server");
      const dl = await context.supabase.storage.from(BUCKET).download(data.path);
      if (dl.error) throw new Error("Couldn't read your page.");
      const { text } = await respond(
        [
          {
            role: "user",
            content: [
              { type: "input_text", text: "Transcribe the handwritten journal text on this page exactly. Return only the text. If there is no readable handwriting, return NONE." },
              { type: "input_image", image_url: await toDataUrl(dl.data) },
            ],
          },
        ],
      );
      if (text.trim() === "NONE") throw new Error("We couldn't read any handwriting on that page.");
      const ins = await context.supabase
        .from("journal_entries")
        .insert({ user_id: context.userId, source: "notebook", transcript: text.trim().slice(0, 8000), media_path: data.path })
        .select()
        .single();
      if (ins.error) throw new Error("Couldn't save your entry.");
      return { entry: ins.data };
    }),
  );

/** Describe an uploaded photo so it can be matched later. */
export const captionPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) =>
    safe(async () => {
      const row = await context.supabase.from("journal_photos").select("*").eq("id", data.id).single();
      if (row.error) throw new Error("Photo not found.");
      const { respond, toDataUrl } = await import("./ai-gateway.server");
      const dl = await context.supabase.storage.from(BUCKET).download(row.data.photo_path);
      if (dl.error) throw new Error("Couldn't read your photo.");
      const { text } = await respond([
        {
          role: "user",
          content: [
            { type: "input_text", text: "Describe this personal photo in 2 short sentences for memory matching: who (roles, not names), activity, setting, mood, season or occasion." },
            { type: "input_image", image_url: await toDataUrl(dl.data) },
          ],
        },
      ]);
      await context.supabase.from("journal_photos").update({ ai_caption: text.trim().slice(0, 600) }).eq("id", data.id);
      return { caption: text.trim() };
    }),
  );

const SURFACE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["themes", "photo_id", "reason"],
  properties: {
    themes: { type: "array", items: { type: "string" } },
    photo_id: { type: "string" },
    reason: { type: "string" },
  },
};

/** Read the last 10 days of entries, find themes, pick the best-matching photo. */
export const surfaceMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) =>
    safe(async () => {
      const since = new Date(Date.now() - 10 * 86400000).toISOString();
      const [entries, photos] = await Promise.all([
        context.supabase.from("journal_entries").select("transcript, created_at").gte("created_at", since).order("created_at"),
        context.supabase.from("journal_photos").select("id, ai_caption").not("ai_caption", "is", null),
      ]);
      if (!entries.data?.length) throw new Error("Add at least one journal entry first.");
      if (!photos.data?.length) throw new Error("Add at least one photo first.");
      const { respond } = await import("./ai-gateway.server");
      const prompt = `Journal entries from the last 10 days:\n${entries.data
        .map((e) => `- (${e.created_at.slice(0, 10)}) ${e.transcript}`)
        .join("\n")}\n\nPhotos:\n${photos.data.map((p) => `- id ${p.id}: ${p.ai_caption}`).join("\n")}`;
      const { text } = await respond([{ role: "user", content: [{ type: "input_text", text: prompt }] }], {
        instructions:
          "You help a parent relive the right memory. From the journal entries, name 2-4 short, warm themes of what has been on their mind lately (max 8 words each, second person, no diagnosis). Then pick the ONE photo id that best connects to those themes, and give one gentle sentence (max 30 words) explaining the connection. Never invent facts beyond the entries and captions.",
        schema: { name: "memory_surfacing", schema: SURFACE_SCHEMA },
      });
      const parsed = JSON.parse(text) as { themes: string[]; photo_id: string; reason: string };
      const photoId = photos.data.find((p) => p.id === parsed.photo_id)?.id ?? photos.data[0].id;
      const ins = await context.supabase
        .from("memory_surfacings")
        .insert({ user_id: context.userId, themes: parsed.themes.slice(0, 4), photo_id: photoId, reason: parsed.reason })
        .select()
        .single();
      if (ins.error) throw new Error("Couldn't save today's memory.");
      return { surfacing: ins.data };
    }),
  );
