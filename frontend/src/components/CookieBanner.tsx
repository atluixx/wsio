"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "wsio_cookie_consent_choice";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after brief delay
      const timer = setTimeout(() => setShowBanner(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ analytics: true, essential: true, date: new Date().toISOString() }));
    setShowBanner(false);
  };

  const handleRejectOptional = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ analytics: false, essential: true, date: new Date().toISOString() }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 pointer-events-none">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/15 bg-zinc-950/95 p-5 shadow-2xl backdrop-blur-xl pointer-events-auto transition-all animate-in slide-in-from-bottom-5 duration-300">
        {!showPreferences ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 flex-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-300">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">We value your privacy</h4>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="h-3 w-3" />
                    LGPD &amp; GDPR Compliant
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                  We use essential session cookies to manage link redirections and authentication. We do not sell your personal data or track your browsing activity across external sites. Read our{" "}
                  <Link href="/privacy#cookies" className="text-white underline underline-offset-4 hover:text-zinc-200 font-medium">
                    Privacy Policy
                  </Link>{" "}
                  for full compliance details.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreferences(true)}
                className="text-xs w-full sm:w-auto"
              >
                Manage Preferences
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRejectOptional}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Reject Non-Essential
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleAcceptAll}
                className="text-xs font-semibold w-full sm:w-auto"
              >
                Accept All
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-semibold text-white">Cookie Preferences &amp; Data Rights</h4>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Back
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Essential Redirection Cookies</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">Required</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Required for user authentication, security validation, and short URL redirection.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Anonymous Click Telemetry</span>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">Optional</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Anonymous aggregate click counters to calculate link analytics in your user dashboard.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <Button variant="outline" size="sm" onClick={handleRejectOptional} className="text-xs">
                Save Essential Only
              </Button>
              <Button variant="default" size="sm" onClick={handleAcceptAll} className="text-xs">
                Accept &amp; Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
