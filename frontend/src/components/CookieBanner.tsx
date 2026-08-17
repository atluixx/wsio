"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "wsio_cookie_consent_choice";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check local storage after initial LCP window to prevent blocking paint or text evaluation
    const timer = setTimeout(() => {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        setShowBanner(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ analytics: true, essential: true, date: new Date().toISOString() }));
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ analytics: false, essential: true, date: new Date().toISOString() }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 pointer-events-none font-sans">
      <div className="mx-auto max-w-4xl rounded-2xl craft-panel p-5 shadow-2xl backdrop-blur-2xl pointer-events-auto transition-all animate-in slide-in-from-bottom-5 duration-300 border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-mono">
              <Cookie className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-mono">
                <h4 className="text-sm font-bold text-white">Privacy &amp; Telemetry Policy</h4>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                  GDPR &amp; LGPD Compliant
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                We use essential session tokens to process link redirection and user authentication. Zero third-party ad tracking. Read our{" "}
                <Link href="/privacy" className="text-emerald-400 underline underline-offset-4 hover:text-emerald-300 font-medium">
                  Privacy Policy
                </Link>{" "}
                for full transparency.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end font-mono">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              className="text-xs border-white/10 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg"
            >
              Essential Only
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleAccept}
              className="text-xs font-bold bg-emerald-500 text-emerald-950 hover:bg-emerald-400 px-4 rounded-lg"
            >
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

