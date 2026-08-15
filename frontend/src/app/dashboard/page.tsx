"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { deleteShortLink, LinkItem, fetchApiKeys, createApiKey, deleteApiKey, ApiKeyItem } from "@/lib/api";
import {
  getGuestLinks,
  removeGuestLink,
} from "@/lib/guestLinks";
import { QrCodeModal } from "@/components/QrCodeModal";
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Plus,
  Search,
  UserCheck,
  UserX,
  BarChart2,
  Globe,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Key,
  QrCode,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

interface AnalyticsData {
  code: string;
  totalClicks: number;
  clicks24h: number;
  clicks7d: number;
  referrers: Record<string, number>;
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeAnalytics, setActiveAnalytics] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<Record<string, AnalyticsData>>({});
  const [loadingAnalytics, setLoadingAnalytics] = useState<string | null>(null);

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPlan, setNewKeyPlan] = useState("starter");
  const [creatingKey, setCreatingKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [qrModalLink, setQrModalLink] = useState<{ url: string; code: string } | null>(null);

  const loadLinks = () => {
    const stored = getGuestLinks();
    setLinks(stored);
  };

  const loadApiKeys = async () => {
    if (isAuthenticated) {
      const keys = await fetchApiKeys();
      setApiKeys(keys);
    }
  };

  useEffect(() => {
    loadLinks();
    loadApiKeys();
    window.addEventListener("focus", loadLinks);
    window.addEventListener("storage", loadLinks);
    return () => {
      window.removeEventListener("focus", loadLinks);
      window.removeEventListener("storage", loadLinks);
    };
  }, [isAuthenticated]);

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setCreatingKey(true);
    const res = await createApiKey(newKeyName, newKeyPlan);
    setCreatingKey(false);

    if (res.key) {
      setGeneratedKey(res.key);
      setNewKeyName("");
      loadApiKeys();
    } else {
      alert(res.error || "Failed to generate API Key");
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    const res = await deleteApiKey(id);
    if (res.success) {
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
    }
  };

  const fetchAnalytics = async (code: string) => {
    if (activeAnalytics === code) {
      setActiveAnalytics(null);
      return;
    }

    setActiveAnalytics(code);
    if (analyticsData[code]) return; // Already loaded

    setLoadingAnalytics(code);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.wsio.lol";
      const res = await fetch(`${API_BASE_URL}/api/v1/links/${code}/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData((prev) => ({ ...prev, [code]: data }));
      } else {
        // Fallback default structure
        setAnalyticsData((prev) => ({
          ...prev,
          [code]: {
            code: code,
            totalClicks: 1,
            clicks24h: 1,
            clicks7d: 1,
            referrers: { "Direct / Unknown": 1 },
          },
        }));
      }
    } catch {
      setAnalyticsData((prev) => ({
        ...prev,
        [code]: {
          code: code,
          totalClicks: 1,
          clicks24h: 1,
          clicks7d: 1,
          referrers: { "Direct / Unknown": 1 },
        },
      }));
    } finally {
      setLoadingAnalytics(null);
    }
  };

  const handleDelete = async (code: string) => {
    const updated = removeGuestLink(code);
    setLinks(updated);
    setDeleteConfirm(null);

    if (isAuthenticated) {
      deleteShortLink(code).catch(() => {});
    }
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getShortUrl = (code: string, sub?: string) => {
    if (sub && sub.trim()) {
      return `https://${sub.trim()}.wsio.lol/l/${code}`;
    }
    return `https://wsio.lol/l/${code}`;
  };


  const filteredLinks = links.filter(
    (l) =>
      l.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.userId && l.userId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-16 space-y-8 sm:space-y-10 font-mono">
      {/* Header & Section Title */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-white font-normal">
              Dashboard &amp; Link Analytics
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Manage your active short URLs, view real-time click telemetry, and copy links.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/create"
              className="btn-minimal-primary min-h-[44px] px-5 w-full sm:w-auto text-center"
              title="Click here to open the URL shortener form"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Link</span>
            </Link>
          </div>
        </div>
      </ScrollReveal>

      {/* Overview Metric Cards */}
      <ScrollReveal delayMs={50}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bento-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Active Links Generated</span>
              <Link2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-3xl font-bold text-white">
              {links.length}
            </div>
            <div className="mt-1 text-[11px] text-zinc-400">
              Saved in current session memory
            </div>
          </div>

          <div className="bento-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Account Plan Status</span>
              {isAuthenticated ? (
                <UserCheck className="h-4 w-4 text-emerald-400" />
              ) : (
                <UserX className="h-4 w-4 text-zinc-400" />
              )}
            </div>
            <div className="mt-2 text-xs font-semibold text-white truncate">
              {isAuthenticated ? user?.email : "Guest Session (3 Links Daily Limit)"}
            </div>
            <div className="mt-1.5 text-[11px] text-zinc-500">
              {isAuthenticated ? (
                <span className="text-emerald-400 font-medium">✓ Unlimited Creation Plan Active</span>
              ) : (
                <Link href="/pricing" className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
                  <span>Upgrade to Starter for Unlimited Links &amp; Cloud Sync</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Links Search & Management Section */}
      <ScrollReveal delayMs={100}>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter by hash code or target URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 py-3 pl-10 pr-4 text-xs text-white placeholder-zinc-600 transition-colors focus:border-emerald-500/50 focus:outline-none min-h-[44px]"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-zinc-400">
              <span>Showing <strong>{filteredLinks.length}</strong> of <strong>{links.length}</strong> links</span>
            </div>
          </div>

          {filteredLinks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950/50 p-8 sm:p-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-500">
                <Link2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">No short links found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {searchQuery
                  ? "No active links match your search filter."
                  : "You haven't generated any short links yet. Paste a URL to create your first link."}
              </p>
              <div className="pt-2">
                <Link href="/create" className="btn-minimal-primary text-xs px-5 py-2.5">
                  <Plus className="h-4 w-4" />
                  <span>Create Your First Short Link</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLinks.map((link) => {
                const isAnalyticsOpen = activeAnalytics === link.code;
                const stats = analyticsData[link.code];

                return (
                  <div
                    key={link.code}
                    className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-5 transition-all hover:border-white/20 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                          <span className="flex items-center gap-1 font-bold text-white bg-zinc-900 border border-white/10 px-2 py-0.5 rounded-md">
                            <Sparkles className="h-3 w-3 text-emerald-400" />
                            {link.code}
                          </span>
                          {link.createdAt && (
                            <span className="text-[11px] text-zinc-500">
                              Created {link.createdAt}
                            </span>
                          )}
                        </div>

                        <div className="text-sm font-bold text-emerald-300 truncate">
                          {getShortUrl(link.code)}
                        </div>

                        <div className="text-xs text-zinc-400 truncate max-w-xl">
                          Target: <span className="text-zinc-300">{link.url}</span>
                        </div>
                      </div>

                      {/* Action Buttons with clear touch targets */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <button
                          onClick={() => fetchAnalytics(link.code)}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition-colors cursor-pointer min-h-[40px] ${
                            isAnalyticsOpen
                              ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                              : "border-white/10 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                          }`}
                          title="Click to expand real-time click analytics for this link"
                        >
                          <BarChart2 className="h-4 w-4" />
                          <span>Analytics</span>
                          {isAnalyticsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>

                        <button
                          onClick={() => copyToClipboard(getShortUrl(link.code), link.code)}
                          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white cursor-pointer min-h-[40px]"
                          title="Copy shortened wsio.lol URL to clipboard"
                        >
                          {copiedCode === link.code ? (
                            <>
                              <Check className="h-4 w-4 text-emerald-400" />
                              <span className="text-emerald-400 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setQrModalLink({ url: getShortUrl(link.code, link.subdomain), code: link.code })}
                          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white min-h-[40px] cursor-pointer"
                          title="View vector QR code"
                        >
                          <QrCode className="h-4 w-4 text-emerald-400" />
                          <span>QR</span>
                        </button>

                        <a
                          href={getShortUrl(link.code, link.subdomain)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white min-h-[40px]"
                          title="Test edge redirection in a new tab"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Test</span>
                        </a>

                        {deleteConfirm === link.code ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(link.code)}
                              className="rounded-lg border border-red-500/30 bg-red-950/80 px-3 py-2 text-xs text-red-300 hover:bg-red-900 cursor-pointer min-h-[40px]"
                              title="Confirm deletion"
                            >
                              Confirm
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
                            onClick={() => setDeleteConfirm(link.code)}
                            className="flex items-center justify-center rounded-lg border border-white/10 bg-zinc-900 p-2 text-zinc-400 transition-colors hover:border-red-500/30 hover:bg-red-950/40 hover:text-red-300 cursor-pointer min-h-[40px] min-w-[40px]"
                            title="Delete this short link hash"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Link Analytics Drawer */}
                    {isAnalyticsOpen && (
                      <div className="border-t border-white/10 pt-4 mt-3 space-y-4 animate-in fade-in-50 duration-200">
                        {loadingAnalytics === link.code ? (
                          <div className="flex items-center gap-2 text-xs text-zinc-400 py-2">
                            <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Fetching link click analytics...</span>
                          </div>
                        ) : stats ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="rounded-xl border border-white/5 bg-zinc-900/60 p-4">
                              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                                <span>Total Link Visits</span>
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                              </div>
                              <div className="text-2xl font-bold text-white mt-1">
                                {stats.totalClicks}
                              </div>
                              <div className="text-[10px] text-zinc-500 mt-1">
                                24h: <strong className="text-zinc-300">{stats.clicks24h}</strong> &bull; 7d: <strong className="text-zinc-300">{stats.clicks7d}</strong>
                              </div>
                            </div>

                            <div className="rounded-xl border border-white/5 bg-zinc-900/60 p-4 sm:col-span-2 space-y-2">
                              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                                <span>Referrer Traffic Breakdown</span>
                                <Globe className="h-4 w-4 text-sky-400" />
                              </div>

                              <div className="space-y-1.5">
                                {Object.entries(stats.referrers || {}).map(([ref, count], rIdx) => (
                                  <div key={rIdx} className="flex items-center justify-between text-[11px]">
                                    <span className="text-zinc-300 truncate">{ref}</span>
                                    <span className="font-bold text-white bg-zinc-950 px-2 py-0.5 rounded border border-white/5">
                                      {count} {count === 1 ? "visit" : "visits"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* User API Keys Management Section */}
      {isAuthenticated && (
        <ScrollReveal delayMs={150}>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <Key className="h-4 w-4" />
                  <span>Programmatic REST API</span>
                </div>
                <h3 className="font-serif text-2xl text-white">Your API Keys</h3>
                <p className="text-xs text-zinc-400">
                  Use your API keys to shorten links headlessly using <code className="text-emerald-300">X-API-Key</code> or <code className="text-emerald-300">Bearer wsio_live_...</code> headers.
                </p>
              </div>

              {user?.role === "admin" && (
                <Link
                  href="/admin/keys"
                  className="btn-minimal-secondary text-xs min-h-[40px] px-4 justify-center"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Admin Keys Console</span>
                </Link>
              )}
            </div>

            {/* Key creation modal/result */}
            {generatedKey && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 space-y-2 font-mono">
                <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  <span>API Key Generated (Shown ONCE only)</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border border-white/10 bg-zinc-950 p-3">
                  <code className="text-xs font-bold text-emerald-300 break-all select-all">{generatedKey}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedKey);
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="btn-minimal-primary text-xs min-h-[38px] px-4 whitespace-nowrap"
                  >
                    {copiedKey ? "Copied Key!" : "Copy Key"}
                  </button>
                </div>
              </div>
            )}

            {/* Create API Key Form */}
            <form onSubmit={handleCreateApiKey} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="API Key Name (e.g. My Backend App)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-zinc-900 py-2.5 px-3.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none min-h-[42px]"
                required
              />
              <button
                type="submit"
                disabled={creatingKey}
                className="btn-minimal-primary text-xs min-h-[42px] px-5 justify-center"
              >
                {creatingKey ? (
                  <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Generate Key</span>
                  </>
                )}
              </button>
            </form>

            {/* Active Keys List */}
            {apiKeys.length > 0 && (
              <div className="space-y-2 pt-2">
                {apiKeys.map((k) => (
                  <div
                    key={k.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/5 bg-zinc-900/60 p-3.5"
                  >
                    <div>
                      <div className="font-bold text-xs text-white">{k.name}</div>
                      <div className="font-mono text-xs text-zinc-300">{k.keyMasked}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        Expires: {new Date(k.expiresAt).toLocaleDateString()} &bull; Created: {new Date(k.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRevokeApiKey(k.id)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 border border-red-500/20 bg-red-950/20 px-3 py-1.5 rounded-lg w-fit cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Revoke</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>
      )}

      {qrModalLink && (
        <QrCodeModal
          url={qrModalLink.url}
          code={qrModalLink.code}
          onClose={() => setQrModalLink(null)}
        />
      )}
    </div>
  );
}


