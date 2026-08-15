"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createShortLink, deleteShortLink, LinkItem } from "@/lib/api";
import {
  getGuestLinks,
  saveGuestLink,
  removeGuestLink,
  normalizeUrl,
} from "@/lib/guestLinks";
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  UserCheck,
  UserX,
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdLink, setCreatedLink] = useState<LinkItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [recentLinks, setRecentLinks] = useState<LinkItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setRecentLinks(getGuestLinks());
    }
  }, [isAuthenticated]);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setLoading(true);
    setErrorMessage("");
    setCreatedLink(null);

    const formattedUrl = normalizeUrl(inputUrl);

    // Call API (works for both Guests and Authenticated Users!)
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
        const updated = saveGuestLink(newLink);
        setRecentLinks(updated);
      } else {
        setRecentLinks((prev) => [newLink, ...prev]);
      }

      setInputUrl("");
    }
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDelete = async (code: string) => {
    if (!isAuthenticated) {
      const updated = removeGuestLink(code);
      setRecentLinks(updated);
      if (createdLink?.code === code) {
        setCreatedLink(null);
      }
      return;
    }

    const res = await deleteShortLink(code);
    if (res.success) {
      setRecentLinks((prev) => prev.filter((l) => l.code !== code));
      if (createdLink?.code === code) {
        setCreatedLink(null);
      }
    } else {
      alert(res.error || "Could not delete link");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/90 px-3 py-1 font-mono text-xs text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          [ ENGINE V1.0 ] &bull; MONOCHROME UTILITY
        </div>

        <h1 className="mb-4 font-mono text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Shorten links with <br className="hidden sm:inline" /> zero noise.
        </h1>

        <p className="mx-auto max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          A minimalist URL redirection service built with pure Go &amp; Next.js. Ultra-fast hash generation, clean metrics, no tracking bloat.
        </p>
      </div>

      {/* Shortener Form Card */}
      <div className="mb-12 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
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
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-3 pl-10 pr-4 font-mono text-xs text-white placeholder-zinc-600 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-mono text-xs font-semibold text-black transition-all hover:bg-zinc-200 active:scale-95 disabled:opacity-50 sm:text-sm"
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

        {/* Guest Mode Status Banner */}
        <div className="mt-3 flex items-center justify-between font-mono text-xs text-zinc-500 px-1">
          <div className="flex items-center gap-1.5">
            {isAuthenticated ? (
              <>
                <UserCheck className="h-3.5 w-3.5 text-white" />
                <span>Account mode ({user?.email})</span>
              </>
            ) : (
              <>
                <UserX className="h-3.5 w-3.5 text-zinc-400" />
                <span>Guest mode (links saved in browser)</span>
              </>
            )}
          </div>
          {!isAuthenticated && (
            <Link href="/login" className="text-zinc-400 hover:text-white underline">
              Log in to sync
            </Link>
          )}
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 font-mono text-xs text-zinc-300">
            <ShieldAlert className="h-4 w-4 text-zinc-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Output Card */}
        {createdLink && (
          <div className="mt-6 rounded-lg border border-zinc-700 bg-zinc-950 p-4 transition-all">
            <div className="mb-2 flex items-center justify-between font-mono text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 text-white font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                Short Link Created {!isAuthenticated && "(Guest)"}
              </span>
              <span>{createdLink.createdAt}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded border border-zinc-800 bg-zinc-900/80 p-3">
              <div className="truncate font-mono text-sm text-white">
                https://api.wsio.lol/api/v1/links/{createdLink.code}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    copyToClipboard(
                      `https://api.wsio.lol/api/v1/links/${createdLink.code}`,
                      createdLink.code
                    )
                  }
                  className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 font-mono text-xs text-white transition-colors hover:bg-zinc-700"
                >
                  {copiedCode === createdLink.code ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-white" />
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
                  href={`https://api.wsio.lol/api/v1/links/${createdLink.code}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 font-mono text-xs text-white transition-colors hover:bg-zinc-700"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Test Link</span>
                </a>
              </div>
            </div>

            <div className="mt-2 truncate font-mono text-xs text-zinc-500">
              Destination: {createdLink.url}
            </div>
          </div>
        )}
      </div>

      {/* Recent Links Section */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-sm font-semibold tracking-wide text-white uppercase">
            Active Links {recentLinks.length > 0 && `(${recentLinks.length})`}
          </h2>
          <span className="font-mono text-xs text-zinc-500">
            {isAuthenticated ? `Logged in as ${user?.email}` : "Guest Session (Local Storage)"}
          </span>
        </div>

        {recentLinks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 py-12 text-center">
            <Link2 className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
            <p className="font-mono text-xs text-zinc-500">
              No links created yet. Enter a URL above to shorten.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentLinks.map((link) => (
              <div
                key={link.code}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 transition-colors hover:border-zinc-700"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 font-mono text-xs text-white font-medium">
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-zinc-300">
                      {link.code}
                    </span>
                    <span className="truncate">
                      https://api.wsio.lol/api/v1/links/{link.code}
                    </span>
                  </div>
                  <div className="mt-1 truncate font-mono text-xs text-zinc-500">
                    {link.url}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `https://api.wsio.lol/api/v1/links/${link.code}`,
                        link.code
                      )
                    }
                    className="flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 font-mono text-xs text-zinc-300 hover:border-zinc-700 hover:text-white"
                  >
                    {copiedCode === link.code ? (
                      <Check className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <a
                    href={`https://api.wsio.lol/api/v1/links/${link.code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 font-mono text-xs text-zinc-300 hover:border-zinc-700 hover:text-white"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <button
                    onClick={() => handleDelete(link.code)}
                    className="flex items-center gap-1 rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 font-mono text-xs text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    title="Delete link"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
