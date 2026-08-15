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
import { useToast } from "@/components/Toast";
import { QrCodeModal } from "@/components/QrCodeModal";
import { SubdomainRequestDialog } from "@/components/SubdomainRequestDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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
  const { showToast } = useToast();
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

    if (customAlias.trim() && !isAuthenticated) {
      showToast("Custom URLs are only available for Starter+ users.", "error");
      return;
    }

    if (limitReached) {
      showToast("Guest limit reached (3/3 links today). Create a free account to unlock unlimited link shortening.", "error");
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
      showToast("Short URL created successfully!", "success");

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
    showToast("Short link copied to clipboard!", "success");
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
          <div className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-full border border-white/10 bg-white/5 text-xs text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Simple, Fast &amp; Reliable Link Shortening</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.12]">
            Shorten long URLs into clean, memorable links.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Create sleek short links ready to share anywhere. Built for creators, teams, and modern software products.
          </p>
        </div>

        {/* URL Shortener Form Container - Glassy style */}
        <Card className="mt-8 backdrop-blur-2xl bg-zinc-950/40 border border-white/10 shadow-2xl p-5 sm:p-7 rounded-2xl">
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
                  className="pl-11 h-12 text-sm bg-zinc-900/60 border-white/10"
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
                  placeholder={
                    isAuthenticated
                      ? "Custom Alias / Slug (Starter+ Users)"
                      : "Custom Alias (Starter+ Only)"
                  }
                  value={customAlias}
                  disabled={limitReached || !isAuthenticated}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  className="text-xs h-10 bg-zinc-900/60 border-white/10"
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
                    <span className="text-[10px] text-zinc-400 font-medium">Apply</span>
                  </Button>
                )}
              </div>
            </div>
          </form>

          {/* Limit Warning Banner */}
          {limitReached && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-950/40 p-4 text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
                <span>You have reached the guest limit of 3 links today.</span>
              </div>
              <Button asChild size="sm" className="whitespace-nowrap text-xs">
                <Link href="/pricing">View Plans &amp; Upgrade</Link>
              </Button>
            </div>
          )}
        </Card>
      </ScrollReveal>

      {/* Generated Link Card */}
      {createdLink && (
        <ScrollReveal delayMs={100}>
          <Card className="backdrop-blur-2xl bg-zinc-950/40 border border-emerald-500/30 shadow-2xl p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <Sparkles className="h-4 w-4" />
                <span>Short Link Generated Successfully</span>
              </div>
              <span className="text-xs text-zinc-400">{createdLink.createdAt}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-zinc-900/60 p-4">
              <div className="truncate text-base text-white font-mono font-bold">
                {getShortUrl(createdLink.code, createdLink.subdomain)}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(getShortUrl(createdLink.code, createdLink.subdomain), createdLink.code)}
                  className="text-xs h-9 font-semibold"
                >
                  {copiedCode === createdLink.code ? (
                    <>
                      <Check className="h-4 w-4 text-zinc-950" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Short Link</span>
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQrModalLink({ url: getShortUrl(createdLink.code, createdLink.subdomain), code: createdLink.code })}
                  className="text-xs h-9 border-white/10"
                >
                  <QrCode className="h-4 w-4 text-emerald-400" />
                  <span>QR Code</span>
                </Button>

                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="text-xs h-9"
                >
                  <a
                    href={getShortUrl(createdLink.code, createdLink.subdomain)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="truncate">Destination: <span className="text-zinc-200">{createdLink.url}</span></span>
              <Link href="/dashboard" className="text-emerald-400 hover:underline shrink-0 font-medium ml-2">
                View in Dashboard &rarr;
              </Link>
            </div>
          </Card>
        </ScrollReveal>
      )}

      {/* Feature Cards Grid - Glassy style */}
      <ScrollReveal delayMs={100}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 backdrop-blur-2xl bg-zinc-950/40 border border-white/10 shadow-xl hover:border-white/20 transition-all rounded-2xl space-y-3">
            <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-emerald-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-heading text-lg text-white font-semibold">Sub-millisecond Edge Engine</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Global routing delivers fast 301/302 redirects with near-zero latency worldwide.
            </p>
          </Card>

          <Card className="p-6 backdrop-blur-2xl bg-zinc-950/40 border border-white/10 shadow-xl hover:border-white/20 transition-all rounded-2xl space-y-3">
            <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-emerald-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="font-heading text-lg text-white font-semibold">Click Telemetry Stream</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Track link activity, 24h &amp; 7d velocity, and top referrer origins in real-time.
            </p>
          </Card>

          <Card className="p-6 backdrop-blur-2xl bg-zinc-950/40 border border-white/10 shadow-xl hover:border-white/20 transition-all rounded-2xl space-y-3">
            <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-heading text-lg text-white font-semibold">Database Centralization</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              All short links and access keys are stored centrally in PostgreSQL with 99.99% edge uptime.
            </p>
          </Card>
        </div>
      </ScrollReveal>

      {/* FAQ Section */}
      <ScrollReveal delayMs={120}>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-heading text-2xl sm:text-3xl text-white font-semibold">Frequently Asked Questions</h2>
            <p className="text-xs text-zinc-400">Everything you need to know about wsio.</p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-zinc-950/40 backdrop-blur-2xl p-5 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between text-left font-semibold text-white text-sm"
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
        <Card className="backdrop-blur-2xl bg-zinc-950/40 border border-white/10 p-8 text-center space-y-4 rounded-2xl shadow-2xl">
          <span className="inline-block text-xs font-medium px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
            Ready to get started?
          </span>
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
