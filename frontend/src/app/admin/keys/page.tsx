"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchAdminApiKeys, deleteAdminApiKey, createApiKey, ApiKeyItem } from "@/lib/api";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  Key,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Lock,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function AdminKeysPage() {
  const { user, isAuthenticated } = useAuth();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [keyName, setKeyName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("diamond");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalKeyInfo, setModalKeyInfo] = useState<{ key: string; name: string } | null>(null);
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
      setModalKeyInfo({ key: res.key, name: keyName });
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

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 font-sans text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-950/40 text-red-400">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-3xl text-white font-bold">403 Access Denied</h1>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Administrator privileges are required to manage system API keys. Sign in with an admin account.
          </p>
        </div>
        <Button asChild size="default" className="text-xs font-semibold">
          <Link href="/login">
            <span>Sign In as Admin</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-16 space-y-8 font-sans">
      {/* Persistent API Key Dialog */}
      {modalKeyInfo && (
        <ApiKeyModal
          apiKey={modalKeyInfo.key}
          keyName={modalKeyInfo.name}
          onClose={() => setModalKeyInfo(null)}
        />
      )}

      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <Badge variant="success" className="gap-1.5 py-0.5 px-2.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin Role Verified</span>
            </Badge>
            <h1 className="font-heading text-3xl sm:text-4xl text-white font-bold">
              Admin API Key Management
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Generate SHA-256 hashed API keys and monitor system access.
            </p>
          </div>

          <Card className="p-3 bg-zinc-900/80 border-white/10">
            <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Administrator</span>
            <span className="text-white text-xs font-bold">{user?.email}</span>
          </Card>
        </div>
      </ScrollReveal>

      {/* Key Generation Form */}
      <ScrollReveal delayMs={50}>
        <Card className="p-6 space-y-4">
          <h2 className="font-heading text-xl text-white font-semibold">Generate System API Key</h2>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/30 p-3.5 text-xs text-red-300">
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleGenerateKey} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1 space-y-1">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                Key Name / Label
              </label>
              <Input
                type="text"
                placeholder="e.g. Production Backend Key"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="text-xs h-10"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                Expiration Policy
              </label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-white/30"
              >
                <option value="guest">7 Days (Guest Tier)</option>
                <option value="starter">90 Days (Starter Tier)</option>
                <option value="diamond">365 Days (Diamond Tier)</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 text-xs font-semibold gap-1.5"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Generate API Key</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </ScrollReveal>

      {/* Keys List */}
      <ScrollReveal delayMs={100}>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="font-heading text-2xl text-white font-semibold">Active System Keys ({keys.length})</h2>
            <Button variant="ghost" size="sm" onClick={loadKeys} className="text-xs h-8">
              Refresh List
            </Button>
          </div>

          {keys.length === 0 ? (
            <Card className="p-8 text-center space-y-2 border-dashed">
              <Key className="mx-auto h-8 w-8 text-zinc-600" />
              <h3 className="text-sm font-semibold text-white">No system API keys found</h3>
              <p className="text-xs text-zinc-400">Use the form above to generate a new key.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {keys.map((k) => (
                <Card
                  key={k.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-white">{k.name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {k.planType}
                      </Badge>
                    </div>

                    <div className="text-xs font-mono font-bold text-zinc-300">
                      {k.keyMasked}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400 pt-1">
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
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeKey(k.id)}
                          className="text-xs h-9"
                        >
                          Confirm Revoke
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs h-9"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm(k.id)}
                        className="text-xs h-9 border-white/10 text-zinc-400 hover:text-red-400 gap-1.5"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Revoke</span>
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
