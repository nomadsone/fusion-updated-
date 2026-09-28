import { db } from "@/lib/db";
import { llmConnections, llmModels, llmConfig, apiVault } from "@/lib/db/schema";
import type { LlmConnection, LlmModel } from "@/lib/db/schema";
import { decrypt } from "@/lib/crypto";
import { and, eq, asc } from "drizzle-orm";

export const SEED_CONNECTIONS = [
  { kind: "openrouter", name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", enabled: true },
  { kind: "ollama", name: "Ollama (local)", baseUrl: "http://localhost:11434", enabled: false },
  { kind: "hermes", name: "Hermes Agent", baseUrl: "http://localhost:8642/v1", enabled: false },
  { kind: "pi", name: "Pi Agent", baseUrl: "http://localhost:8000/v1", enabled: false },
] as const;

export async function ensureSeed() {
  const rows = await db.select().from(llmConnections).limit(1);
  if (rows.length === 0) await db.insert(llmConnections).values([...SEED_CONNECTIONS]);
  const cfg = await db.select().from(llmConfig).limit(1);
  if (cfg.length === 0) await db.insert(llmConfig).values({});
}

export async function getConfig() {
  await ensureSeed();
  return (await db.select().from(llmConfig).limit(1))[0];
}

/** OpenAI-compatible root for chat/models calls. */
export function chatBase(c: Pick<LlmConnection, "kind" | "baseUrl">): string {
  const b = c.baseUrl.replace(/\/+$/, "");
  return c.kind === "ollama" && !b.endsWith("/v1") ? `${b}/v1` : b;
}

export async function connectionKey(c: LlmConnection): Promise<string | null> {
  if (c.vaultId) {
    const [v] = await db.select().from(apiVault).where(eq(apiVault.id, c.vaultId)).limit(1);
    if (v) return decrypt(v.encryptedKey);
  }
  if (c.kind === "openrouter") return process.env.OPENROUTER_API_KEY ?? null;
  return null;
}

export function authHeaders(c: LlmConnection, key: string | null): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (key) h.Authorization = `Bearer ${key}`;
  if (c.kind === "openrouter") {
    h["HTTP-Referer"] = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    h["X-Title"] = "merQato";
  }
  return h;
}

export interface ResolvedLlm {
  baseUrl: string;
  apiKey: string | null;
  model: string;
  modelRowId: string;
  connection: LlmConnection;
  headers: Record<string, string>;
}

async function build(m: LlmModel, c: LlmConnection): Promise<ResolvedLlm> {
  const apiKey = await connectionKey(c);
  return { baseUrl: chatBase(c), apiKey, model: m.modelId, modelRowId: m.id, connection: c, headers: authHeaders(c, apiKey) };
}

/**
 * Single source of truth for "which model do we call".
 * Order: explicit modelRowId → saved default → first green enabled model.
 * Paid models are skipped unless allowPaid is on. Returns null if nothing usable.
 */
export async function resolveLlm(opts?: { modelRowId?: string }): Promise<ResolvedLlm | null> {
  const cfg = await getConfig();
  const conns = await db.select().from(llmConnections).where(eq(llmConnections.enabled, true));
  const byId = new Map(conns.map((c) => [c.id, c]));
  const allowed = (m: LlmModel) => m.enabled && byId.has(m.connectionId) && (cfg.allowPaid || m.tier !== "paid");

  const tryId = async (id?: string | null) => {
    if (!id) return null;
    const [m] = await db.select().from(llmModels).where(eq(llmModels.id, id)).limit(1);
    return m && allowed(m) ? build(m, byId.get(m.connectionId)!) : null;
  };

  const picked = (await tryId(opts?.modelRowId)) ?? (await tryId(cfg.defaultModelRowId));
  if (picked) return picked;

  // Fallback: free/local models that passed the last health check, fastest first
  const rows = await db.select().from(llmModels)
    .where(and(eq(llmModels.enabled, true), eq(llmModels.status, "ok")))
    .orderBy(asc(llmModels.lastLatencyMs));
  const m = rows.find(allowed);
  return m ? build(m, byId.get(m.connectionId)!) : null;
}

/** One-shot chat completion through whatever resolveLlm picks. */
export async function llmChat(
  messages: { role: string; content: string }[],
  opts?: { modelRowId?: string; maxTokens?: number; temperature?: number; timeoutMs?: number },
) {
  const r = await resolveLlm({ modelRowId: opts?.modelRowId });
  if (!r) throw new Error("No usable model. Open Agents → refresh models → enable one → run its test.");
  const res = await fetch(`${r.baseUrl}/chat/completions`, {
    method: "POST",
    headers: r.headers,
    signal: AbortSignal.timeout(opts?.timeoutMs ?? 60000),
    body: JSON.stringify({ model: r.model, messages, max_tokens: opts?.maxTokens ?? 1024, temperature: opts?.temperature ?? 0.7 }),
  });
  if (!res.ok) throw new Error(`${r.connection.name} ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return { text: (data.choices?.[0]?.message?.content ?? "") as string, model: r.model, connection: r.connection.name, raw: data };
}
