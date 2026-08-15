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
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function CreateLinkPage() {
  const { isAuthenticated, user } = useAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdLinks, setCreatedLinks] = useState<LinkItem[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    setCreatedLinks(getGuestLinks());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");

    const formattedUrl = normalizeUrl(url);

    let code = "";
    let id = "";
    let userId: string | undefined = undefined;

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

    const updated = saveGuestLink(newLink);
    setCreatedLinks(updated);
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
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 space-y-8">
      {/* Header */}
      <ScrollReveal>
        <div className="border-b border-white/10 pb-4">
          <h1 className="font-serif text-3xl sm:text-4xl text-white">
            Create Short Link
          </h1>
          <p className="mt-1 font-mono text-xs text-zinc-400">
            Transform long destination URLs into clean monospaced hashes.
          </p>
        </div>
      </ScrollReveal>

      {/* Main Creation Card */}
      <ScrollReveal delayMs={50}>
        <div className="rounded-xl border border-white/10 bg-zinc-950 p-6 shadow-2xl backdrop-blur-xl space-y-6">
          {error && (
            <div className="flex items-center gap-2.5 rounded-lg border border-red-500/20 bg-red-950/30 p-4 font-mono text-xs text-red-300">
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-zinc-300">
                Destination URL
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Link2 className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="https://example.com/very/long/destination/address"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-zinc-900/90 py-3 pl-10 pr-4 font-mono text-xs text-white placeholder-zinc-600 transition-colors focus:border-white/30 focus:outline-none sm:text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="font-mono text-xs text-zinc-500">
                {isAuthenticated ? `Session active as ${user?.email}` : "Guest Session (Saved locally)"}
              </span>

              <button
                type="submit"
                disabled={loading}
                className="btn-minimal-primary w-full sm:w-auto cursor-pointer"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Generate Link</span>
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
          <div className="rounded-xl border border-white/10 bg-zinc-950 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-zinc-400" />
                <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
                  Recently Created Links ({createdLinks.length})
                </h2>
              </div>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </Link>
            </div>

            <div className="space-y-3">
              {createdLinks.slice(0, 5).map((item) => (
                <div
                  key={item.code}
                  className="rounded-lg border border-white/10 bg-zinc-900/60 p-4 transition-all"
                >
                  <div className="mb-2 flex items-center justify-between font-mono text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5 text-white font-medium">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      Code: <span className="rounded bg-zinc-950 border border-white/10 px-1.5 py-0.5 font-bold text-white">{item.code}</span>
                    </span>
                    <span>{item.createdAt}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded border border-white/10 bg-zinc-950 p-3">
                    <div className="truncate font-mono text-sm text-white font-semibold">
                      {getShortUrl(item.code)}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(getShortUrl(item.code), item.code)}
                        className="flex items-center gap-1.5 rounded border border-white/10 bg-zinc-800 px-3 py-1.5 font-mono text-xs text-white transition-colors hover:bg-zinc-700 cursor-pointer"
                      >
                        {copiedCode === item.code ? (
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
                        href={getShortUrl(item.code)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded border border-white/10 bg-zinc-800 px-3 py-1.5 font-mono text-xs text-white transition-colors hover:bg-zinc-700"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Open</span>
                      </a>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between font-mono text-xs text-zinc-500">
                    <span className="truncate">Target: {item.url}</span>
                    {item.userId && (
                      <span className="shrink-0 text-zinc-400 border border-white/10 px-2 py-0.5 rounded text-[11px]">
                        User ID: {item.userId.substring(0, 8)}...
                      </span>
                    )}
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
