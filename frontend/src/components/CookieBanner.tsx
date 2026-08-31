"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const COOKIE_CONSENT_KEY = "wsio_cookie_consent_choice";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (!localStorage.getItem(COOKIE_CONSENT_KEY)) setShow(true);
      } catch {
        /* storage blocked — skip the banner */
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const choose = (analytics: boolean) => {
    try {
      localStorage.setItem(
        COOKIE_CONSENT_KEY,
        JSON.stringify({ analytics, essential: true, date: new Date().toISOString() })
      );
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="pointer-events-auto mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-[var(--radius-md)] border border-line-strong bg-surface p-5 shadow-[0_12px_40px_rgba(23,21,15,0.14)] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-muted">
          One essential cookie keeps you signed in. Page views and link clicks are
          counted first-party — no third-party trackers.{" "}
          <Link href="/privacy" className="font-medium text-accent hover:underline">
            Privacy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => choose(false)}>
            Essential only
          </Button>
          <Button size="sm" onClick={() => choose(true)}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
