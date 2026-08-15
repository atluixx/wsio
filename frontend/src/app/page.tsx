"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createShortLink, LinkItem } from "@/lib/api";
import {
  saveGuestLink,
  normalizeUrl,
} from "@/lib/guestLinks";
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Zap,
  Cpu,
  BarChart3,
  Lock,
  Plus,
  Minus,
} from "lucide-react";
import { FauxWindow } from "@/components/FauxWindow";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdLink, setCreatedLink] = useState<LinkItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setLoading(true);
    setErrorMessage("");
    setCreatedLink(null);

    const formattedUrl = normalizeUrl(inputUrl);

    // Call backend API
    const res = await createShortLink(formattedUrl);
    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
      return;
    }

    if (res.code && res.url) {
      const newLink: LinkItem = {
        id: res.id || Math.random().toString(),
        code: res.code,
        url: res.url,
        createdAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setCreatedLink(newLink);

      if (!isAuthenticated) {
        saveGuestLink(newLink);
      }

      setInputUrl("");
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

  const faqItems = [
    {
      q: "How does wsio. achieve sub-15ms redirection latency?",
      a: "Our core redirect engine is compiled in Go and deployed across distributed edge nodes. It avoids heavy framework overhead, performing fast atomic hash lookups directly against high-concurrency key-value stores.",
    },
    {
      q: "Where can I view my links and track activity?",
      a: "All your generated links can be inspected in detail inside your dedicated Dashboard. It provides click metrics, destination editing, and status monitoring.",
    },
    {
      q: "What is the difference between Guest Session and Registered Account?",
      a: "Guest links are stored locally in your browser storage. Creating a free account synchronizes your links across devices and preserves your activity history permanently.",
    },
    {
      q: "Are short links permanent?",
      a: "Yes. Active links remain valid indefinitely unless deleted by the owner or flagged by security verification systems.",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 space-y-24">
      {/* Section 1: Hero & Shortener Engine */}
      <ScrollReveal>
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/90 px-3.5 py-1 font-mono text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-wider uppercase">Engine v1.0.4</span>
            <span className="text-zinc-600 font-bold">&bull;</span>
            <span className="text-zinc-300">Monochrome Utility</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-white leading-[1.08]">
            Shorten links with <br className="hidden sm:inline" />
            <span className="italic text-zinc-400">zero clutter.</span>
          </h1>

          <p className="mx-auto max-w-2xl font-mono text-xs sm:text-sm leading-relaxed text-zinc-400">
            A high-performance URL redirection engine engineered with Go &amp; Next.js.
            Sub-15ms edge resolution, clean monospaced hashes, zero tracking bloat.
          </p>
        </div>

        {/* URL Shortener Form */}
        <div className="mt-10 rounded-xl border border-white/10 bg-zinc-950/80 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleShorten} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                <Link2 className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="https://your-long-destination-url.com/path"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-900/90 py-3 pl-10 pr-4 font-mono text-xs text-white placeholder-zinc-600 transition-colors focus:border-white/30 focus:outline-none sm:text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-minimal-primary whitespace-nowrap"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Shorten URL</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-950/30 p-3.5 font-mono text-xs text-red-300">
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Output Card */}
          {createdLink && (
            <div className="mt-6 rounded-lg border border-white/15 bg-zinc-900/90 p-4 transition-all">
              <div className="mb-2 flex items-center justify-between font-mono text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  Short Link Generated
                </span>
                <span className="text-zinc-500">{createdLink.createdAt}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded border border-white/10 bg-zinc-950 p-3">
                <div className="truncate font-mono text-sm font-semibold text-white">
                  {getShortUrl(createdLink.code)}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(getShortUrl(createdLink.code), createdLink.code)}
                    className="flex items-center gap-1.5 rounded border border-white/10 bg-zinc-800 px-3 py-1.5 font-mono text-xs text-white transition-colors hover:bg-zinc-700 cursor-pointer"
                  >
                    {copiedCode === createdLink.code ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <a
                    href={getShortUrl(createdLink.code)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded border border-white/10 bg-zinc-800 px-3 py-1.5 font-mono text-xs text-white transition-colors hover:bg-zinc-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Test Link</span>
                  </a>

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 rounded border border-white/20 bg-white px-3 py-1.5 font-mono text-xs font-semibold text-black transition-colors hover:bg-zinc-200"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="mt-2 truncate font-mono text-xs text-zinc-500">
                Destination: {createdLink.url}
              </div>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Section 2: Bento Grid Architecture Showcase (SKILL.md Protocol) */}
      <ScrollReveal delayMs={100}>
        <div className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-zinc-500 uppercase tracking-widest">
            <span>[ SYSTEM SPECIFICATIONS ]</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-white">
            Utilitarian architecture by design.
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 - High Performance Engine */}
          <div className="bento-card md:col-span-2 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge-pastel-green">Engine Architecture</span>
                <Cpu className="h-5 w-5 text-zinc-400" />
              </div>
              <h3 className="font-mono text-lg font-bold text-white">
                Go Micro-Kernel &amp; Edge Hashes
              </h3>
              <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                Constructed with pure Golang HTTP routing and minimalist state handlers.
                Sub-15 millisecond resolution times with instant hash validation.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 font-mono text-[11px] text-zinc-500">
              <span className="rounded bg-zinc-900 border border-white/5 px-2 py-1">Atomic Lock-Free</span>
              <span className="rounded bg-zinc-900 border border-white/5 px-2 py-1">Base36 Standard</span>
              <span className="rounded bg-zinc-900 border border-white/5 px-2 py-1">Zero Overhead</span>
            </div>
          </div>

          {/* Card 2 - Dedicated Dashboard */}
          <div className="bento-card flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge-pastel-blue">Centralized Hub</span>
                <BarChart3 className="h-5 w-5 text-zinc-400" />
              </div>
              <h3 className="font-mono text-lg font-bold text-white">
                Dedicated Dashboard
              </h3>
              <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                Track link resolution stats, manage active destinations, copy short URLs, and review click history.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/dashboard"
                className="btn-minimal-secondary w-full"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3 - Zero Tracking & Privacy */}
          <div className="bento-card flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge-pastel-yellow">Privacy Core</span>
                <Lock className="h-5 w-5 text-zinc-400" />
              </div>
              <h3 className="font-mono text-lg font-bold text-white">
                Zero Fingerprinting
              </h3>
              <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                No third-party ad pixels, cookie injections, or browser tracking scripts. Your links remain clean and private.
              </p>
            </div>
            <div className="mt-6 font-mono text-[11px] text-zinc-500">
              Strict Legal Compliance &bull; GDPR Ready
            </div>
          </div>

          {/* Card 4 - Keystroke Micro-UI */}
          <div className="bento-card md:col-span-2 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge-pastel-red">Micro-UI Efficiency</span>
                <Zap className="h-5 w-5 text-zinc-400" />
              </div>
              <h3 className="font-mono text-lg font-bold text-white">
                Keyboard-First Workflows
              </h3>
              <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                Trigger link creation, copy generated hashes, and navigate your dashboard without leaving your keyboard.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-xs">
              <div className="flex items-center gap-1.5">
                <kbd>⌘</kbd> + <kbd>K</kbd> <span className="text-zinc-500">Search Links</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd>Shift</kbd> + <kbd>N</kbd> <span className="text-zinc-500">New Link</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Section 3: Faux-OS Window Interactive Preview */}
      <ScrollReveal delayMs={150}>
        <FauxWindow title="wsio-redirect-trace ~ edge-node-01">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-zinc-400">[HTTP GET /l/x82k9a]</span>
              <span className="badge-pastel-green">200 OK &bull; 11ms</span>
            </div>
            <div className="space-y-1 text-zinc-400">
              <p><span className="text-zinc-600">&gt;</span> Parsing inbound hash: <span className="text-white font-semibold">x82k9a</span></p>
              <p><span className="text-zinc-600">&gt;</span> Edge lookup: <span className="text-white">https://github.com/atluixx/wsio</span></p>
              <p><span className="text-zinc-600">&gt;</span> Header injection: <span className="text-zinc-300">HTTP/2 302 Found</span></p>
              <p><span className="text-zinc-600">&gt;</span> Status: <span className="text-emerald-400">Redirect executed successfully.</span></p>
            </div>
          </div>
        </FauxWindow>
      </ScrollReveal>

      {/* Section 4: Accordion FAQ (SKILL.md Protocol) */}
      <ScrollReveal delayMs={200}>
        <div className="space-y-8">
          <div className="border-b border-white/10 pb-4">
            <h2 className="font-serif text-3xl text-white">Frequently Asked Questions</h2>
            <p className="mt-1 font-mono text-xs text-zinc-500">
              Technical details regarding the wsio architecture and link handling.
            </p>
          </div>

          <div className="divide-y divide-white/10">
            {faqItems.map((item, idx) => (
              <div key={idx} className="py-4">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between font-mono text-sm font-semibold text-white text-left focus:outline-none cursor-pointer"
                >
                  <span>{item.q}</span>
                  <span className="ml-4 shrink-0 rounded-md border border-white/10 p-1 text-zinc-400 hover:text-white">
                    {openFaq === idx ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                {openFaq === idx && (
                  <p className="mt-3 font-mono text-xs leading-relaxed text-zinc-400 pr-8">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
