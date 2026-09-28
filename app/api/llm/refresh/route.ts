import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { llmConnections, llmModels } from "@/lib/db/schema";
import { authHeaders, chatBase, connectionKey } from "@/lib/llm";
import { eq } from "drizzle-orm";

interface Found { modelId: string; name: string; tier: "free" | "paid" | "local"; contextLength: number | null }

// POST /api/llm/refresh { connectionId } — pull the live model list and upsert it.
// New free/local models arrive enabled; paid models arrive disabled. Existing toggles are never overwritten.
export async function POST(req: NextRequest) {
  const { connectionId } = await req.json();
  const [c] = await db.select().from(llmConnections).where(eq(llmConnections.id, connectionId)).limit(1);
  if (!c) return NextResponse.json({ error: "Connection not found" }, { status: 404 });

  const started = Date.now();
  try {
    const key = await connectionKey(c);
    let found: Found[] = [];

    if (c.kind === "ollama") {
      const res = await fetch(`${c.baseUrl.replace(/\/+$/, "").replace(/\/v1$/, "")}/api/tags`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`Ollama ${res.status} — is it running? (ollama serve)`);
      const data = await res.json();
      found = (data.models ?? []).map((m: { name: string }) => ({ modelId: m.name, name: m.name, tier: "local" as const, contextLength: null }));
    } else {
      const res = await fetch(`${chatBase(c)}/models`, { headers: authHeaders(c, key), signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`${c.name} ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const data = await res.json();
      found = (data.data ?? []).map((m: { id: string; name?: string; context_length?: number; pricing?: { prompt?: string; completion?: string } }) => {
        const isOr = c.kind === "openrouter";
        const free = isOr
          ? m.id.endsWith(":free") || (Number(m.pricing?.prompt ?? 1) === 0 && Number(m.pricing?.completion ?? 1) === 0)
          : true; // self-hosted agents (Hermes, Pi, custom) cost nothing per call
        return { modelId: m.id, name: m.name ?? m.id, tier: isOr ? (free ? "free" : "paid") : "local", contextLength: m.context_length ?? null };
      });
    }

    const existing = await db.select().from(llmModels).where(eq(llmModels.connectionId, c.id));
    const known = new Map(existing.map((m) => [m.modelId, m]));
    const fresh = found.filter((f) => !known.has(f.modelId));
    if (fresh.length) {
      for (let i = 0; i < fresh.length; i += 100) {
        await db.insert(llmModels).values(fresh.slice(i, i + 100).map((f) => ({
          connectionId: c.id, modelId: f.modelId, name: f.name, tier: f.tier,
          contextLength: f.contextLength, enabled: f.tier !== "paid",
        })));
      }
    }
    // Refresh tier/name on existing rows (pricing can change) without touching enabled
    for (const f of found) {
      const k = known.get(f.modelId);
      if (k && (k.tier !== f.tier || k.name !== f.name)) {
        await db.update(llmModels).set({ tier: f.tier, name: f.name, contextLength: f.contextLength }).where(eq(llmModels.id, k.id));
      }
    }
    const gone = existing.filter((m) => !found.some((f) => f.modelId === m.modelId)).length;

    await db.update(llmConnections).set({
      status: "ok", lastCheckedAt: new Date(), lastLatencyMs: Date.now() - started, lastError: null,
    }).where(eq(llmConnections.id, c.id));

    return NextResponse.json({ ok: true, total: found.length, added: fresh.length, missing: gone, free: found.filter((f) => f.tier === "free").length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await db.update(llmConnections).set({ status: "fail", lastCheckedAt: new Date(), lastError: msg }).where(eq(llmConnections.id, c.id));
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
