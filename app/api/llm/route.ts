import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { llmConnections, llmModels, llmConfig } from "@/lib/db/schema";
import { ensureSeed, getConfig } from "@/lib/llm";
import { eq } from "drizzle-orm";

// GET /api/llm — connections + models + config for the Agents dashboard
export async function GET() {
  try {
    await ensureSeed();
    const [connections, models, config] = await Promise.all([
      db.select().from(llmConnections),
      db.select().from(llmModels),
      getConfig(),
    ]);
    return NextResponse.json({ connections, models, config });
  } catch (e) {
    console.error("[llm/GET]", e);
    return NextResponse.json({ error: "Failed to load LLM config" }, { status: 500 });
  }
}

// POST /api/llm — add a custom connection { kind, name, baseUrl, vaultId? }
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b.name || !b.baseUrl) return NextResponse.json({ error: "name and baseUrl required" }, { status: 400 });
    const [row] = await db.insert(llmConnections).values({
      kind: b.kind || "custom", name: b.name, baseUrl: b.baseUrl, vaultId: b.vaultId ?? null, enabled: true,
    }).returning();
    return NextResponse.json(row);
  } catch (e) {
    console.error("[llm/POST]", e);
    return NextResponse.json({ error: "Failed to add connection" }, { status: 500 });
  }
}

// PATCH /api/llm — { action, ... }
//   setDefault {modelRowId} | toggleModel {modelRowId, enabled} | setAllowPaid {allowPaid}
//   updateConnection {connectionId, name?, baseUrl?, vaultId?, enabled?} | deleteConnection {connectionId}
export async function PATCH(req: NextRequest) {
  try {
    const b = await req.json();
    const cfg = await getConfig();
    switch (b.action) {
      case "setDefault": {
        const [m] = await db.select().from(llmModels).where(eq(llmModels.id, b.modelRowId)).limit(1);
        if (!m) return NextResponse.json({ error: "Model not found" }, { status: 404 });
        if (m.tier === "paid" && !cfg.allowPaid)
          return NextResponse.json({ error: "Paid models are locked. Turn on 'Allow paid models' first." }, { status: 403 });
        await db.update(llmModels).set({ enabled: true }).where(eq(llmModels.id, m.id));
        await db.update(llmConfig).set({ defaultModelRowId: m.id, updatedAt: new Date() }).where(eq(llmConfig.id, cfg.id));
        break;
      }
      case "toggleModel": {
        const [m] = await db.select().from(llmModels).where(eq(llmModels.id, b.modelRowId)).limit(1);
        if (!m) return NextResponse.json({ error: "Model not found" }, { status: 404 });
        if (b.enabled && m.tier === "paid" && !cfg.allowPaid)
          return NextResponse.json({ error: "Paid models are locked. Turn on 'Allow paid models' first." }, { status: 403 });
        await db.update(llmModels).set({ enabled: !!b.enabled }).where(eq(llmModels.id, m.id));
        break;
      }
      case "setAllowPaid": {
        await db.update(llmConfig).set({ allowPaid: !!b.allowPaid, updatedAt: new Date() }).where(eq(llmConfig.id, cfg.id));
        break;
      }
      case "updateConnection": {
        const u: Record<string, unknown> = {};
        for (const k of ["name", "baseUrl", "vaultId", "enabled"] as const) if (b[k] !== undefined) u[k] = b[k];
        await db.update(llmConnections).set(u).where(eq(llmConnections.id, b.connectionId));
        break;
      }
      case "deleteConnection": {
        await db.delete(llmConnections).where(eq(llmConnections.id, b.connectionId));
        break;
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[llm/PATCH]", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
