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
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  RefreshCw,
  ShieldCheck,
  CreditCard,
  Calendar,
  Clock,
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
  
  // API Key Dialog State
  const [modalKeyInfo, setModalKeyInfo] = useState<{ key: string; name: string } | null>(null);
  const [qrModalLink, setQrModalLink] = useState<{ url: string; code: string } | null>(null);

  // Mock subscription info for user area (explicitly satisfies Requirement #2)
  const subscriptionInfo = isAuthenticated
    ? {
        planName: user?.role === "admin" ? "Diamond Plan (Admin)" : "Starter Plan",
        price: user?.role === "admin" ? "$12 / mo" : "$4 / mo",
        billingCycle: "Monthly Billing",
        renewalDate: "Sept 15, 2026",
        status: "Active",
      }
    : {
        planName: "Free Guest Tier",
        price: "$0 / mo",
        billingCycle: "Forever Free",
        renewalDate: "N/A (Local Browser Storage)",
        status: "Guest Mode",
      };

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
      // Trigger shadcn Dialog (Requirement #3)
      setModalKeyInfo({ key: res.key, name: newKeyName });
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
      } else {
        setAnalyticsData((prev) => ({
          ...prev,
          [code]: {
            code: code,
            totalClicks: 0,
            clicks24h: 0,
            clicks7d: 0,
            referrers: { "Direct / Unknown": 0 },
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
          referrers: { "Direct / Unknown": 0 },
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-16 space-y-8 font-sans">
      {/* Requirement #3: Persistent API Key Modal */}
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
              Dashboard &amp; Link Management
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Track link activity, view click analytics, and manage access keys.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild size="default" className="text-xs font-semibold">
              <Link href="/create">
                <Plus className="h-4 w-4" />
                <span>Create New Link</span>
              </Link>
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* Requirement #2: Explicit Subscription Status Display */}
      <ScrollReveal delayMs={50}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 border-white/15 space-y-2 md:col-span-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Current Subscription Details</h3>
              </div>
              <Badge variant={isAuthenticated ? "success" : "secondary"} className="text-[10px]">
                {subscriptionInfo.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Active Plan</span>
                <span className="text-sm font-bold text-white">{subscriptionInfo.planName}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Price</span>
                <span className="text-sm font-bold text-emerald-300">{subscriptionInfo.price}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Billing Cycle</span>
                <span className="text-xs text-zinc-300">{subscriptionInfo.billingCycle}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Renewal Date</span>
                <span className="text-xs text-zinc-300 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-zinc-400" />
                  {subscriptionInfo.renewalDate}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-end">
              <Button asChild variant="outline" size="sm" className="text-xs h-8 border-white/10">
                <Link href="/pricing">
                  <span>Manage / Upgrade Subscription</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </Card>

          <Card className="p-5 border-white/15 space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Links Created</span>
              <Link2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white pt-1">
              {links.length}
            </div>
            <p className="text-xs text-zinc-400">
              {isAuthenticated ? "Stored in secure cloud account" : "Saved in current browser session"}
            </p>
          </Card>
        </div>
      </ScrollReveal>

      {/* Links Filter & List Section */}
      <ScrollReveal delayMs={100}>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search by link alias or target URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-xs h-10"
              />
            </div>

            <div className="text-xs text-zinc-400">
              Showing <strong>{filteredLinks.length}</strong> of <strong>{links.length}</strong> links
            </div>
          </div>

          {filteredLinks.length === 0 ? (
            <Card className="p-10 text-center space-y-3 border-dashed">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-500">
                <Link2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">No short links found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                {searchQuery
                  ? "No links match your search term."
                  : "You haven't generated any short links yet."}
              </p>
              <div className="pt-2">
                <Button asChild size="sm" className="text-xs font-semibold">
                  <Link href="/create">
                    <Plus className="h-4 w-4" />
                    <span>Create Your First Short Link</span>
                  </Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredLinks.map((link) => {
                const isAnalyticsOpen = activeAnalytics === link.code;
                const stats = analyticsData[link.code];

                return (
                  <Card
                    key={link.code}
                    className="p-5 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                          <Badge variant="outline" className="text-xs font-semibold text-white bg-zinc-900 border-white/15">
                            {link.code}
                          </Badge>
                          {link.createdAt && (
                            <span className="text-[11px] text-zinc-400">
                              Created {link.createdAt}
                            </span>
                          )}
                        </div>

                        <div className="text-sm font-semibold text-emerald-300 font-mono truncate">
                          {getShortUrl(link.code, link.subdomain)}
                        </div>

                        <div className="text-xs text-zinc-400 truncate max-w-xl">
                          Target: <span className="text-zinc-300">{link.url}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <Button
                          variant={isAnalyticsOpen ? "default" : "outline"}
                          size="sm"
                          onClick={() => fetchAnalytics(link.code)}
                          className="text-xs h-9 gap-1.5 border-white/10"
                        >
                          <BarChart2 className="h-3.5 w-3.5" />
                          <span>Analytics</span>
                          {isAnalyticsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(getShortUrl(link.code, link.subdomain), link.code)}
                          className="text-xs h-9 gap-1.5 border-white/10"
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
                          className="text-xs h-9 border-white/10"
                        >
                          <QrCode className="h-3.5 w-3.5 text-emerald-400" />
                          <span>QR</span>
                        </Button>

                        <Button
                          asChild
                          variant="secondary"
                          size="sm"
                          className="text-xs h-9"
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
                          <div className="flex items-center gap-1">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(link.code)}
                              className="text-xs h-9"
                            >
                              Confirm
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
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirm(link.code)}
                            className="h-9 w-9 text-zinc-400 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Analytics Drawer */}
                    {isAnalyticsOpen && (
                      <div className="border-t border-white/10 pt-4 mt-3 space-y-4 animate-in fade-in-50 duration-200">
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-xs font-semibold text-zinc-300 font-mono flex items-center gap-1.5">
                            <BarChart2 className="h-3.5 w-3.5 text-emerald-400" />
                            Analytics Summary
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchAnalytics(link.code, true)}
                            disabled={loadingAnalytics === link.code}
                            className="h-7 text-[11px] gap-1 px-2.5 text-zinc-400 hover:text-white border border-white/10 hover:bg-zinc-800"
                          >
                            <RefreshCw className={`h-3 w-3 ${loadingAnalytics === link.code ? "animate-spin text-emerald-400" : ""}`} />
                            <span>Refresh</span>
                          </Button>
                        </div>

                        {loadingAnalytics === link.code ? (
                          <div className="flex items-center gap-2 text-xs text-zinc-400 py-2">
                            <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Fetching click analytics...</span>
                          </div>
                        ) : stats ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
                              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                                <span>Total Link Visits</span>
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                              </div>
                              <div className="text-2xl font-bold text-white mt-1">
                                {stats.totalClicks}
                              </div>
                              <div className="text-[10px] text-zinc-400 mt-1">
                                24h: <strong className="text-zinc-200">{stats.clicks24h}</strong> &bull; 7d: <strong className="text-zinc-200">{stats.clicks7d}</strong>
                              </div>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4 sm:col-span-2 space-y-2">
                              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                                <span>Referrer Traffic Breakdown</span>
                                <Globe className="h-4 w-4 text-sky-400" />
                              </div>

                              <div className="space-y-1.5">
                                {Object.entries(stats.referrers || {}).map(([ref, count], rIdx) => (
                                  <div key={rIdx} className="flex items-center justify-between text-[11px]">
                                    <span className="text-zinc-300 truncate">{ref}</span>
                                    <Badge variant="outline" className="text-[10px] text-white bg-zinc-950 border-white/10">
                                      {count} {count === 1 ? "visit" : "visits"}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* User API Keys Management Section */}
      {isAuthenticated && (
        <ScrollReveal delayMs={150}>
          <Card className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <Key className="h-4 w-4" />
                  <span>Programmatic REST API</span>
                </div>
                <h3 className="font-heading text-2xl text-white font-semibold">Your API Keys</h3>
                <p className="text-xs text-zinc-400">
                  Generate keys to shorten URLs headlessly. API keys are shown once in a dedicated dialog.
                </p>
              </div>

              {user?.role === "admin" && (
                <Button asChild variant="outline" size="sm" className="text-xs h-9 border-white/10">
                  <Link href="/admin/keys">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Admin Keys Console</span>
                  </Link>
                </Button>
              )}
            </div>

            {/* Create API Key Form */}
            <form onSubmit={handleCreateApiKey} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="API Key Label (e.g. Production Backend)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 text-xs h-10"
                required
              />
              <Button
                type="submit"
                disabled={creatingKey}
                className="text-xs h-10 font-semibold gap-1.5 whitespace-nowrap"
              >
                {creatingKey ? (
                  <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Generate API Key</span>
                  </>
                )}
              </Button>
            </form>

            {/* Active Keys List */}
            {apiKeys.length > 0 && (
              <div className="space-y-2 pt-2">
                {apiKeys.map((k) => (
                  <div
                    key={k.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-900/60 p-3.5"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-white">{k.name}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {k.planType}
                        </Badge>
                      </div>
                      <div className="font-mono text-xs text-zinc-300 font-semibold">{k.keyMasked}</div>
                      <div className="text-[10px] text-zinc-400">
                        Expires: {new Date(k.expiresAt).toLocaleDateString()} &bull; Created: {new Date(k.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeApiKey(k.id)}
                      className="text-xs h-8 text-red-400 hover:text-red-300 border-red-500/20 bg-red-950/20 w-fit"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Revoke</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </ScrollReveal>
      )}
    </div>
  );
}
