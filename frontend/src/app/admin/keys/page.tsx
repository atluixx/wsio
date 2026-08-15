"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchAdminApiKeys, deleteAdminApiKey, createApiKey, ApiKeyItem } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  ShieldAlert,
  Key,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function AdminKeysPage() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [keyName, setKeyName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("diamond");
  const [loading, setLoading] = useState(false);
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
    const res = await createApiKey(keyName, selectedPlan);
    setLoading(false);

    if (res.error) {
      showToast(res.error, "error");
      return;
    }

    if (res.key) {
      setModalKeyInfo({ key: res.key, name: keyName });
      setKeyName("");
      showToast("API Key generated!", "success");
      loadKeys();
    }
  };

  const handleRevokeKey = async (id: string) => {
    const res = await deleteAdminApiKey(id);
    if (res.success) {
      setKeys((prev) => prev.filter((k) => k.id !== id));
      setDeleteConfirm(null);
      showToast("API key revoked", "info");
    } else {
      showToast(res.error || "Failed to revoke API key", "error");
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
          <p className="text-xs text-purple-200/70 max-w-sm mx-auto">
            Administrator role required to access API key governance.
          </p>
        </div>
        <Button asChild size="default" className="text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white">
          <Link href="/login">
            <span>Sign In as Admin</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-16 space-y-8 font-sans">
      {/* Explicit 'Done' Dismissal Modal */}
      {modalKeyInfo && (
        <ApiKeyModal
          apiKey={modalKeyInfo.key}
          keyName={modalKeyInfo.name}
          onClose={() => setModalKeyInfo(null)}
        />
      )}

      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/15 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin Role Verified</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl text-white font-bold">
              API Keys Console
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/70">
              Manage system access tokens and SHA-256 API keys.
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="text-xs h-9 border-purple-500/30 bg-purple-950/30 text-purple-200">
            <Link href="/admin">
              <span>Back to Admin Panel</span>
            </Link>
          </Button>
        </div>
      </ScrollReveal>

      {/* Key Generation Form */}
      <ScrollReveal delayMs={50}>
        <Card className="glass-panel p-6 rounded-2xl space-y-4 border-purple-500/25">
          <h2 className="font-heading text-xl text-white font-semibold">Generate System API Key</h2>

          <form onSubmit={handleGenerateKey} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1 space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-purple-300/80">
                Key Label
              </label>
              <Input
                type="text"
                placeholder="e.g. Production Microservice"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="text-xs h-10 bg-purple-950/30 border-purple-500/25 text-purple-50"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-purple-300/80">
                Expiration Policy
              </label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-purple-500/25 bg-purple-950/40 px-3 py-2 text-xs text-purple-100 focus:outline-none"
              >
                <option value="guest">7 Days (Guest)</option>
                <option value="starter">90 Days (Starter)</option>
                <option value="diamond">365 Days (Diamond)</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white gap-1.5"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
          <div className="flex items-center justify-between border-b border-purple-500/15 pb-3">
            <h2 className="font-heading text-2xl text-white font-semibold">Active System Keys ({keys.length})</h2>
            <Button variant="ghost" size="sm" onClick={loadKeys} className="text-xs text-purple-300 hover:text-white">
              Refresh
            </Button>
          </div>

          {keys.length === 0 ? (
            <Card className="glass-card p-8 text-center space-y-2 rounded-2xl border-purple-500/20">
              <Key className="mx-auto h-8 w-8 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">No active system keys</h3>
              <p className="text-xs text-purple-200/70">Use the form above to generate a new key.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {keys.map((k) => (
                <Card
                  key={k.id}
                  className="glass-card p-4 sm:p-5 rounded-2xl border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-white">{k.name}</span>
                      <span className="font-mono text-[10px] text-purple-300 px-2 py-0.5 rounded border border-purple-500/25 bg-purple-950/60 uppercase">
                        {k.planType}
                      </span>
                    </div>

                    <div className="text-xs font-mono font-bold text-purple-300">
                      {k.keyMasked}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-purple-400/60 pt-1">
                      <span>Created: {new Date(k.createdAt).toLocaleDateString()}</span>
                      <span>Expires: {new Date(k.expiresAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
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
                          Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs h-9 text-purple-300"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm(k.id)}
                        className="text-xs h-9 border-purple-500/25 bg-purple-950/30 text-purple-300 hover:text-red-400 gap-1.5"
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
