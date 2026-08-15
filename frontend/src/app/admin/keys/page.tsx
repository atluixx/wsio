"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchAdminApiKeys, deleteAdminApiKey, createApiKey, ApiKeyItem } from "@/lib/api";
import {
  ShieldAlert,
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock,
  Clock,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function AdminKeysPage() {
  const { user, isAuthenticated } = useAuth();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [keyName, setKeyName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("diamond");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isAdmin = isAuthenticated && user?.role === "admin";

  const loadKeys = async () => {
    if (!isAdmin) return;
    const data = await fetchAdminApiKeys();
    setKeys(data);
  };

  useEffect(() => {
    loadKeys();
  }, [isAuthenticated, user?.role]);

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    setLoading(true);
    setError("");

    const res = await createApiKey(keyName, selectedPlan);
    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    if (res.key) {
      setGeneratedKey(res.key);
      setKeyName("");
      loadKeys();
    }
  };

  const handleRevokeKey = async (id: string) => {
    const res = await deleteAdminApiKey(id);
    if (res.success) {
      setKeys((prev) => prev.filter((k) => k.id !== id));
      setDeleteConfirm(null);
    }
  };

  const copyPlaintextKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 font-mono text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-950/40 text-red-400">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl text-white">403 Forbidden</h1>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Admin role required to access API key management. Log in with an administrator account matching <code className="text-emerald-400">ADMIN_INITIAL_EMAIL</code>.
          </p>
        </div>
        <Link href="/login" className="btn-minimal-primary text-xs inline-flex min-h-[44px] px-6">
          <span>Log in as Admin</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-16 space-y-8 font-mono">
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-0.5 text-[11px] text-emerald-400 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin Role Enforcement Active</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-white">
              Admin API Key Management
            </h1>
            <p className="text-xs text-zinc-400">
              Generate SHA-256 hashed API keys, view active masked keys, and manage system access.
            </p>
          </div>

          <div className="text-xs text-zinc-400 bg-zinc-900 border border-white/10 p-3 rounded-xl">
            <span className="text-zinc-500 block text-[10px] uppercase">Logged in as Admin</span>
            <span className="text-white font-bold">{user?.email}</span>
          </div>
        </div>
      </ScrollReveal>

      {/* One-Time Plaintext Key Modal */}
      {generatedKey && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-6 space-y-4 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
              <Sparkles className="h-4 w-4" />
              API Key Generated Successfully
            </span>
            <button
              onClick={() => setGeneratedKey(null)}
              className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
            >
              Done
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 space-y-2">
            <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              <span>Security Warning: Save this key now! It will NOT be shown again.</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <code className="text-sm font-bold text-emerald-300 break-all select-all">
                {generatedKey}
              </code>
              <button
                onClick={copyPlaintextKey}
                className="btn-minimal-primary text-xs min-h-[40px] px-4 whitespace-nowrap w-full sm:w-auto"
              >
                {copiedKey ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Copied Key!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Key</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Key Generation Card */}
      <ScrollReveal delayMs={50}>
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 space-y-4">
          <h2 className="font-serif text-xl text-white">Generate System API Key</h2>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/30 p-3.5 text-xs text-red-300">
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleGenerateKey} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="mb-1 block text-[11px] uppercase tracking-wider text-zinc-400">
                Key Name / Label
              </label>
              <input
                type="text"
                placeholder="e.g. CI/CD Integration Key"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 py-2.5 px-3 text-xs text-white placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none min-h-[42px]"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] uppercase tracking-wider text-zinc-400">
                Expiration Policy
              </label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 py-2.5 px-3 text-xs text-white focus:border-emerald-500/50 focus:outline-none min-h-[42px]"
              >
                <option value="guest">7 Days (Guest Tier)</option>
                <option value="starter">90 Days (Starter Tier)</option>
                <option value="diamond">365 Days (Diamond Tier)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-minimal-primary text-xs w-full min-h-[42px] justify-center"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Generate API Key</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </ScrollReveal>

      {/* Keys List */}
      <ScrollReveal delayMs={100}>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="font-serif text-2xl text-white">All System API Keys ({keys.length})</h2>
            <button onClick={loadKeys} className="text-xs text-zinc-400 hover:text-white underline">
              Refresh List
            </button>
          </div>

          {keys.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950 p-8 text-center space-y-2">
              <Key className="mx-auto h-8 w-8 text-zinc-600" />
              <h3 className="text-sm font-semibold text-white">No active API keys found</h3>
              <p className="text-xs text-zinc-500">Generate a system API key using the form above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((k) => (
                <div
                  key={k.id}
                  className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-white">{k.name}</span>
                      <span className="rounded bg-zinc-900 border border-white/10 px-2 py-0.5 text-[10px] text-emerald-400 font-bold uppercase">
                        {k.planType}
                      </span>
                    </div>

                    <div className="text-sm font-mono font-bold text-zinc-300">
                      {k.keyMasked}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 pt-1">
                      <span>Created: {new Date(k.createdAt).toLocaleDateString()}</span>
                      <span>Expires: {new Date(k.expiresAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-zinc-400" />
                        Last used: {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : "Never"}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {deleteConfirm === k.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRevokeKey(k.id)}
                          className="rounded-lg border border-red-500/30 bg-red-950 px-3 py-2 text-xs text-red-300 hover:bg-red-900 cursor-pointer min-h-[40px]"
                        >
                          Confirm Revoke
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-2 text-xs text-zinc-400 hover:text-white cursor-pointer min-h-[40px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(k.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-400 hover:border-red-500/30 hover:bg-red-950/40 hover:text-red-300 cursor-pointer min-h-[40px]"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Revoke</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
