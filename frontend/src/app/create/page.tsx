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
      setError("Guest daily creation limit reached (3/3). Register or upgrade to Starter for unlimited links.");
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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-16 space-y-8 font-mono">
      {/* Header */}
      <ScrollReveal>
        <div className="border-b border-white/10 pb-4">
          <h1 className="font-serif text-3xl sm:text-4xl text-white">
            Create Short Link
          </h1>
          <p className="mt-1.5 text-xs text-zinc-400">
            Transform long destination URLs into clean monospaced hashes.
          </p>
        </div>
      </ScrollReveal>

      {/* Main Creation Card */}
      <ScrollReveal delayMs={50}>
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6">
          {!isAuthenticated && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400 border-b border-white/10 pb-3">
              <span>Guest Daily Limit: <strong className="text-white">{guestUsage.count} / {GUEST_DAILY_LIMIT}</strong> created today</span>
              {limitReached ? (
                <Link href="/pricing" className="text-emerald-400 hover:underline font-semibold flex items-center gap-1">
                  <span>Upgrade to Starter</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ) : (
                <span className="text-zinc-500">{GUEST_DAILY_LIMIT - guestUsage.count} remaining today</span>
              )}
            </div>
          )}

          {limitReached && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-950/40 p-4 text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
                <span>You have reached the guest daily limit of 3 links.</span>
              </div>
              <Link href="/pricing" className="btn-minimal-primary text-xs whitespace-nowrap min-h-[40px]">
                <span>View Plans &amp; Upgrade</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {error && !limitReached && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-950/30 p-4 text-xs text-red-300">
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-zinc-300">
                Destination URL
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Link2 className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder={limitReached ? "Guest daily limit reached (3/3)." : "https://example.com/very/long/destination/address"}
                  value={url}
                  disabled={limitReached}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900/90 py-3.5 pl-10 pr-4 text-xs text-white placeholder-zinc-600 transition-colors focus:border-emerald-500/50 focus:outline-none sm:text-sm disabled:opacity-50 min-h-[48px]"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-zinc-500">
                {isAuthenticated ? `Session active as ${user?.email}` : "Guest Session (Saved locally)"}
              </span>

              <button
                type="submit"
                disabled={loading || limitReached}
                className="btn-minimal-primary w-full sm:w-auto cursor-pointer disabled:opacity-50 min-h-[44px] px-6 text-xs"
                title="Click here to submit form and generate short link"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : limitReached ? (
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <Lock className="h-4 w-4" />
                    <span>Limit Reached</span>
                  </span>
                ) : (
                  <>
                    <span>Generate Short Link</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </ScrollReveal>

      {/* Generated Links History */}
      {createdLinks.length > 0 && (
        <ScrollReveal delayMs={100}>
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-emerald-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
                  Recently Created Links ({createdLinks.length})
                </h2>
              </div>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </Link>
            </div>

            <div className="space-y-3">
              {createdLinks.slice(0, 5).map((item) => (
                <div
                  key={item.code}
                  className="rounded-xl border border-white/10 bg-zinc-900/60 p-4 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5 text-white font-medium">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      Code: <span className="rounded bg-zinc-950 border border-white/10 px-2 py-0.5 font-bold text-white">{item.code}</span>
                    </span>
                    <span>{item.createdAt}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-white/10 bg-zinc-950 p-3">
                    <div className="truncate text-sm text-white font-bold text-emerald-300">
                      {getShortUrl(item.code)}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(getShortUrl(item.code), item.code)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-xs text-white transition-colors hover:bg-zinc-700 cursor-pointer min-h-[38px]"
                        title="Copy short link URL to clipboard"
                      >
                        {copiedCode === item.code ? (
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
                      </button>

                      <a
                        href={getShortUrl(item.code)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-xs text-white transition-colors hover:bg-zinc-700 min-h-[38px]"
                        title="Test edge redirection in new tab"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Test</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="truncate">Target: {item.url}</span>
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
