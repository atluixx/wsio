"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createShortLink, LinkItem } from "@/lib/api";
import {
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
  Plus,
  Minus,
  Lock,
  Zap,
  BarChart3,
  ShieldCheck,
  MousePointerClick,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdLink, setCreatedLink] = useState<LinkItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [guestUsage, setGuestUsage] = useState({ count: 0, date: "" });

  useEffect(() => {
    setGuestUsage(getGuestDailyUsage());
  }, []);

  const limitReached = !isAuthenticated && guestUsage.count >= GUEST_DAILY_LIMIT;

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    if (limitReached) {
      setErrorMessage("Guest daily limit of 3 links reached. Register free or upgrade your plan to unlock unlimited links.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setCreatedLink(null);

    const formattedUrl = normalizeUrl(inputUrl);

    let code = "";
    let id = "";
    let userId: string | undefined = undefined;

    const res = await createShortLink(formattedUrl);
    setLoading(false);

    if (res.error && res.error.includes("limit reached")) {
      setErrorMessage(res.error);
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

    setCreatedLink(newLink);
    saveGuestLink(newLink);
    
    if (!isAuthenticated) {
      incrementGuestDailyUsage();
      setGuestUsage(getGuestDailyUsage());
    }

    setInputUrl("");
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getShortUrl = (code: string) => {
    return `https://wsio.lol/l/${code}`;
  };

  const faqItems = [
    {
      q: "How fast is link redirection?",
      a: "Our backend engine is written in Go and optimized for sub-millisecond edge redirection using high-performance memory routing.",
    },
    {
      q: "Where can I view my links and track click analytics?",
      a: "All generated links are automatically stored in your Dashboard. Registered users can view real-time click metrics, referrer origins, and full link history.",
    },
    {
      q: "What is the difference between Guest Session & Registered Account?",
      a: "Guest users get 3 short links per day stored locally in browser memory. Registered accounts enjoy unlimited link generation, cross-device sync, and persistent click analytics.",
    },
    {
      q: "Are short links permanent?",
      a: "Yes. Active short links remain live indefinitely unless manually deleted in your Dashboard.",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-16 space-y-12 sm:space-y-16">
      {/* Hero & Central Input Engine */}
      <ScrollReveal>
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/30 px-3 py-1 font-mono text-xs text-emerald-400">
            <Zap className="h-3.5 w-3.5" />
            <span>High-Speed Go-Powered Edge Shortener</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-6xl font-normal tracking-tight text-white leading-[1.15]">
            Shorten links with <br />
            <span className="italic text-zinc-400">zero clutter &amp; instant speed.</span>
          </h1>

          <p className="mx-auto max-w-xl text-xs sm:text-sm text-zinc-400 font-mono">
            Paste any long URL below to generate a sleek, minimal short link ready to share anywhere.
          </p>
        </div>

        {/* URL Shortener Form */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-zinc-950/90 p-4 sm:p-6 backdrop-blur-xl space-y-4 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs border-b border-white/10 pb-3">
            <span className="text-zinc-400">
              {isAuthenticated ? (
                <span className="text-emerald-400 font-semibold">✓ Authenticated Session — Unlimited Creation</span>
              ) : (
                <span>Guest Daily Usage: <strong className="text-white">{guestUsage.count} / {GUEST_DAILY_LIMIT}</strong> used</span>
              )}
            </span>

            {!isAuthenticated && (
              limitReached ? (
                <Link href="/pricing" className="text-emerald-400 hover:underline font-semibold flex items-center gap-1">
                  <span>Upgrade to Starter (Unlimited)</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ) : (
                <span className="text-zinc-500">{GUEST_DAILY_LIMIT - guestUsage.count} free links remaining today</span>
              )
            )}
          </div>

          <form onSubmit={handleShorten} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                <Link2 className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                placeholder={limitReached ? "Guest limit reached (3/3). Register to shorten more links." : "Paste long URL (e.g. https://github.com/user/project/releases/...)"}
                value={inputUrl}
                disabled={limitReached}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900/90 py-3.5 pl-11 pr-4 font-mono text-xs text-white placeholder-zinc-500 transition-colors focus:border-emerald-500/50 focus:outline-none sm:text-sm disabled:opacity-50 min-h-[48px]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || limitReached}
              className="btn-minimal-primary min-h-[48px] px-6 text-xs sm:text-sm whitespace-nowrap cursor-pointer disabled:opacity-50 w-full sm:w-auto"
              title="Click here to convert your input URL into a 6-character short hash"
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
                  <span>Shorten URL</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>

          {/* Direct callout on where to click */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-500 font-mono pt-1">
            <span>✨ Generates a instant redirection hash: <code className="text-zinc-300">https://wsio.lol/l/xxxxxx</code></span>
            <span>Click &quot;Shorten URL&quot; to execute</span>
          </div>

          {/* Limit Warning Banner */}
          {limitReached && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-950/40 p-4 font-mono text-xs text-amber-200">
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

          {/* Error Banner */}
          {errorMessage && !limitReached && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/30 p-3.5 font-mono text-xs text-red-300">
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Output Card */}
          {createdLink && (
            <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3 animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <Sparkles className="h-4 w-4" />
                  Short Link Ready!
                </span>
                <span className="text-zinc-500">{createdLink.createdAt}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-white/10 bg-zinc-950 p-3.5">
                <div className="truncate font-mono text-sm font-bold text-emerald-300">
                  {getShortUrl(createdLink.code)}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(getShortUrl(createdLink.code), createdLink.code)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-800 px-3.5 py-2 font-mono text-xs text-white transition-colors hover:bg-zinc-700 cursor-pointer min-h-[40px]"
                    title="Copy short link URL to system clipboard"
                  >
                    {copiedCode === createdLink.code ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <a
                    href={getShortUrl(createdLink.code)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-800 px-3.5 py-2 font-mono text-xs text-white transition-colors hover:bg-zinc-700 min-h-[40px]"
                    title="Open and test edge redirection live in a new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Test Redirection</span>
                  </a>

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 font-mono text-xs font-semibold text-black transition-colors hover:bg-zinc-200 min-h-[40px]"
                    title="Go to Dashboard to view analytics & manage links"
                  >
                    <span>Manage in Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between font-mono text-xs text-zinc-400 gap-1 pt-1">
                <span className="truncate">Destination Target: <span className="text-white">{createdLink.url}</span></span>
                <span className="text-emerald-400 text-[11px]">Saved automatically to your session</span>
              </div>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Feature Highlights Grid — "Why click & use wsio" */}
      <ScrollReveal delayMs={50}>
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl text-white">Why use wsio?</h2>
            <p className="font-mono text-xs text-zinc-400">Designed for developers, creators, and teams who demand speed &amp; clarity.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bento-card space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-zinc-900 text-emerald-400">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-mono text-sm font-semibold text-white">Instant Edge Speed</h3>
              <p className="font-mono text-xs leading-relaxed text-zinc-400">
                Built in Go for sub-millisecond edge redirects with high concurrency capacity.
              </p>
            </div>

            <div className="bento-card space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-zinc-900 text-emerald-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-mono text-sm font-semibold text-white">Click Analytics</h3>
              <p className="font-mono text-xs leading-relaxed text-zinc-400">
                Track total visits, 24-hour velocity, 7-day volume, and referrer source breakdown.
              </p>
            </div>

            <div className="bento-card space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-zinc-900 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-mono text-sm font-semibold text-white">Zero Clutter</h3>
              <p className="font-mono text-xs leading-relaxed text-zinc-400">
                No tracking bloat or unnecessary redirect delays. Clean monospaced hashes.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Accordion FAQ */}
      <ScrollReveal delayMs={100}>
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="font-serif text-2xl text-white">Frequently Asked Questions</h2>
            <p className="font-mono text-xs text-zinc-400 mt-1">Everything you need to know about link limits and features.</p>
          </div>

          <div className="divide-y divide-white/10">
            {faqItems.map((item, idx) => (
              <div key={idx} className="py-4">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between font-mono text-xs sm:text-sm font-semibold text-white text-left focus:outline-none cursor-pointer min-h-[44px]"
                  aria-expanded={openFaq === idx}
                >
                  <span>{item.q}</span>
                  <span className="ml-4 shrink-0 rounded-lg border border-white/10 p-1.5 text-zinc-400 hover:text-white">
                    {openFaq === idx ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                {openFaq === idx && (
                  <p className="mt-3 font-mono text-xs leading-relaxed text-zinc-400 pr-8 animate-in fade-in-50 duration-150">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Primary CTA Card — Clear "Where & Why to Click" */}
      <ScrollReveal delayMs={150}>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 sm:p-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
            <MousePointerClick className="h-4 w-4" />
            <span>Ready to unlock unlimited short links?</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl text-white">
            Create an account or upgrade today.
          </h2>
          <p className="mx-auto max-w-md font-mono text-xs text-zinc-400">
            Enjoy unlimited link generation, persistent cross-device storage, and detailed real-time click metrics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="btn-minimal-primary text-xs w-full sm:w-auto min-h-[44px] px-6"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="btn-minimal-secondary text-xs w-full sm:w-auto min-h-[44px] px-6"
            >
              <span>Explore Pricing Plans</span>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
