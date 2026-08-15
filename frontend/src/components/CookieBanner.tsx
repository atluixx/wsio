"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "wsio_cookie_consent_choice";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 600);
      return () => clearTimeout(timer);
    }
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/25 bg-purple-950/40 text-purple-300">
              <Cookie className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-white">Privacy &amp; Cookie Preferences</h4>
                <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-300 border border-purple-500/20">
                  LGPD &amp; GDPR Compliant
                </span>
              </div>
              <p className="text-xs text-purple-200/70 leading-relaxed max-w-2xl">
                We use essential session cookies to handle authentication and secure link redirection. We respect your privacy and never sell data. Read our{" "}
                <Link href="/privacy" className="text-purple-300 underline underline-offset-4 hover:text-white font-medium">
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
              className="text-xs border-purple-500/30 bg-purple-950/30 text-purple-200 hover:bg-purple-900/40 hover:text-white"
            >
              Reject Non-Essential
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleAccept}
              className="text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white px-4"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
