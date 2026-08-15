"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createShortLink, LinkItem } from "@/lib/api";
import {
  saveGuestLink,
  normalizeUrl,
  generateGuestHash,
  getGuestDailyUsage,
  incrementGuestDailyUsage,
  GUEST_DAILY_LIMIT,
} from "@/lib/guestLinks";
import { QrCodeModal } from "@/components/QrCodeModal";
import { SubdomainRequestDialog } from "@/components/SubdomainRequestDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Plus,
  Minus,
  Lock,
  Zap,
  BarChart3,
  ShieldCheck,
  Building2,
  QrCode,
  CheckCircle2,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdLink, setCreatedLink] = useState<LinkItem | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [customAlias, setCustomAlias] = useState("");
  const [appliedSubdomain, setAppliedSubdomain] = useState("");
  const [subdomainDialogOpen, setSubdomainDialogOpen] = useState(false);
  const [qrModalLink, setQrModalLink] = useState<{ url: string; code: string } | null>(null);
  const [guestUsage, setGuestUsage] = useState({ count: 0, date: "" });

  useEffect(() => {
    setGuestUsage(getGuestDailyUsage());
  }, []);

  const limitReached = !isAuthenticated && guestUsage.count >= GUEST_DAILY_LIMIT;

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    if (limitReached) {
      setErrorMessage("Guest limit reached (3/3 links today). Create a free account to unlock unlimited link shortening.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setCreatedLink(null);

    const formattedUrl = normalizeUrl(inputUrl);

    let code = "";
    let id = "";
    let userId: string | undefined = undefined;

    const res = await createShortLink(formattedUrl, customAlias, appliedSubdomain);
    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
      return;
    }

    if (res.code) {
      code = res.code;
      id = res.id || Math.random().toString();
      userId = res.userId || (isAuthenticated ? user?.id : undefined);
    } else {
      code = customAlias.trim() ? customAlias.trim() : generateGuestHash(formattedUrl);
      id = Math.random().toString();
      userId = isAuthenticated ? user?.id : undefined;
    }

    const newLink: LinkItem = {
      id: id,
      code: code,
      url: formattedUrl,
      subdomain: appliedSubdomain.trim(),
      userId: userId,
      createdAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setCreatedLink(newLink);
    saveGuestLink(newLink);
    
    if (!isAuthenticated) {
      incrementGuestDailyUsage();
      setGuestUsage(getGuestDailyUsage());
    }

    setInputUrl("");
    setCustomAlias("");
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
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
      q: "How fast is link redirection?",
      a: "Our global edge network processes redirections in milliseconds, ensuring your visitors reach destination pages without delay.",
    },
    {
      q: "Where can I view my links and track click analytics?",
      a: "All created links appear instantly in your personal Dashboard. Signed-in users can view total clicks, referrer origins, and link activity over time.",
    },
    {
      q: "What is the difference between a Guest session and a Signed-In account?",
      a: "Guest users can create up to 3 links per day stored locally in browser memory. Registered accounts enjoy unlimited link creation, cross-device sync, and persistent click analytics.",
    },
    {
      q: "How do custom subdomains work?",
      a: "Brands and enterprise accounts can request custom subdomains (e.g., yourbrand.wsio.lol) via our formal domain review workflow.",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-20 space-y-14 sm:space-y-20">
      {qrModalLink && (
        <QrCodeModal
          url={qrModalLink.url}
          code={qrModalLink.code}
          onClose={() => setQrModalLink(null)}
        />
      )}

      <SubdomainRequestDialog
        open={subdomainDialogOpen}
        onOpenChange={setSubdomainDialogOpen}
        onSubdomainApplied={(sub) => setAppliedSubdomain(sub)}
      />

      {/* Hero & Central Input Engine */}
      <ScrollReveal>
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <Badge variant="outline" className="gap-1.5 py-1 px-3 border-white/15 text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Simple, Fast &amp; Reliable Link Shortening</span>
          </Badge>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.12]">
            Shorten long URLs into clean, memorable links.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Create sleek short links ready to share anywhere. Built for creators, teams, and modern software products.
          </p>
        </div>

        {/* URL Shortener Form Container */}
        <Card className="mt-8 border-white/15 bg-zinc-950/90 shadow-2xl p-5 sm:p-7 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-white/10 pb-4 mb-5">
            <span className="text-zinc-400 font-medium">
              {isAuthenticated ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Signed In — Unlimited Link Generation Active
                </span>
              ) : (
                <span>Guest Daily Usage: <strong className="text-white">{guestUsage.count} / {GUEST_DAILY_LIMIT}</strong> used</span>
              )}
            </span>

            {!isAuthenticated && (
              limitReached ? (
                <Link href="/pricing" className="text-emerald-400 hover:underline font-semibold flex items-center gap-1">
                  <span>Upgrade for Unlimited Links</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="text-zinc-500">{GUEST_DAILY_LIMIT - guestUsage.count} links remaining today</span>
              )
            )}
          </div>

          <form onSubmit={handleShorten} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Link2 className="h-4.5 w-4.5" />
                </div>
                <Input
                  type="url"
                  placeholder={limitReached ? "Guest limit reached (3/3). Sign up free to create more." : "Paste long URL (e.g. https://yourcompany.com/blog/article/...)"}
                  value={inputUrl}
                  disabled={limitReached}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="pl-11 h-12 text-sm"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading || limitReached}
                className="h-12 px-7 text-sm font-semibold whitespace-nowrap w-full sm:w-auto"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : limitReached ? (
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <Lock className="h-4 w-4" />
                    <span>Limit Reached</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Shorten URL</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>

            {/* Custom Slugs & Formal Subdomain Request Trigger */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <Input
                  placeholder="Custom Alias / Slug (Optional, e.g. promo-2026)"
                  value={customAlias}
                  disabled={limitReached}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  className="text-xs h-10"
                />
              </div>

              <div className="flex items-center gap-2">
                {appliedSubdomain ? (
                  <div className="flex items-center justify-between w-full rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-300">
                    <span className="font-semibold">{appliedSubdomain}.wsio.lol</span>
                    <button
                      type="button"
                      onClick={() => setAppliedSubdomain("")}
                      className="text-zinc-400 hover:text-white underline text-[10px]"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSubdomainDialogOpen(true)}
                    className="w-full text-xs h-10 justify-between gap-2 border-white/10"
                  >
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Company Subdomain</span>
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-normal">Apply</Badge>
                  </Button>
                )}
              </div>
            </div>
          </form>

          {/* Live Preview */}
          <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 pt-4 border-t border-white/10 mt-4">
            <span>✨ Live Preview: <code className="text-zinc-200 font-mono font-medium">{getShortUrl(customAlias.trim() || "xxxxxx", appliedSubdomain)}</code></span>
            <span>Click &quot;Shorten URL&quot; to generate</span>
          </div>

          {/* Limit Warning Banner */}
          {limitReached && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-950/40 p-4 text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
                <span>You have reached the guest daily limit of 3 short links.</span>
              </div>
              <Button asChild size="sm" className="whitespace-nowrap text-xs">
                <Link href="/pricing">View Plans &amp; Upgrade</Link>
              </Button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && !limitReached && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/30 p-3.5 text-xs text-red-300">
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Output Card */}
          {createdLink && (
            <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3 animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <Sparkles className="h-4 w-4" />
                  Short Link Created!
                </span>
                <span className="text-zinc-400">{createdLink.createdAt}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-white/10 bg-zinc-950 p-3.5">
                <div className="truncate font-mono text-sm font-bold text-emerald-300">
                  {getShortUrl(createdLink.code, createdLink.subdomain)}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(getShortUrl(createdLink.code, createdLink.subdomain), createdLink.code)}
                    className="text-xs"
                  >
                    {copiedCode === createdLink.code ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-zinc-950" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQrModalLink({ url: getShortUrl(createdLink.code, createdLink.subdomain), code: createdLink.code })}
                    className="text-xs border-white/10"
                  >
                    <QrCode className="h-3.5 w-3.5 text-emerald-400" />
                    <span>QR Code</span>
                  </Button>

                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                  >
                    <a
                      href={getShortUrl(createdLink.code, createdLink.subdomain)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Test Redirection</span>
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </ScrollReveal>

      {/* Feature Highlights Grid */}
      <ScrollReveal delayMs={50}>
        <div className="space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="font-heading text-2xl sm:text-3xl text-white font-semibold">Designed for clarity &amp; performance</h2>
            <p className="text-xs sm:text-sm text-zinc-400">Everything you need to share, manage, and measure your links.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-emerald-400">
                <Zap className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Sub-millisecond Speed</CardTitle>
              <CardDescription>
                High-performance redirection engine built for fast edge execution and reliability under high load.
              </CardDescription>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-emerald-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Real-time Telemetry</CardTitle>
              <CardDescription>
                Monitor total clicks, 24-hour velocity, and referrer source breakdown from your unified dashboard.
              </CardDescription>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Privacy First</CardTitle>
              <CardDescription>
                Zero third-party tracking scripts or invasive data collection. Your link metrics remain strictly yours.
              </CardDescription>
            </Card>
          </div>
        </div>
      </ScrollReveal>

      {/* Accordion FAQ */}
      <ScrollReveal delayMs={100}>
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="font-heading text-2xl text-white font-semibold">Frequently Asked Questions</h2>
            <p className="text-xs text-zinc-400 mt-1">Everything you need to know about our link platform and features.</p>
          </div>

          <div className="divide-y divide-white/10">
            {faqItems.map((item, idx) => (
              <div key={idx} className="py-4">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between text-sm sm:text-base font-medium text-white text-left focus:outline-none cursor-pointer min-h-[44px]"
                  aria-expanded={openFaq === idx}
                >
                  <span>{item.q}</span>
                  <span className="ml-4 shrink-0 rounded-lg border border-white/10 p-1.5 text-zinc-400 hover:text-white">
                    {openFaq === idx ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                {openFaq === idx && (
                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-zinc-400 pr-8 animate-in fade-in-50 duration-150">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Primary Call-to-Action Card */}
      <ScrollReveal delayMs={150}>
        <Card className="border-white/15 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 text-center space-y-4">
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-950/30">
            Ready to get started?
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl text-white font-semibold">
            Create an account or upgrade today.
          </h2>
          <p className="mx-auto max-w-md text-xs sm:text-sm text-zinc-400">
            Unlock unlimited link shortening, custom domain applications, and real-time click telemetry.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto text-xs font-semibold">
              <Link href="/register">
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-xs border-white/10">
              <Link href="/pricing">
                <span>Explore Pricing Plans</span>
              </Link>
            </Button>
          </div>
        </Card>
      </ScrollReveal>
    </div>
  );
}
