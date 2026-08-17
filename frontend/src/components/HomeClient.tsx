"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createShortLink, LinkItem } from "@/lib/api";
import {
  normalizeUrl,
  getGuestDailyUsage,
  incrementGuestDailyUsage,
  GUEST_DAILY_LIMIT,
} from "@/lib/guestLinks";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  ShieldAlert,
  Plus,
  Minus,
  Lock,
  Zap,
  BarChart3,
  ShieldCheck,
  Building2,
  QrCode,
  Globe,
  Terminal,
  Layers,
  Sparkles,
  MousePointerClick,
  Code2,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

const QrCodeModal = dynamic(
  () => import("@/components/QrCodeModal").then((m) => m.QrCodeModal),
  { ssr: false }
);

const SubdomainRequestDialog = dynamic(
  () => import("@/components/SubdomainRequestDialog").then((m) => m.SubdomainRequestDialog),
  { ssr: false }
);

export function HomeClient() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setErrorMessage] = useState("");
  const [createdLink, setCreatedLink] = useState<LinkItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [customAlias, setCustomAlias] = useState("");
  const [appliedSubdomain, setAppliedSubdomain] = useState("");
  const [subdomainDialogOpen, setSubdomainDialogOpen] = useState(false);
  const [qrModalLink, setQrModalLink] = useState<{ url: string; code: string } | null>(null);
  const [guestUsage, setGuestUsage] = useState({ count: 0, date: "" });
  const [activeDemoTab, setActiveDemoTab] = useState<"telemetry" | "subdomains" | "api">("telemetry");

  useEffect(() => {
    setGuestUsage(getGuestDailyUsage());
  }, []);

  const limitReached = !isAuthenticated && guestUsage.count >= GUEST_DAILY_LIMIT;

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    if (customAlias.trim() && !isAuthenticated) {
      showToast("Custom URL slugs require a free account.", "error");
      return;
    }

    if (limitReached) {
      showToast("Daily guest link limit reached. Sign up for free to unlock unlimited links.", "error");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setCreatedLink(null);

    const formattedUrl = normalizeUrl(inputUrl);
    const res = await createShortLink(formattedUrl, customAlias, appliedSubdomain);
    setLoading(false);

    if (res.error) {
      showToast(res.error, "error");
      setErrorMessage(res.error);
      return;
    }

    if (res.code) {
      const newLink: LinkItem = {
        id: res.id || Math.random().toString(),
        code: res.code,
        url: formattedUrl,
        subdomain: appliedSubdomain.trim(),
        userId: res.userId || (isAuthenticated ? user?.id : undefined),
        createdAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setCreatedLink(newLink);
      showToast("Short link created successfully!", "success");

      if (!isAuthenticated) {
        incrementGuestDailyUsage();
        setGuestUsage(getGuestDailyUsage());
      }

      setInputUrl("");
      setCustomAlias("");
    }
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    showToast("Link copied to clipboard!", "success");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getShortUrl = (code: string, sub?: string) => {
    if (sub && sub.trim()) {
      return `https://${sub.trim()}.wsio.lol/l/${code}`;
    }
    return `https://wsio.lol/l/${code}`;
  };

  const faqItems = [
    {
      q: "How fast is link redirection on wsio.?",
      a: "Our multi-region global edge infrastructure redirects requests in sub-10 milliseconds using optimized cache routing and zero third-party lookup overhead.",
    },
    {
      q: "Where can I monitor detailed click analytics?",
      a: "Registered users have access to real-time telemetry dashboards showing click velocity, top HTTP referrers, geographic origin breakdown, and device distribution.",
    },
    {
      q: "What limits apply to guest users?",
      a: "Guest visitors can shorten up to 3 links per day. Creating a free account instantly unlocks unlimited links, persistent cloud history, custom slugs, and QR code generation.",
    },
    {
      q: "How do custom brand subdomains work?",
      a: "Enterprise & Diamond plan accounts can request custom branded subdomains (e.g. brand.wsio.lol) to reinforce trust and brand recognition across all social channels.",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20 space-y-16 font-sans">
      {qrModalLink && (
        <QrCodeModal
          url={qrModalLink.url}
          code={qrModalLink.code}
          onClose={() => setQrModalLink(null)}
        />
      )}

      {subdomainDialogOpen && (
        <SubdomainRequestDialog
          open={subdomainDialogOpen}
          onOpenChange={setSubdomainDialogOpen}
          onSubdomainApplied={(sub) => setAppliedSubdomain(sub)}
        />
      )}

      {/* Ultra-Minimal Hero Header */}
      <ScrollReveal priority>
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Shorten URLs. <br className="hidden sm:inline" /> Fast and minimal.
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Instant edge redirection, custom slugs, and real-time telemetry. Zero clutter.
          </p>
        </div>

        {/* Minimal Link Shortener Box */}
        <div className="mt-8 minimal-card p-5 sm:p-6 shadow-xl">
          {!isAuthenticated && (
            <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-white/10 pb-3 mb-4 font-mono">
              <span>Guest quota: <strong className="text-white">{guestUsage.count} / {GUEST_DAILY_LIMIT}</strong> created today</span>
              {limitReached ? (
                <Link href="/pricing" className="text-white hover:underline font-bold">
                  Upgrade
                </Link>
              ) : (
                <span>{GUEST_DAILY_LIMIT - guestUsage.count} left today</span>
              )}
            </div>
          )}

          <form onSubmit={handleShorten} className="space-y-3 font-mono">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Input
                  type="url"
                  placeholder={limitReached ? "Guest daily limit reached (3/3)." : "https://example.com/very-long-url"}
                  value={inputUrl}
                  disabled={limitReached}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="h-11 text-xs minimal-input text-white rounded-xl w-full"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading || limitReached}
                className="h-11 px-6 text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl shrink-0 font-sans"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : limitReached ? (
                  <span>Limit Reached</span>
                ) : (
                  <span>Shorten URL</span>
                )}
              </Button>
            </div>

            {/* Custom Alias Option */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-zinc-500 font-sans text-[11px]">Custom slug (optional):</span>
                <Input
                  placeholder={isAuthenticated ? "my-custom-slug" : "Requires account"}
                  value={customAlias}
                  disabled={limitReached || !isAuthenticated}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  className="h-8 text-xs minimal-input text-white rounded-lg w-44"
                />
              </div>

              {!isAuthenticated && (
                <span className="text-[11px] text-zinc-500 font-sans">
                  Free account unlocks custom slugs &amp; analytics
                </span>
              )}
            </div>
          </form>

          {/* Generated Result Card */}
          {createdLink && (
            <div className="mt-5 border-t border-white/10 pt-4 space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Link Generated:</span>
                <span>{createdLink.createdAt}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-950 p-3.5">
                <div className="truncate text-sm text-white font-bold">
                  {getShortUrl(createdLink.code, createdLink.subdomain)}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(getShortUrl(createdLink.code, createdLink.subdomain), createdLink.code)}
                    className="text-xs h-8 bg-white text-zinc-950 hover:bg-zinc-200 font-bold rounded-lg"
                  >
                    {copiedCode === createdLink.code ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-zinc-950 mr-1" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQrModalLink({ url: getShortUrl(createdLink.code, createdLink.subdomain), code: createdLink.code })}
                    className="text-xs h-8 border-white/10 text-zinc-300 hover:text-white rounded-lg"
                  >
                    <QrCode className="h-3.5 w-3.5 mr-1" />
                    <span>QR</span>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 border-white/10 text-zinc-300 hover:text-white rounded-lg"
                  >
                    <a href={getShortUrl(createdLink.code, createdLink.subdomain)} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Feature Grid (Clean Minimal Cards) */}
      <ScrollReveal delayMs={50}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="minimal-card p-5 space-y-2">
            <h3 className="text-sm font-bold text-white">Sub-10ms Latency</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Global edge network guarantees instant URL redirection without ad tracking.
            </p>
          </div>

          <div className="minimal-card p-5 space-y-2">
            <h3 className="text-sm font-bold text-white">Custom Subdomains</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Use your own branded subdomains like <code className="text-zinc-300">brand.wsio.lol</code>.
            </p>
          </div>

          <div className="minimal-card p-5 space-y-2">
            <h3 className="text-sm font-bold text-white">Live Telemetry</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Track click velocity, top referrers, and device distribution in real time.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* FAQ Accordion */}
      <ScrollReveal delayMs={100}>
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className="minimal-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-medium text-white hover:text-zinc-300"
                >
                  <span>{item.q}</span>
                  {openFaq === idx ? (
                    <Minus className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  ) : (
                    <Plus className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-white/5 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
