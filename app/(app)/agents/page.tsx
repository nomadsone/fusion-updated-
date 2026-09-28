"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { SpotlightCard } from "@/components/effects/EliteEffects";
import { toast } from "sonner";
import {
  RefreshCw, Loader2, Star, Trash2, Plus, Search, Zap, Save, ChevronDown, ChevronUp, Lock,
} from "lucide-react";

interface Conn {
  id: string; kind: string; name: string; baseUrl: string; vaultId: string | null; enabled: boolean;
  status: string; lastCheckedAt: string | null; lastLatencyMs: number | null; lastError: string | null;
}
interface Model {
  id: string; connectionId: string; modelId: string; name: string | null; tier: "free" | "paid" | "local";
  contextLength: number | null; enabled: boolean; status: string; lastLatencyMs: number | null; lastError: string | null;
}
interface Cfg { id: string; defaultModelRowId: string | null; allowPaid: boolean }

const KIND_HINT: Record<string, string> = {
  openrouter: "Free models default. Key: openrouter.ai/keys",
  ollama: "Local models on your machine. Site must reach this URL (run locally or use a tunnel).",
  hermes: "Hermes Agent OpenAI-compatible API (…/v1).",
  pi: "Pi Agent OpenAI-compatible API (…/v1).",
  custom: "Any OpenAI-compatible endpoint (…/v1).",
};

function Light({ status, title }: { status: string; title?: string }) {
  const c = status === "ok" ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : status === "fail" ? "bg-red-500 shadow-[0_0_8px_#ef4444]" : "bg-zinc-500";
  return <span title={title || status} className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${c}`} />;
}

const tierCls: Record<string, string> = {
  free: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  local: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  paid: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

export default function AgentsPage() {
  const [conns, setConns] = useState<Conn[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<Record<string, string>>({});
  const [search, setSearch] = useState<Record<string, string>>({});
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState(false);
  const [nc, setNc] = useState({ name: "", baseUrl: "", key: "" });

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/llm");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setConns(d.connections); setModels(d.models); setCfg(d.config);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load. Run npm run db:push.");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const patch = async (body: Record<string, unknown>, okMsg?: string) => {
    const r = await fetch("/api/llm", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { toast.error(d.error || "Failed"); return false; }
    if (okMsg) toast.success(okMsg);
    await load();
    return true;
  };

  const refresh = async (c: Conn) => {
    setBusy(`r:${c.id}`);
    try {
      const r = await fetch("/api/llm/refresh", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ connectionId: c.id }) });
      const d = await r.json();
      if (d.ok) { toast.success(`${c.name}: ${d.total} models (${d.added} new, ${d.free} free)`); setOpen((o) => ({ ...o, [c.id]: true })); }
      else toast.error(d.error || "Refresh failed");
    } catch { toast.error("Refresh failed"); }
    setBusy(null); load();
  };

  const test = async (m: Model, quiet = false) => {
    setBusy(`t:${m.id}`);
    try {
      const r = await fetch("/api/llm/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ modelRowId: m.id }) });
      const d = await r.json();
      if (!quiet) d.ok ? toast.success(`Working — ${d.latencyMs}ms`) : toast.error(d.error || "Test failed");
    } catch { if (!quiet) toast.error("Test failed"); }
    setBusy(null); if (!quiet) load();
  };

  const testEnabled = async (c: Conn) => {
    const list = models.filter((m) => m.connectionId === c.id && m.enabled).slice(0, 15);
    if (!list.length) return toast.error("Enable some models first");
    for (const m of list) await test(m, true);
    await load(); toast.success(`Tested ${list.length} models`);
  };

  const saveConn = async (c: Conn) => {
    const url = (urls[c.id] ?? c.baseUrl).trim();
    const key = (keys[c.id] ?? "").trim();
    setBusy(`s:${c.id}`);
    let vaultId = c.vaultId;
    if (key) {
      const r = vaultId
        ? await fetch(`/api/vault/${vaultId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, status: "active" }) })
        : await fetch("/api/vault", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider: c.kind, label: c.name, key, baseUrl: url }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { toast.error(d.error || "Key save failed"); setBusy(null); return; }
      vaultId = d.id ?? vaultId;
    }
    await patch({ action: "updateConnection", connectionId: c.id, baseUrl: url, vaultId }, "Saved");
    setKeys((k) => ({ ...k, [c.id]: "" }));
    setBusy(null);
  };

  const addConn = async () => {
    if (!nc.name.trim() || !nc.baseUrl.trim()) return;
    let vaultId: string | null = null;
    if (nc.key.trim()) {
      const r = await fetch("/api/vault", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider: "custom", label: nc.name, key: nc.key.trim(), baseUrl: nc.baseUrl }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return toast.error(d.error || "Key save failed");
      vaultId = d.id;
    }
    const r = await fetch("/api/llm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "custom", name: nc.name.trim(), baseUrl: nc.baseUrl.trim(), vaultId }) });
    if (!r.ok) return toast.error("Failed to add");
    setNc({ name: "", baseUrl: "", key: "" }); setAdding(false); toast.success("Connection added"); load();
  };

  const def = useMemo(() => models.find((m) => m.id === cfg?.defaultModelRowId), [models, cfg]);
  const defConn = conns.find((c) => c.id === def?.connectionId);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>Agent Connections</h1>
          <p className="text-sm text-text-muted">One place to control every model the site runs on. Free models by default.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setAdding((a) => !a)} className="px-3 py-2 rounded-lg text-xs font-medium bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 cursor-pointer flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" /> Add connection
          </button>
        </div>
      </div>

      <SpotlightCard className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Light status={def ? def.status : "unknown"} />
            <div>
              <div className="text-xs text-text-muted">Site default model</div>
              <div className="text-sm font-semibold text-text-primary">{def ? `${def.name || def.modelId}` : "None set — pick one below (★)"}</div>
              {defConn && <div className="text-[11px] text-text-muted">via {defConn.name}</div>}
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <Lock className="w-4 h-4 text-amber-300" />
            <span className="text-xs text-text-muted">Allow paid models</span>
            <input type="checkbox" checked={!!cfg?.allowPaid} onChange={(e) => patch({ action: "setAllowPaid", allowPaid: e.target.checked }, e.target.checked ? "Paid models unlocked" : "Paid models locked")} className="w-4 h-4 accent-red-600" />
          </label>
        </div>
      </SpotlightCard>

      {adding && (
        <SpotlightCard className="p-4 space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <input placeholder="Name (e.g. My vLLM)" value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })} className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm text-text-primary" />
            <input placeholder="Base URL (…/v1)" value={nc.baseUrl} onChange={(e) => setNc({ ...nc, baseUrl: e.target.value })} className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm text-text-primary" />
            <input placeholder="API key (optional)" type="password" value={nc.key} onChange={(e) => setNc({ ...nc, key: e.target.value })} className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm text-text-primary" />
          </div>
          <button onClick={addConn} className="px-4 py-2 rounded-lg text-xs font-medium bg-accent text-white cursor-pointer">Add</button>
        </SpotlightCard>
      )}

      {conns.map((c) => {
        const all = models.filter((m) => m.connectionId === c.id);
        const f = filter[c.id] || "all";
        const q = (search[c.id] || "").toLowerCase();
        const list = all
          .filter((m) => (f === "all" ? true : f === "on" ? m.enabled : m.tier === f))
          .filter((m) => !q || m.modelId.toLowerCase().includes(q) || (m.name || "").toLowerCase().includes(q))
          .sort((a, b) => Number(b.id === cfg?.defaultModelRowId) - Number(a.id === cfg?.defaultModelRowId) || Number(b.status === "ok") - Number(a.status === "ok") || (a.name || a.modelId).localeCompare(b.name || b.modelId))
          .slice(0, 200);
        const isOpen = open[c.id];
        return (
          <SpotlightCard key={c.id} className="p-0 overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Light status={c.status} title={c.lastError || c.status} />
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{c.name}</div>
                    <div className="text-[11px] text-text-muted">{KIND_HINT[c.kind] || KIND_HINT.custom}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
                    <input type="checkbox" checked={c.enabled} onChange={(e) => patch({ action: "updateConnection", connectionId: c.id, enabled: e.target.checked })} className="w-4 h-4 accent-red-600" /> Enabled
                  </label>
                  <button onClick={() => refresh(c)} disabled={busy === `r:${c.id}`} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 cursor-pointer flex items-center gap-1.5 disabled:opacity-50">
                    {busy === `r:${c.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Refresh models
                  </button>
                  <button onClick={() => testEnabled(c)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-text-primary border border-white/10 hover:bg-white/10 cursor-pointer flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Test enabled
                  </button>
                  {!["openrouter", "ollama", "hermes", "pi"].includes(c.kind) && (
                    <button onClick={() => confirm(`Delete ${c.name}?`) && patch({ action: "deleteConnection", connectionId: c.id }, "Removed")} className="p-1.5 text-red-400 hover:text-red-300 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                <input value={urls[c.id] ?? c.baseUrl} onChange={(e) => setUrls({ ...urls, [c.id]: e.target.value })} className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm text-text-primary" placeholder="Base URL" />
                <input type="password" value={keys[c.id] ?? ""} onChange={(e) => setKeys({ ...keys, [c.id]: e.target.value })} className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-sm text-text-primary" placeholder={c.vaultId ? "API key saved — paste to replace" : c.kind === "openrouter" ? "OpenRouter key (or set OPENROUTER_API_KEY)" : "API key (optional)"} />
                <button onClick={() => saveConn(c)} disabled={busy === `s:${c.id}`} className="px-4 py-2 rounded-lg text-xs font-medium bg-accent text-white cursor-pointer flex items-center gap-1.5 disabled:opacity-50"><Save className="w-3.5 h-3.5" /> Save</button>
              </div>
              {c.lastError && c.status === "fail" && <div className="text-[11px] text-red-400 break-words">{c.lastError}</div>}

              <button onClick={() => setOpen({ ...open, [c.id]: !isOpen })} className="text-xs text-text-muted hover:text-text-primary cursor-pointer flex items-center gap-1">
                {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {all.length} models · {all.filter((m) => m.tier === "free").length} free · {all.filter((m) => m.tier === "local").length} local · {all.filter((m) => m.enabled).length} enabled
              </button>
            </div>

            {isOpen && (
              <div className="border-t border-white/10 p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {["all", "free", "local", "paid", "on"].map((t) => (
                    <button key={t} onClick={() => setFilter({ ...filter, [c.id]: t })} className={`px-2.5 py-1 rounded-md text-[11px] cursor-pointer border ${f === t ? "bg-accent/20 text-accent border-accent/30" : "border-white/10 text-text-muted hover:text-text-primary"}`}>{t === "on" ? "enabled" : t}</button>
                  ))}
                  <div className="relative ml-auto">
                    <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input value={search[c.id] || ""} onChange={(e) => setSearch({ ...search, [c.id]: e.target.value })} placeholder="Search models" className="pl-7 pr-2 py-1.5 rounded-md bg-black/30 border border-white/10 text-xs text-text-primary" />
                  </div>
                </div>
                {list.length === 0 && <div className="text-xs text-text-muted py-4 text-center">No models. Hit “Refresh models”.</div>}
                <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
                  {list.map((m) => {
                    const isDef = m.id === cfg?.defaultModelRowId;
                    const locked = m.tier === "paid" && !cfg?.allowPaid;
                    return (
                      <div key={m.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${isDef ? "border-accent/40 bg-accent/10" : "border-white/5 bg-white/[0.02]"}`}>
                        <Light status={m.status} title={m.lastError || m.status} />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-text-primary truncate">{m.name || m.modelId}</div>
                          <div className="text-[10px] text-text-muted truncate">{m.modelId}{m.contextLength ? ` · ${Math.round(m.contextLength / 1000)}k ctx` : ""}{m.lastLatencyMs ? ` · ${m.lastLatencyMs}ms` : ""}</div>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded border text-[10px] ${tierCls[m.tier]}`}>{m.tier}</span>
                        <button onClick={() => test(m)} disabled={busy === `t:${m.id}`} className="px-2 py-1 rounded-md text-[11px] border border-white/10 text-text-primary hover:bg-white/10 cursor-pointer disabled:opacity-50">
                          {busy === `t:${m.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : "Test"}
                        </button>
                        <input type="checkbox" checked={m.enabled} disabled={locked && !m.enabled} onChange={(e) => patch({ action: "toggleModel", modelRowId: m.id, enabled: e.target.checked })} className="w-4 h-4 accent-red-600" title={locked ? "Paid models locked" : "Enable"} />
                        <button onClick={() => patch({ action: "setDefault", modelRowId: m.id }, "Default set")} title="Set as site default" className="cursor-pointer"><Star className={`w-4 h-4 ${isDef ? "fill-yellow-400 text-yellow-400" : "text-text-muted hover:text-yellow-300"}`} /></button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </SpotlightCard>
        );
      })}
    </div>
  );
}
