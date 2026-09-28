import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { llmConnections, llmModels } from "@/lib/db/schema";
import { authHeaders, chatBase, connectionKey } from "@/lib/llm";
import { eq } from "drizzle-orm";

// POST /api/llm/test { modelRowId } — real 1-token completion. Sets the green/red light.
export async function POST(req: NextRequest) {
  const { modelRowId } = await req.json();
  const [m] = await db.select().from(llmModels).where(eq(llmModels.id, modelRowId)).limit(1);
  if (!m) return NextResponse.json({ error: "Model not found" }, { status: 404 });
  const [c] = await db.select().from(llmConnections).where(eq(llmConnections.id, m.connectionId)).limit(1);
  if (!c) return NextResponse.json({ error: "Connection not found" }, { status: 404 });

  const started = Date.now();
  try {
    const key = await connectionKey(c);
    const res = await fetch(`${chatBase(c)}/chat/completions`, {
      method: "POST",
      headers: authHeaders(c, key),
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({ model: m.modelId, max_tokens: 8, messages: [{ role: "user", content: "Reply with: OK" }] }),
    });
    const ms = Date.now() - started;
    if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    if (!data.choices?.length) throw new Error("Empty response");
    await db.update(llmModels).set({ status: "ok", lastCheckedAt: new Date(), lastLatencyMs: ms, lastError: null }).where(eq(llmModels.id, m.id));
    return NextResponse.json({ ok: true, status: "ok", latencyMs: ms });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await db.update(llmModels).set({ status: "fail", lastCheckedAt: new Date(), lastError: msg }).where(eq(llmModels.id, m.id));
    return NextResponse.json({ ok: false, status: "fail", error: msg }, { status: 200 });
  }
}
