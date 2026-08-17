"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createShortLink, fetchUserLinks, LinkItem } from "@/lib/api";
import { normalizeUrl, getGuestDailyUsage, incrementGuestDailyUsage, GUEST_DAILY_LIMIT } from "@/lib/guestLinks";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  History,
  LayoutDashboard,
  Lock,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export function CreateLinkClient() {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdLinks, setCreatedLinks] = useState<LinkItem[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [guestUsage, setGuestUsage] = useState({ count: 0, date: "" });

  const loadRecentLinks = async () => {
    if (isAuthenticated && user?.id) {
      const links = await fetchUserLinks(user.id);
      setCreatedLinks(links);
    }
  };

  useEffect(() => {
    loadRecentLinks();
    setGuestUsage(getGuestDailyUsage());
  }, [isAuthenticated, user?.id]);

  const limitReached = !isAuthenticated && guestUsage.count >= GUEST_DAILY_LIMIT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (customAlias.trim() && !isAuthenticated) {
      showToast("Custom URLs are only available for Starter+ users.", "error");
      return;
    }

    if (limitReached) {
      showToast("Guest daily limit reached (3/3). Register free to create unlimited links.", "error");
      return;
    }

    setLoading(true);
    const formattedUrl = normalizeUrl(url);

    const res = await createShortLink(formattedUrl, customAlias.trim() || undefined);
    setLoading(false);

    if (res.error) {
      showToast(res.error, "error");
      return;
    }

    if (res.code) {
      const newLink: LinkItem = {
        id: res.id || Math.random().toString(),
        code: res.code,
        url: formattedUrl,
        userId: res.userId || (isAuthenticated ? user?.id : undefined),
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setCreatedLinks((prev) => [newLink, ...prev]);
      showToast("Short link created successfully!", "success");

      if (!isAuthenticated) {
        incrementGuestDailyUsage();
        setGuestUsage(getGuestDailyUsage());
      }

      setUrl("");
      setCustomAlias("");
    }
  };

  const getShortUrl = (code: string) => {
    return `https://wsio.lol/l/${code}`;
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    showToast("Link copied to clipboard!", "success");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-16 space-y-8 font-sans">
      {/* Header */}
      <ScrollReveal>
        <div className="border-b border-white/10 pb-4 space-y-1">
          <h1 className="text-3xl sm:text-4xl text-white font-extrabold tracking-tight">
            Create Short Link
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Convert long destination web addresses into concise, shareable URLs.
          </p>
        </div>
      </ScrollReveal>

      {/* Main Creation Card */}
      <ScrollReveal delayMs={50}>
        <div className="craft-panel p-5 sm:p-7 rounded-2xl space-y-6 border-white/10">
          {!isAuthenticated && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-zinc-400 border-b border-white/10 pb-3">
              <span>Guest Daily Limit: <strong className="text-white">{guestUsage.count} / {GUEST_DAILY_LIMIT}</strong> links created today</span>
              {limitReached ? (
                <Link href="/pricing" className="text-emerald-400 hover:underline font-bold flex items-center gap-1">
                  <span>Upgrade to Starter</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ) : (
                <span className="text-zinc-500">{GUEST_DAILY_LIMIT - guestUsage.count} remaining today</span>
              )}
            </div>
          )}

          {limitReached && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-mono text-amber-200">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
                <span>You have reached the guest limit of 3 links today.</span>
              </div>
              <Button asChild size="sm" className="whitespace-nowrap text-xs bg-emerald-500 text-emerald-950 hover:bg-emerald-400 font-bold rounded-lg">
                <Link href="/pricing">View Plans &amp; Upgrade</Link>
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-mono">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block font-sans">
                Destination URL
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500 text-xs">
                  https://
                </div>
                <Input
                  type="url"
                  placeholder={limitReached ? "Guest daily limit reached (3/3)." : "github.com/organization/repository-name"}
                  value={url}
                  disabled={limitReached}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-20 h-12 text-xs craft-input text-white rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Custom Alias Input */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center justify-between font-sans">
                <span>Custom Alias / Slug (Optional)</span>
                {!isAuthenticated && (
                  <span className="text-[10px] text-amber-400 font-normal flex items-center gap-1 font-mono">
                    <Lock className="h-3 w-3" /> Starter+ Required
                  </span>
                )}
              </label>
              <Input
                placeholder={isAuthenticated ? "e.g. launch-2026" : "Custom alias (Starter+ users only)"}
                value={customAlias}
                disabled={limitReached || !isAuthenticated}
                onChange={(e) => setCustomAlias(e.target.value)}
                className="text-xs h-10 craft-input text-white rounded-xl"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 font-sans">
              <span className="text-xs font-mono text-zinc-400">
                {isAuthenticated ? `Signed in as ${user?.email}` : "Guest Session"}
              </span>

              <Button
                type="submit"
                disabled={loading || limitReached}
                className="w-full sm:w-auto h-11 px-6 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : limitReached ? (
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <Lock className="h-4 w-4" />
                    <span>Limit Reached</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Generate Short Link</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </ScrollReveal>

      {/* Generated Links History */}
      {createdLinks.length > 0 && (
        <ScrollReveal delayMs={100}>
          <div className="craft-panel p-5 sm:p-6 rounded-2xl space-y-4 border-white/10 font-sans">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 font-mono">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-emerald-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                  Recently Provisioned Links ({createdLinks.length})
                </h2>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs h-8 rounded-lg text-zinc-400 hover:text-white">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-3.5 w-3.5 mr-1" />
                  <span>Dashboard</span>
                </Link>
              </Button>
            </div>

            <div className="space-y-3 font-mono">
              {createdLinks.slice(0, 5).map((item) => (
                <div
                  key={item.code}
                  className="rounded-xl border border-white/10 bg-zinc-950 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5 text-white font-medium">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      Code: <span className="text-xs text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10">/{item.code}</span>
                    </span>
                    <span>{item.createdAt}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-white/10 bg-zinc-900/60 p-3">
                    <div className="truncate text-sm text-emerald-400 font-bold">
                      {getShortUrl(item.code)}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(getShortUrl(item.code), item.code)}
                        className="text-xs h-8 bg-emerald-500 text-emerald-950 hover:bg-emerald-400 font-bold rounded-lg"
                      >
                        {copiedCode === item.code ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-950" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>

                      <Button
                        asChild
                        variant="secondary"
                        size="sm"
                        className="text-xs h-8 border border-white/10 rounded-lg"
                      >
                        <a
                          href={getShortUrl(item.code)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-400 truncate">
                    Target: {item.url}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}

