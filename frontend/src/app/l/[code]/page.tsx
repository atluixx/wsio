"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGuestLinks } from "@/lib/guestLinks";
import { ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";

export default function RedirectCodePage() {
  const [statusMessage, setStatusMessage] = useState("Resolving short link destination...");
  const [error, setError] = useState(false);

  useEffect(() => {
    // Extract code from pathname
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const code = pathParts.length >= 2 && pathParts[0] === "l" ? pathParts[1] : "";

    if (!code) {
      setError(true);
      setStatusMessage("Invalid link code provided.");
      return;
    }

    const resolveLink = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.wsio.lol";
        
        let res = await fetch(`/api/v1/links/${code}?json=true`, {
          headers: { Accept: "application/json" },
        }).catch(() => null);

        if (!res || !res.ok) {
          res = await fetch(`${API_BASE_URL}/api/v1/links/${code}?json=true`, {
            headers: { Accept: "application/json" },
          }).catch(() => null);
        }

        if (res && res.ok) {
          const data = await res.json();
          if (data.url) {
            setStatusMessage(`Redirecting to ${data.url}...`);
            window.location.href = data.url;
            return;
          }
        }
      } catch (e) {
        console.error("API link resolution failed, checking local guest cache", e);
      }

      // Check localStorage guest links fallback
      const guestLinks = getGuestLinks();
      const match = guestLinks.find((l) => l.code.toLowerCase() === code.toLowerCase());
      if (match && match.url) {
        setStatusMessage(`Redirecting to ${match.url}...`);
        window.location.href = match.url;
        return;
      }

      setError(true);
      setStatusMessage("Short link not found or has been removed.");
    };

    resolveLink();
  }, []);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900/60 p-8 text-center shadow-2xl backdrop-blur-xl">
        {!error ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 text-white animate-pulse">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
            </div>
            <div>
              <h2 className="font-mono text-lg font-bold text-white">Redirecting</h2>
              <p className="mt-1 font-mono text-xs text-zinc-400">{statusMessage}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-zinc-400">
              <ShieldAlert className="h-6 w-6 text-zinc-400" />
            </div>
            <div>
              <h2 className="font-mono text-lg font-bold text-white">Link Not Found</h2>
              <p className="mt-1 font-mono text-xs text-zinc-400">{statusMessage}</p>
            </div>

            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-mono text-xs font-semibold text-black transition-all hover:bg-zinc-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
