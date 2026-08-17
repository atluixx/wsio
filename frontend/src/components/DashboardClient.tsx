"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { deleteShortLink, LinkItem, fetchApiKeys, createApiKey, deleteApiKey, ApiKeyItem, createCheckoutSession, fetchUserLinks, fetchUserSubscription } from "@/lib/api";
import { QrCodeModal } from "@/components/QrCodeModal";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Plus,
  Search,
  BarChart2,
  Globe,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Key,
  QrCode,
  RefreshCw,
  CreditCard,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

interface AnalyticsData {
  code: string;
  totalClicks: number;
  clicks24h: number;
  clicks7d: number;
  referrers: Record<string, number>;
}

export function DashboardClient() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeAnalytics, setActiveAnalytics] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<Record<string, AnalyticsData>>({});
  const [loadingAnalytics, setLoadingAnalytics] = useState<string | null>(null);

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  
  // API Key Modal State
  const [modalKeyInfo, setModalKeyInfo] = useState<{ key: string; name: string } | null>(null);
  const [qrModalLink, setQrModalLink] = useState<{ url: string; code: string } | null>(null);

  // Subscription state
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const planParam = params.get("plan");
      const paymentParam = params.get("payment");

      if (paymentParam === "success" && planParam) {
        const cleanPlan = planParam.toLowerCase();
        setCurrentPlan(cleanPlan);
        showToast(`Subscription activated! Upgraded to ${cleanPlan === "diamond" ? "Diamond Plan" : "Starter Plan"}.`, "success");
      } else if (user?.role === "admin") {
        setCurrentPlan("diamond");
      }
    }
  }, [user]);

  const handleSubscribePlan = async (planType: string) => {
    setUpgradingPlan(planType);
    const res = await createCheckoutSession(planType);
    setUpgradingPlan(null);

    if (res.url) {
      window.location.href = res.url;
    } else {
      showToast(res.error || "Failed to launch Checkout Session", "error");
    }
  };

  const loadLinks = async () => {
    const dbLinks = await fetchUserLinks(user?.id);
    setLinks(dbLinks);
  };

  const loadSubscription = async () => {
    if (user?.role === "admin") {
      setCurrentPlan("diamond");
      return;
    }

    if (isAuthenticated && user?.id) {
      const sub = await fetchUserSubscription(user.id);
      if (sub?.planType) {
        setCurrentPlan(sub.planType.toLowerCase());
      }
    }
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
    loadSubscription();
  }, [isAuthenticated, user?.id, user?.role]);

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setCreatingKey(true);
    // Use actual dynamically loaded user plan when generating API Key
    const keyPlanToUse = currentPlan !== "free" ? currentPlan : "starter";
    const res = await createApiKey(newKeyName, keyPlanToUse);
    setCreatingKey(false);

    if (res.key) {
      setModalKeyInfo({ key: res.key, name: newKeyName });
      setNewKeyName("");
      showToast("API key generated!", "success");
      loadApiKeys();
    } else {
      showToast(res.error || "Failed to generate API Key", "error");
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    const res = await deleteApiKey(id);
    if (res.success) {
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
      showToast("API key revoked", "info");
    } else {
      showToast(res.error || "Failed to revoke API key", "error");
    }
  };

  const fetchAnalytics = async (code: string, forceRefresh = false) => {
    if (!forceRefresh && activeAnalytics === code) {
      setActiveAnalytics(null);
      return;
    }

    setActiveAnalytics(code);
    if (!forceRefresh && analyticsData[code]) return;

    setLoadingAnalytics(code);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.wsio.lol";
      let res = await fetch(`/api/v1/links/${code}/analytics`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`${API_BASE_URL}/api/v1/links/${code}/analytics`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setAnalyticsData((prev) => ({ ...prev, [code]: data }));
        if (forceRefresh) showToast("Analytics refreshed", "success");
      } else {
        setAnalyticsData((prev) => ({
          ...prev,
          [code]: {
            code: code,
            totalClicks: 0,
            clicks24h: 0,
            clicks7d: 0,
            referrers: { "Direct": 0 },
          },
        }));
      }
    } catch {
      setAnalyticsData((prev) => ({
        ...prev,
        [code]: {
          code: code,
          totalClicks: 0,
          clicks24h: 0,
          clicks7d: 0,
          referrers: { "Direct": 0 },
        },
      }));
    } finally {
      setLoadingAnalytics(null);
    }
  };

  const handleDelete = async (code: string) => {
    setLinks((prev) => prev.filter((l) => l.code !== code));
    setDeleteConfirm(null);
    deleteShortLink(code).catch(() => {});
    showToast("Link deleted", "info");
    setTimeout(() => loadLinks(), 400);
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    showToast("Copied to clipboard", "success");
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
      l.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-16 space-y-8">
      {/* Explicit 'Done' Dismissal Modal */}
      {modalKeyInfo && (
        <ApiKeyModal
          apiKey={modalKeyInfo.key}
          keyName={modalKeyInfo.name}
          onClose={() => setModalKeyInfo(null)}
        />
      )}

      {qrModalLink && (
        <QrCodeModal
          url={qrModalLink.url}
          code={qrModalLink.code}
          onClose={() => setQrModalLink(null)}
        />
      )}

      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/80 pb-6 font-sans">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                Live Edge Workspace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard &amp; Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Manage short links, inspect click velocity, and oversee API key access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadLinks();
                loadApiKeys();
                showToast("Workspace data refreshed", "info");
              }}
              className="text-xs h-9 px-3 border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white rounded-xl"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              <span>Refresh</span>
            </Button>

            <Button asChild size="sm" className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 h-9 rounded-xl shadow-md">
              <Link href="/">
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Shorten URL</span>
              </Link>
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* 4 Metric Stats Overview Grid */}
      <ScrollReveal delayMs={50}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
          {/* Card 1: Active Links */}
          <div className="rounded-2xl border border-zinc-800/80 bg-[#111319] p-5 space-y-2 hover:border-blue-500/30 transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider">Active Links</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Link2 className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">{links.length}</div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
              <span className="text-emerald-400 font-bold">● Active</span> across edge network
            </p>
          </div>

          {/* Card 2: Total Click Telemetry */}
          <div className="rounded-2xl border border-zinc-800/80 bg-[#111319] p-5 space-y-2 hover:border-blue-500/30 transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider">Total Clicks</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">
              {Object.values(analyticsData).reduce((sum, item) => sum + (item.totalClicks || 0), 0)}
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Real-time redirect metrics
            </p>
          </div>

          {/* Card 3: Account Tier & SLA */}
          <div className="rounded-2xl border border-zinc-800/80 bg-[#111319] p-5 space-y-2 hover:border-blue-500/30 transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider">Current Tier</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="text-lg font-bold text-white uppercase font-mono truncate">
              {currentPlan === "free" ? "Free Tier" : `${currentPlan} Plan`}
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[11px] text-emerald-400 font-mono font-semibold">99.99% Edge SLA</span>
              {currentPlan === "free" && (
                <button
                  onClick={() => handleSubscribePlan("starter")}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-bold underline font-mono"
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>

          {/* Card 4: Secret API Keys */}
          <div className="rounded-2xl border border-zinc-800/80 bg-[#111319] p-5 space-y-2 hover:border-blue-500/30 transition-all shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider">API Keys</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Key className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono">{apiKeys.length}</div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Active developer tokens
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Subscription Banner */}
      {currentPlan === "free" && (
        <ScrollReveal delayMs={75}>
          <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-5 font-sans flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                  Starter &amp; Diamond Upgrade Available
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                Unlock custom slug aliases, persistent analytics, branded subdomains, and 365-day API keys.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => handleSubscribePlan("starter")}
                disabled={upgradingPlan === "starter"}
                className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white h-9 px-4 rounded-xl"
              >
                {upgradingPlan === "starter" ? "Loading..." : "Upgrade to Starter (€3/mo)"}
              </Button>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Link Infrastructure List & Filter Bar */}
      <ScrollReveal delayMs={100}>
        <div className="space-y-4 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold text-white tracking-tight">Active Link Infrastructure</h2>
              <p className="text-xs text-zinc-400">Search and monitor your short link redirections.</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search code or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs minimal-input text-white rounded-xl w-full font-mono"
              />
            </div>
          </div>

          {filteredLinks.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800/80 bg-[#111319] p-10 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <Link2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-white">No short links provisioned</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                {searchQuery ? "No links match your search filter." : "Create your first short link from the main generator."}
              </p>
              <div className="pt-2">
                <Button asChild size="sm" className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 h-8 rounded-xl">
                  <Link href="/">Create Short Link</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 font-mono">
              {filteredLinks.map((link) => {
                const isAnalyticsOpen = activeAnalytics === link.code;
                const stats = analyticsData[link.code];

                return (
                  <div
                    key={link.code}
                    className="rounded-2xl border border-zinc-800/80 bg-[#111319] p-5 space-y-3 hover:border-zinc-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-xs font-bold text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 bg-blue-500/10">
                            /{link.code}
                          </span>
                          {link.createdAt && (
                            <span className="text-[11px] text-zinc-500">Created {link.createdAt}</span>
                          )}
                        </div>

                        <div className="text-sm font-bold text-white truncate">
                          {getShortUrl(link.code, link.subdomain)}
                        </div>

                        <div className="text-xs text-zinc-400 truncate max-w-xl">
                          Target: <span className="text-zinc-300">{link.url}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800 font-sans">
                        <Button
                          variant={isAnalyticsOpen ? "default" : "outline"}
                          size="sm"
                          onClick={() => fetchAnalytics(link.code)}
                          className={
                            isAnalyticsOpen
                              ? "text-xs h-8 gap-1.5 rounded-xl bg-blue-600 text-white font-bold"
                              : "text-xs h-8 gap-1.5 rounded-xl border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white"
                          }
                        >
                          <BarChart2 className="h-3.5 w-3.5" />
                          <span>Telemetry</span>
                          {isAnalyticsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(getShortUrl(link.code, link.subdomain), link.code)}
                          className="text-xs h-8 gap-1 border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white rounded-xl"
                        >
                          {copiedCode === link.code ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQrModalLink({ url: getShortUrl(link.code, link.subdomain), code: link.code })}
                          className="text-xs h-8 border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white rounded-xl"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">QR</span>
                        </Button>

                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="text-xs h-8 border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white rounded-xl"
                        >
                          <a href={getShortUrl(link.code, link.subdomain)} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>

                        {deleteConfirm === link.code ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(link.code)}
                            className="text-xs h-8 px-2.5 rounded-xl font-bold"
                          >
                            Confirm Delete
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(link.code)}
                            className="text-xs h-8 px-2 text-zinc-500 hover:text-red-400 rounded-xl"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Analytics Telemetry Drawer */}
                    {isAnalyticsOpen && (
                      <div className="mt-4 pt-4 border-t border-zinc-800 space-y-4 animate-in fade-in-50 duration-200">
                        {loadingAnalytics === link.code ? (
                          <div className="p-4 text-center text-xs text-zinc-400">
                            Loading click telemetry...
                          </div>
                        ) : stats ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-3 text-center">
                              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 space-y-0.5">
                                <span className="text-[10px] text-zinc-500 uppercase">Total Clicks</span>
                                <div className="text-xl font-bold text-white">{stats.totalClicks || 0}</div>
                              </div>
                              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 space-y-0.5">
                                <span className="text-[10px] text-zinc-500 uppercase">24-Hour Velocity</span>
                                <div className="text-xl font-bold text-blue-400">{stats.clicks24h || 0}</div>
                              </div>
                              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 space-y-0.5">
                                <span className="text-[10px] text-zinc-500 uppercase">7-Day Clicks</span>
                                <div className="text-xl font-bold text-emerald-400">{stats.clicks7d || 0}</div>
                              </div>
                            </div>

                            {/* Referrers breakdown */}
                            {stats.referrers && Object.keys(stats.referrers).length > 0 && (
                              <div className="space-y-2 pt-1 font-sans">
                                <span className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider block">
                                  Top Referrers
                                </span>
                                <div className="space-y-1.5 text-xs font-mono">
                                  {Object.entries(stats.referrers).map(([ref, count]) => {
                                    const percent = stats.totalClicks ? Math.round((count / stats.totalClicks) * 100) : 0;
                                    return (
                                      <div key={ref} className="space-y-1">
                                        <div className="flex items-center justify-between text-zinc-300">
                                          <span>{ref || "Direct"}</span>
                                          <span className="text-blue-400 font-bold">{count} ({percent}%)</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{ width: `${Math.max(percent, 5)}%` }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
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

      {/* API Key Access Token Management */}
      {isAuthenticated && (
        <ScrollReveal delayMs={150}>
          <div className="rounded-2xl border border-zinc-800/80 bg-[#111319] p-6 space-y-5 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4 font-mono">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-bold">
                  <Key className="h-4 w-4" />
                  <span>Developer REST API Access</span>
                </div>
                <h2 className="text-lg font-extrabold text-white tracking-tight font-sans">
                  Secret Access Tokens
                </h2>
              </div>
            </div>

            <form onSubmit={handleCreateApiKey} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="Token label (e.g. staging-app)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="text-xs h-10 minimal-input text-white rounded-xl font-mono flex-1"
                required
              />

              <Button
                type="submit"
                disabled={creatingKey}
                className="text-xs h-10 font-bold bg-blue-600 hover:bg-blue-500 text-white whitespace-nowrap px-5 rounded-xl font-mono"
              >
                {creatingKey ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Plus className="h-4 w-4" />
                    <span>Generate API Key</span>
                  </span>
                )}
              </Button>
            </form>

            {/* Keys Table / List */}
            {apiKeys.length === 0 ? (
              <p className="text-xs text-zinc-400 font-mono pt-2">
                No active secret API keys generated.
              </p>
            ) : (
              <div className="space-y-3 font-mono pt-2">
                {apiKeys.map((k) => (
                  <div
                    key={k.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{k.name}</span>
                        <span className="text-[10px] font-bold text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/10 uppercase">
                          {k.planType}
                        </span>
                      </div>
                      <div className="text-xs text-blue-400 font-bold">{k.keyMasked}</div>
                      <div className="text-[10px] text-zinc-500">
                        Expires: {new Date(k.expiresAt).toLocaleDateString()} &bull; Created: {new Date(k.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeApiKey(k.id)}
                      className="text-xs h-8 text-zinc-400 hover:text-red-400 border-zinc-800 bg-zinc-900 w-fit rounded-xl"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      <span>Revoke</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
