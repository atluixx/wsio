"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createShortLink, LinkItem } from "@/lib/api";
import {
  getGuestLinks,
  saveGuestLink,
  generateGuestHash,
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
  Plus,
  History,
  UserCheck,
  UserX,
} from "lucide-react";

export default function CreateLinkPage() {
  const { isAuthenticated, user } = useAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdLinks, setCreatedLinks] = useState<LinkItem[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setCreatedLinks(getGuestLinks());
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");

    const formattedUrl = normalizeUrl(url);

    if (!isAuthenticated) {
      setTimeout(() => {
        const code = generateGuestHash(formattedUrl);
        const newGuestLink: LinkItem = {
          id: "guest_" + Date.now(),
          code,
          url: formattedUrl,
          createdAt: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        const updated = saveGuestLink(newGuestLink);
        setCreatedLinks(updated);
        setUrl("");
        setLoading(false);
      }, 250);
      return;
    }

    const res = await createShortLink(formattedUrl);
    setLoading(false);

    if (res.error) {
      setError(res.error);
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
      setCreatedLinks((prev) => [newLink, ...prev]);
      setUrl("");
    }
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 font-mono text-xs font-bold text-white">
            <Plus className="h-4 w-4" />
          </div>
          <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
            Link Generator
          </span>
        </div>

        <h1 className="font-mono text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Create Short Link
        </h1>
        <p className="mt-1 font-mono text-xs text-zinc-400">
          Transform long URLs into clean, high-performance monospaced hashes.
        </p>
      </div>

      {/* Main Creation Card */}
      <div className="mb-10 rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl backdrop-blur-xl">
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-300">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-4 w-4 text-zinc-400 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block font-mono text-xs text-zinc-300 uppercase tracking-wider">
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
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950/90 py-3 pl-10 pr-4 font-mono text-xs text-white placeholder-zinc-600 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="flex items-center gap-1.5 font-mono text-xs text-zinc-500">
              {isAuthenticated ? (
                <>
                  <UserCheck className="h-3.5 w-3.5 text-white" />
                  <span>Session active as {user?.email}</span>
                </>
              ) : (
                <>
                  <UserX className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Guest Mode (Saved in browser)</span>
                </>
              )}
            </span>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 font-mono text-xs font-semibold text-black transition-all hover:bg-zinc-200 active:scale-95 disabled:opacity-50 sm:text-sm"
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

      {/* Generated Links History */}
      {createdLinks.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-4 w-4 text-zinc-400" />
            <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
              Generated Links ({createdLinks.length})
            </h2>
          </div>

          <div className="space-y-3">
            {createdLinks.map((item) => (
              <div
                key={item.code}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 transition-all"
              >
                <div className="mb-2 flex items-center justify-between font-mono text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5 text-white font-medium">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                    Code: <span className="rounded bg-zinc-800 px-1.5 py-0.5">{item.code}</span>
                  </span>
                  <span>{item.createdAt}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded border border-zinc-800 bg-zinc-900/80 p-3">
                  <div className="truncate font-mono text-sm text-white">
                    https://www.wsio.lol/api/v1/links/{item.code}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `https://www.wsio.lol/api/v1/links/${item.code}`,
                          item.code
                        )
                      }
                      className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 font-mono text-xs text-white transition-colors hover:bg-zinc-700"
                    >
                      {copiedCode === item.code ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-white" />
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
                      href={`https://www.wsio.lol/api/v1/links/${item.code}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 font-mono text-xs text-white transition-colors hover:bg-zinc-700"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Open</span>
                    </a>
                  </div>
                </div>

                <div className="mt-2 truncate font-mono text-xs text-zinc-500">
                  Target: {item.url}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
