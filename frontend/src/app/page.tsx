"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createShortLink, LinkItem } from "@/lib/api";
import {
  saveGuestLink,
  normalizeUrl,
  generateGuestHash,
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
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
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

    let code = "";
    let id = "";
    let userId: string | undefined = undefined;

    // Call backend API with fallback
    const res = await createShortLink(formattedUrl);
    setLoading(false);

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
      a: "Our core engine is built in Go and optimized for instant edge redirection.",
    },
    {
      q: "Where can I view my links and track activity?",
      a: "All your generated links can be managed inside your dedicated Dashboard, providing link history, test links, and deletion management.",
    },
    {
      q: "What is the difference between Guest Session and Registered Account?",
      a: "Guest links are stored locally in your browser. Registering a free account allows you to sync links across devices.",
    },
    {
      q: "Are short links permanent?",
      a: "Yes. Active links remain valid indefinitely unless manually deleted.",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 space-y-16">
      {/* Hero & Shortener Engine */}
      <ScrollReveal>
        <div className="text-center space-y-4">
          <h1 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-white leading-[1.1]">
            Shorten links with <br className="hidden sm:inline" />
            <span className="italic text-zinc-400">zero clutter.</span>
          </h1>
        </div>

        {/* URL Shortener Form */}
        <div className="mt-8 rounded-xl border border-white/10 bg-zinc-950/80 p-4 sm:p-6 backdrop-blur-xl">
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
              className="btn-minimal-primary whitespace-nowrap cursor-pointer"
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

              <div className="mt-2 flex items-center justify-between font-mono text-xs text-zinc-500">
                <span className="truncate">Destination: {createdLink.url}</span>
                {createdLink.userId && (
                  <span className="shrink-0 text-zinc-400 border border-white/10 px-2 py-0.5 rounded text-[11px]">
                    User ID: {createdLink.userId.substring(0, 8)}...
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Accordion FAQ */}
      <ScrollReveal delayMs={100}>
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="font-serif text-2xl text-white">Frequently Asked Questions</h2>
          </div>

          <div className="divide-y divide-white/10">
            {faqItems.map((item, idx) => (
              <div key={idx} className="py-4">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between font-mono text-xs sm:text-sm font-semibold text-white text-left focus:outline-none cursor-pointer"
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
