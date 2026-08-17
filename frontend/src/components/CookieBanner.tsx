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
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 pointer-events-none">
      <div className="mx-auto max-w-4xl rounded-2xl glass-panel p-5 shadow-2xl backdrop-blur-2xl pointer-events-auto transition-all animate-in slide-in-from-bottom-5 duration-300">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-200">
              <Cookie className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white">Privacy &amp; Cookie Preferences</h4>
                <span className="inline-flex items-center rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-zinc-200 border border-white/10">
                  LGPD &amp; GDPR Compliant
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed max-w-2xl">
                We use essential session cookies to handle authentication and secure link redirection. We respect your privacy and never sell data. Read our{" "}
                <Link href="/privacy" className="text-white underline underline-offset-4 hover:text-zinc-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm">
                  Privacy Policy
                </Link>{" "}
                for full details.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              className="text-xs border-white/10 bg-zinc-900/60 text-zinc-200 hover:bg-zinc-800 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
            >
              Reject Non-Essential
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleAccept}
              className="text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 px-4 focus-visible:ring-2 focus-visible:ring-white"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
