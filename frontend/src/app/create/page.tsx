"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createShortLink, LinkItem } from "@/lib/api";
import {
  getGuestLinks,
  saveGuestLink,
  normalizeUrl,
  generateGuestHash,
  getGuestDailyUsage,
  incrementGuestDailyUsage,
  GUEST_DAILY_LIMIT,
} from "@/lib/guestLinks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function CreateLinkPage() {
  const { isAuthenticated, user } = useAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdLinks, setCreatedLinks] = useState<LinkItem[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [guestUsage, setGuestUsage] = useState({ count: 0, date: "" });

  useEffect(() => {
    setCreatedLinks(getGuestLinks());
    setGuestUsage(getGuestDailyUsage());
  }, []);

  const limitReached = !isAuthenticated && guestUsage.count >= GUEST_DAILY_LIMIT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (limitReached) {
      setError("Guest daily limit reached (3/3). Register free or upgrade to Starter for unlimited link creation.");
      return;
    }

    setLoading(true);
    setError("");

    const formattedUrl = normalizeUrl(url);

    let code = "";
    let id = "";
    let userId: string | undefined = undefined;

    const res = await createShortLink(formattedUrl);
    setLoading(false);

    if (res.error && res.error.includes("limit reached")) {
      setError(res.error);
      return;
    }

    if (!res.error && res.code) {
      code = res.code;
      id = res.id || Math.random().toString();
      userId = res.userId || (isAuthenticated ? user?.id : undefined);
    } else {
      code = generateGuestHash(formattedUrl);
      id = Math.random().toString();
      userId = isAuthenticated ? user?.id : undefined;
    }

    const newLink: LinkItem = {
      id: id,
      code: code,
      url: formattedUrl,
      userId: userId,
      createdAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updated = saveGuestLink(newLink);
    setCreatedLinks(updated);

    if (!isAuthenticated) {
      incrementGuestDailyUsage();
      setGuestUsage(getGuestDailyUsage());
    }

    setUrl("");
  };

  const getShortUrl = (code: string) => {
    return `https://wsio.lol/l/${code}`;
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-16 space-y-8 font-sans">
      {/* Header */}
      <ScrollReveal>
        <div className="border-b border-white/10 pb-4 space-y-1">
          <h1 className="font-heading text-3xl sm:text-4xl text-white font-bold">
            Create Short Link
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Convert long destination web addresses into concise, shareable links.
          </p>
        </div>
      </ScrollReveal>

      {/* Main Creation Card */}
      <ScrollReveal delayMs={50}>
        <Card className="p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6">
          {!isAuthenticated && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400 border-b border-white/10 pb-3">
              <span>Guest Daily Limit: <strong className="text-white">{guestUsage.count} / {GUEST_DAILY_LIMIT}</strong> created today</span>
              {limitReached ? (
                <Link href="/pricing" className="text-emerald-400 hover:underline font-semibold flex items-center gap-1">
                  <span>Upgrade to Starter</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ) : (
                <span className="text-zinc-400">{GUEST_DAILY_LIMIT - guestUsage.count} remaining today</span>
              )}
            </div>
          )}

          {limitReached && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-950/40 p-4 text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
                <span>You have reached the guest limit of 3 links today.</span>
              </div>
              <Button asChild size="sm" className="whitespace-nowrap text-xs">
                <Link href="/pricing">View Plans &amp; Upgrade</Link>
              </Button>
            </div>
          )}

          {error && !limitReached && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-xs text-red-300">
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Destination URL
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Link2 className="h-4 w-4" />
                </div>
                <Input
                  type="url"
                  placeholder={limitReached ? "Guest daily limit reached (3/3)." : "https://example.com/long/destination/address"}
                  value={url}
                  disabled={limitReached}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10 h-12 text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-zinc-400">
                {isAuthenticated ? `Signed in as ${user?.email}` : "Guest Session (Saved locally)"}
              </span>

              <Button
                type="submit"
                disabled={loading || limitReached}
                className="w-full sm:w-auto h-11 px-6 text-xs font-semibold"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
        </Card>
      </ScrollReveal>

      {/* Generated Links History */}
      {createdLinks.length > 0 && (
        <ScrollReveal delayMs={100}>
          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-emerald-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
                  Recently Created Links ({createdLinks.length})
                </h2>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs h-8">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </Link>
              </Button>
            </div>

            <div className="space-y-3">
              {createdLinks.slice(0, 5).map((item) => (
                <div
                  key={item.code}
                  className="rounded-xl border border-white/10 bg-zinc-900/60 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5 text-white font-medium">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      Code: <Badge variant="outline" className="font-mono text-xs">{item.code}</Badge>
                    </span>
                    <span>{item.createdAt}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-white/10 bg-zinc-950 p-3">
                    <div className="truncate text-sm text-emerald-300 font-mono font-semibold">
                      {getShortUrl(item.code)}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(getShortUrl(item.code), item.code)}
                        className="text-xs h-8"
                      >
                        {copiedCode === item.code ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-zinc-950" />
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
                        className="text-xs h-8"
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
          </Card>
        </ScrollReveal>
      )}
    </div>
  );
}
