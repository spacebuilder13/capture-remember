// Server-only helpers for Lovable AI Gateway calls (raw HTTP, streamed).
const BASE = "https://ai.gateway.lovable.dev";
const RUN_ID = "X-Lovable-AIG-Run-ID";
export const CHAT_MODEL = "openai/gpt-6-astra";
export const STT_MODEL = "openai/gpt-transcribe";

export class GatewayError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function apiKey() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new GatewayError(401, "AI is not configured for this app yet.");
  return key;
}

async function failure(res: Response): Promise<never> {
  let msg = "";
  try {
    const body = await res.json();
    msg = body?.message || body?.error?.message || "";
  } catch {
    /* ignore */
  }
  if (res.status === 402) throw new GatewayError(402, msg || "AI credits have run out. Add credits in Settings → Plans & credits.");
  if (res.status === 429) throw new GatewayError(429, "Too many requests right now. Please try again in a minute.");
  if (res.status === 403) throw new GatewayError(403, msg || "AI access is not available for this request.");
  throw new GatewayError(res.status, msg || "The AI service could not complete this request.");
}

async function* sse(res: Response) {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n\n")) >= 0) {
      const chunk = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const data = chunk
        .split("\n")
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5).trim())
        .join("");
      if (!data || data === "[DONE]") continue;
      try {
        yield JSON.parse(data);
      } catch {
        /* skip */
      }
    }
  }
}

export type ResponseInput = Array<{ role: "user" | "system"; content: Array<Record<string, unknown>> }>;

/** Streams a Responses call and returns the final text. Optional strict JSON schema. */
export async function respond(
  input: ResponseInput,
  opts: { instructions?: string; schema?: { name: string; schema: Record<string, unknown> }; runId?: string } = {},
): Promise<{ text: string; runId?: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Lovable-API-Key": apiKey(),
    "X-Lovable-AIG-SDK": "fetch",
  };
  if (opts.runId) headers[RUN_ID] = opts.runId;
  const res = await fetch(`${BASE}/v1/responses`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: CHAT_MODEL,
      input,
      ...(opts.instructions ? { instructions: opts.instructions } : {}),
      stream: true,
      store: false,
      reasoning: { effort: "low", summary: "auto" },
      include: ["reasoning.encrypted_content"],
      ...(opts.schema
        ? { text: { format: { type: "json_schema", name: opts.schema.name, strict: true, schema: opts.schema.schema } } }
        : {}),
    }),
  });
  if (!res.ok || !res.body) await failure(res);
  const runId = res.headers.get(RUN_ID) ?? undefined;
  let text = "";
  for await (const ev of sse(res)) {
    if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
    if (ev.type === "response.failed" || ev.type === "error") {
      throw new GatewayError(500, ev?.response?.error?.message || ev?.message || "The AI could not finish.");
    }
  }
  if (!text.trim()) throw new GatewayError(422, "The AI returned nothing for this input.");
  return { text, runId };
}

export async function transcribeAudio(file: Blob, filename: string): Promise<string> {
  if (!file.size || file.size > 10 * 1024 * 1024) throw new GatewayError(400, "That recording is empty or too large.");
  const form = new FormData();
  form.append("model", STT_MODEL);
  form.append("file", file, filename);
  form.append("response_format", "json");
  form.append("stream", "true");
  const res = await fetch(`${BASE}/v1/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey()}` },
    body: form,
  });
  if (!res.ok || !res.body) await failure(res);
  let text = "";
  let done = "";
  for await (const ev of sse(res)) {
    if (ev.type === "transcript.text.delta") text += ev.delta ?? "";
    if (ev.type === "transcript.text.done") done = ev.text ?? "";
  }
  const out = (done || text).trim();
  if (!out) throw new GatewayError(422, "We couldn't hear any words in that recording.");
  return out;
}

export async function toDataUrl(blob: Blob): Promise<string> {
  const buf = Buffer.from(await blob.arrayBuffer());
  return `data:${blob.type || "image/jpeg"};base64,${buf.toString("base64")}`;
}
