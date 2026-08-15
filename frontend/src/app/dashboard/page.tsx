"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { deleteShortLink, LinkItem } from "@/lib/api";
import {
  getGuestLinks,
  removeGuestLink,
} from "@/lib/guestLinks";
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

  const loadLinks = () => {
    const stored = getGuestLinks();
    setLinks(stored);
  };

  useEffect(() => {
    loadLinks();
    window.addEventListener("focus", loadLinks);
    window.addEventListener("storage", loadLinks);
    return () => {
      window.removeEventListener("focus", loadLinks);
      window.removeEventListener("storage", loadLinks);
    };
  }, [isAuthenticated]);

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
    } catch (e) {
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

  const getShortUrl = (code: string) => {
    return `https://wsio.lol/l/${code}`;
  };

  const filteredLinks = links.filter(
    (l) =>
      l.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.userId && l.userId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 space-y-10 font-mono">
      {/* Header & Section Title */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-white font-normal">
              Dashboard &amp; Link Analytics
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Manage your short URLs, inspect real-time click telemetry, and copy links.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/create"
              className="btn-minimal-primary"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Link</span>
            </Link>
          </div>
        </div>
      </ScrollReveal>

      {/* Overview Cards */}
      <ScrollReveal delayMs={50}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bento-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Total Active Hashes</span>
              <Link2 className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              {links.length}
            </div>
          </div>

          <div className="bento-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Session Context</span>
              {isAuthenticated ? (
                <UserCheck className="h-4 w-4 text-emerald-400" />
              ) : (
                <UserX className="h-4 w-4 text-zinc-400" />
              )}
            </div>
            <div className="mt-2 text-xs font-semibold text-white truncate">
              {isAuthenticated ? user?.email : "Guest Session (3 Links / Day Limit)"}
            </div>
            <div className="mt-1 text-[11px] text-zinc-500">
              {isAuthenticated ? (
                <span>User ID: {user?.id}</span>
              ) : (
                <Link href="/pricing" className="text-emerald-400 underline hover:text-white">
                  Upgrade to Starter for unlimited links &amp; cloud sync
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
                placeholder="Search by code or destination URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-950 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-600 transition-colors focus:border-white/30 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>Showing {filteredLinks.length} of {links.length} links</span>
            </div>
          </div>

          {filteredLinks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-zinc-950/50 p-12 text-center">
              <Link2 className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
              <h3 className="text-sm font-semibold text-white">No links found</h3>
              <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
                {searchQuery
                  ? "No short links match your search query."
                  : "You haven't generated any short links yet."}
              </p>
              <div className="mt-6">
                <Link href="/create" className="btn-minimal-primary">
                  <Plus className="h-4 w-4" />
                  <span>Create First Link</span>
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
                    className="rounded-xl border border-white/10 bg-zinc-950 p-4 transition-all hover:border-white/20 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <span>Code:</span>
                          <span className="font-bold text-white bg-zinc-900 border border-white/10 px-2 py-0.5 rounded">
                            {link.code}
                          </span>
                          {(link.userId || (isAuthenticated && user?.id)) && (
                            <span className="text-[11px] text-zinc-400 border border-white/10 px-1.5 py-0.5 rounded">
                              User ID: {(link.userId || user?.id || "").substring(0, 8)}...
                            </span>
                          )}
                          {link.createdAt && (
                            <span className="text-[11px] text-zinc-600 ml-auto sm:ml-0">
                              {link.createdAt}
                            </span>
                          )}
                        </div>

                        <div className="text-sm font-semibold text-white truncate">
                          {getShortUrl(link.code)}
                        </div>

                        <div className="text-xs text-zinc-500 truncate">
                          Target: {link.url}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => fetchAnalytics(link.code)}
                          className={`flex items-center gap-1.5 rounded border px-3 py-2 text-xs transition-colors cursor-pointer ${
                            isAnalyticsOpen
                              ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                              : "border-white/10 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                          }`}
                          title="View Link Analytics"
                        >
                          <BarChart2 className="h-3.5 w-3.5" />
                          <span>Analytics</span>
                          {isAnalyticsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </button>

                        <button
                          onClick={() => copyToClipboard(getShortUrl(link.code), link.code)}
                          className="flex items-center gap-1.5 rounded border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white cursor-pointer"
                          title="Copy link to clipboard"
                        >
                          {copiedCode === link.code ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <a
                          href={getShortUrl(link.code)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 rounded border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                          title="Test redirect link"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Test</span>
                        </a>

                        {deleteConfirm === link.code ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(link.code)}
                              className="rounded border border-red-500/30 bg-red-950/80 px-2.5 py-2 text-xs text-red-300 hover:bg-red-900 cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="rounded border border-white/10 bg-zinc-900 px-2 py-2 text-xs text-zinc-400 hover:text-white cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(link.code)}
                            className="flex items-center gap-1.5 rounded border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-zinc-400 transition-colors hover:border-red-500/30 hover:bg-red-950/40 hover:text-red-300 cursor-pointer"
                            title="Delete link"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Link Analytics Drawer */}
                    {isAnalyticsOpen && (
                      <div className="border-t border-white/10 pt-4 mt-3 space-y-4">
                        {loadingAnalytics === link.code ? (
                          <div className="flex items-center gap-2 text-xs text-zinc-400 py-2">
                            <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Loading link click analytics...</span>
                          </div>
                        ) : stats ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="rounded border border-white/5 bg-zinc-900/60 p-3">
                              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                                <span>Total Clicks</span>
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                              </div>
                              <div className="text-xl font-bold text-white mt-1">
                                {stats.totalClicks}
                              </div>
                              <div className="text-[10px] text-zinc-500 mt-0.5">
                                24h: {stats.clicks24h} &bull; 7d: {stats.clicks7d}
                              </div>
                            </div>

                            <div className="rounded border border-white/5 bg-zinc-900/60 p-3 sm:col-span-2 space-y-2">
                              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                                <span>Top Referrer Sources</span>
                                <Globe className="h-3.5 w-3.5 text-sky-400" />
                              </div>

                              <div className="space-y-1">
                                {Object.entries(stats.referrers || {}).map(([ref, count], rIdx) => (
                                  <div key={rIdx} className="flex items-center justify-between text-[11px]">
                                    <span className="text-zinc-300 truncate">{ref}</span>
                                    <span className="font-bold text-white bg-zinc-950 px-1.5 py-0.5 rounded border border-white/5">
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
    </div>
  );
}
