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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <h1 className="font-heading text-3xl sm:text-4xl text-white font-bold">
              User Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Manage short links, monitor click telemetry, and oversee active API tokens.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild size="default" className="text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 px-5">
              <Link href="/">
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Shorten Link</span>
              </Link>
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* Subscription Dashboard Card */}
      <ScrollReveal delayMs={50}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
          <div className="minimal-card p-6 rounded-2xl md:col-span-2 space-y-4 border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Subscription &amp; Tier Status</h2>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                {currentPlan !== "free" ? "ACTIVE SUBSCRIPTION" : "FREE TIER"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 font-mono">
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Plan Tier</span>
                <span className="text-sm font-bold text-white uppercase">{currentPlan === "free" ? "Free Tier" : `${currentPlan} Plan`}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Billing Rate</span>
                <span className="text-sm font-bold text-emerald-400">
                  {currentPlan === "diamond" ? "€9 / month" : currentPlan === "starter" ? "€3 / month" : "€0 / month"}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Renewal Cycle</span>
                <span className="text-xs text-zinc-300">{currentPlan === "free" ? "Unlimited Free" : "Monthly Auto-Renewal"}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Status SLA</span>
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                  <Calendar className="h-3 w-3 text-emerald-400" />
                  {currentPlan === "free" ? "Standard Edge" : "99.99% Edge SLA"}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {currentPlan !== "starter" && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleSubscribePlan("starter")}
                    disabled={upgradingPlan === "starter"}
                    className="text-xs h-8 font-semibold bg-emerald-500 text-emerald-950 hover:bg-emerald-400 rounded-lg"
                  >
                    {upgradingPlan === "starter" ? "Redirecting..." : "Upgrade to Starter (€3/mo)"}
                  </Button>
                )}

                {currentPlan !== "diamond" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSubscribePlan("diamond")}
                    disabled={upgradingPlan === "diamond"}
                    className="text-xs h-8 font-medium bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 rounded-lg"
                  >
                    {upgradingPlan === "diamond" ? "Redirecting..." : "Upgrade to Diamond (€9/mo)"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="minimal-card p-6 rounded-2xl space-y-2 border-white/10 font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Active Links</span>
              <Link2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-4xl font-extrabold text-white pt-1">
              {links.length}
            </div>
            <p className="text-[11px] text-zinc-400">
              Provisioned &amp; edge routed
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Links List */}
      <ScrollReveal delayMs={100}>
        <div className="space-y-4 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search links or destination URLs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-xs font-mono h-10 craft-input text-white rounded-xl"
              />
            </div>

            <div className="text-xs font-mono text-zinc-400">
              Showing <strong className="text-white">{filteredLinks.length}</strong> links
            </div>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">Active Link Infrastructure</h2>

          {filteredLinks.length === 0 ? (
            <div className="minimal-card p-10 text-center space-y-3 rounded-2xl border-white/10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-emerald-400 font-mono">
                <Link2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">No active links found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                {searchQuery ? "No links match your query." : "Shorten your first URL to view live telemetry."}
              </p>
              <div className="pt-2">
                <Button asChild size="sm" className="text-xs font-semibold bg-emerald-500 text-emerald-950 hover:bg-emerald-400 rounded-lg">
                  <Link href="/">
                    <Plus className="h-4 w-4 mr-1" />
                    <span>Shorten New URL</span>
                  </Link>
                </Button>
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
                    className="minimal-card p-5 space-y-3 rounded-2xl border-white/10"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                          <span className="text-xs font-semibold text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10">
                            /{link.code}
                          </span>
                          {link.createdAt && (
                            <span className="text-[11px]">Created {link.createdAt}</span>
                          )}
                        </div>

                        <div className="text-sm font-bold text-white font-mono truncate">
                          {getShortUrl(link.code, link.subdomain)}
                        </div>

                        <div className="text-xs text-zinc-400 font-mono truncate max-w-xl">
                          Target: <span className="text-zinc-200">{link.url}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                        <Button
                          variant={isAnalyticsOpen ? "default" : "outline"}
                          size="sm"
                          onClick={() => fetchAnalytics(link.code)}
                          className={
                            isAnalyticsOpen
                              ? "text-xs h-9 gap-1.5 rounded-lg bg-emerald-500 text-emerald-950 font-bold"
                              : "text-xs h-9 gap-1.5 rounded-lg border-white/10 bg-zinc-900/60 text-zinc-300"
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
                          className="text-xs h-9 gap-1.5 border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 rounded-lg font-mono"
                        >
                          {copiedCode === link.code ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-semibold">Copied</span>
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
                          className="text-xs h-9 border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 rounded-lg font-mono"
                        >
                          <QrCode className="h-3.5 w-3.5 text-emerald-400" />
                          <span>QR</span>
                        </Button>

                        <Button
                          asChild
                          variant="secondary"
                          size="sm"
                          className="text-xs h-9 bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 rounded-lg"
                        >
                          <a
                            href={getShortUrl(link.code, link.subdomain)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>

                        {deleteConfirm === link.code ? (
                          <div className="flex items-center gap-1 font-mono">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(link.code)}
                              className="text-xs h-9 rounded-lg"
                            >
                              Confirm
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirm(null)}
                              className="text-xs h-9 text-zinc-400 rounded-lg"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirm(link.code)}
                            className="h-9 w-9 text-zinc-400 hover:text-red-400 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Analytics Drawer */}
                    {isAnalyticsOpen && (
                      <div className="border-t border-white/10 pt-4 mt-3 space-y-4 animate-in fade-in-50 duration-200 font-mono">
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                            <BarChart2 className="h-3.5 w-3.5" />
                            TELEMETRY SUMMARY
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchAnalytics(link.code, true)}
                            disabled={loadingAnalytics === link.code}
                            className="h-7 text-[11px] gap-1 px-2.5 text-zinc-300 border border-white/10 hover:bg-zinc-800 rounded-lg"
                          >
                            <RefreshCw className={`h-3 w-3 ${loadingAnalytics === link.code ? "animate-spin text-emerald-400" : ""}`} />
                            <span>Refresh</span>
                          </Button>
                        </div>

                        {loadingAnalytics === link.code ? (
                          <div className="flex items-center gap-2 text-xs text-zinc-400 py-2">
                            <span className="h-3.5 w-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                            <span>Fetching live telemetry stream...</span>
                          </div>
                        ) : stats ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
                              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                                <span>Total Visits</span>
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                              </div>
                              <div className="text-2xl font-bold text-white mt-1">
                                {stats.totalClicks}
                              </div>
                              <div className="text-[10px] text-zinc-400 mt-1">
                                24h: <strong className="text-emerald-400">{stats.clicks24h}</strong> &bull; 7d: <strong>{stats.clicks7d}</strong>
                              </div>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 sm:col-span-2 space-y-2">
                              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                                <span>HTTP Referrer Origins</span>
                                <Globe className="h-4 w-4 text-emerald-400" />
                              </div>

                              <div className="space-y-1">
                                {Object.entries(stats.referrers || {}).map(([ref, count], rIdx) => (
                                  <div key={rIdx} className="flex items-center justify-between text-[11px]">
                                    <span className="text-zinc-300 truncate">{ref}</span>
                                    <span className="font-mono text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10">
                                      {count} {count === 1 ? "click" : "clicks"}
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

      {/* API Key Management */}
      {isAuthenticated && (
        <ScrollReveal delayMs={150}>
          <div className="minimal-card p-6 space-y-5 rounded-2xl border-white/10 font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 font-mono">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                  <Key className="h-4 w-4" />
                  <span>REST API MANAGEMENT</span>
                </div>
                <h2 className="text-2xl text-white font-bold font-sans">Developer API Keys</h2>
                <p className="text-xs text-zinc-400 font-sans">
                  Generate API tokens to shorten links programmatically via HTTP requests.
                </p>
              </div>

              {user?.role === "admin" && (
                <Button asChild variant="outline" size="sm" className="text-xs h-9 border-white/10 bg-zinc-900/60 text-zinc-300 rounded-lg">
                  <Link href="/admin">
                    <ShieldCheck className="h-4 w-4 text-emerald-400 mr-1.5" />
                    <span>Admin Panel</span>
                  </Link>
                </Button>
              )}
            </div>

            {/* Create API Key Form */}
            <form onSubmit={handleCreateApiKey} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="Key Label (e.g. Production Microservice)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 text-xs font-mono h-10 craft-input text-white rounded-xl"
                required
              />
              <Button
                type="submit"
                disabled={creatingKey}
                className="text-xs h-10 font-semibold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 whitespace-nowrap px-5 rounded-xl font-mono"
              >
                {creatingKey ? (
                  <span className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    <span>Generate API Key</span>
                  </>
                )}
              </Button>
            </form>

            {/* Active Keys List */}
            {apiKeys.length > 0 && (
              <div className="space-y-2 pt-2 font-mono">
                {apiKeys.map((k) => (
                  <div
                    key={k.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-950 p-3.5"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-white font-sans">{k.name}</span>
                        <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 uppercase">
                          {k.planType}
                        </span>
                      </div>
                      <div className="text-xs text-emerald-400 font-bold">{k.keyMasked}</div>
                      <div className="text-[10px] text-zinc-500">
                        Expires: {new Date(k.expiresAt).toLocaleDateString()} &bull; Created: {new Date(k.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeApiKey(k.id)}
                      className="text-xs h-8 text-zinc-400 hover:text-red-400 border-white/10 bg-zinc-900 w-fit rounded-lg"
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

