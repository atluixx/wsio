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
      showToast("Short link created!", "success");

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
    showToast("Copied link to clipboard!", "success");
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
      a: "Our global edge infrastructure redirects visitors in sub-milliseconds with optimized cache routing.",
    },
    {
      q: "Where can I view link analytics?",
      a: "Registered users can monitor click activity, top referrers, and link performance in real time on their personal dashboard.",
    },
    {
      q: "What are the limits for guest users?",
      a: "Guests can create up to 3 links per day. Creating a free account unlocks unlimited link shortening and persistent history.",
    },
    {
      q: "How do custom subdomains work?",
      a: "Businesses can request custom brand subdomains (e.g. brand.wsio.lol) through our formal application process.",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-24 space-y-16 sm:space-y-24">
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

      {/* Hero Section */}
      <ScrollReveal priority>
        <div className="text-center space-y-5 max-w-2xl mx-auto">
          <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.15]">
            Transform long links into concise, powerful URLs.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Fast, reliable link management designed for creators, teams, and modern products. Learn more about our{" "}
            <Link href="/pricing" className="text-zinc-200 underline hover:text-white transition-colors">
              pricing plans
            </Link>{" "}
            or view our{" "}
            <Link href="/privacy" className="text-zinc-200 underline hover:text-white transition-colors">
              privacy model
            </Link>.
          </p>
        </div>

        {/* Shortener Container */}
        <Card className="mt-10 glass-card p-6 sm:p-8 rounded-2xl border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-white/10 pb-4 mb-6">
            <span className="text-zinc-400 font-medium">
              {isAuthenticated ? (
                <span className="text-zinc-200 font-medium">
                  Signed in — Account Active
                </span>
              ) : (
                <span>Daily guest limit: <strong className="text-white">{guestUsage.count} / {GUEST_DAILY_LIMIT}</strong> used</span>
              )}
            </span>

            {!isAuthenticated && (
              limitReached ? (
                <Link href="/register" className="text-white hover:underline font-medium flex items-center gap-1">
                  <span>Sign up for unlimited links</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="text-zinc-500">{GUEST_DAILY_LIMIT - guestUsage.count} remaining today</span>
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
                  placeholder={limitReached ? "Daily limit reached. Sign up free to continue." : "Paste long destination URL..."}
                  value={inputUrl}
                  disabled={limitReached}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="pl-11 h-12 text-sm bg-zinc-900/60 border-white/10 text-white focus:border-white/30"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading || limitReached}
                className="h-12 px-8 text-sm font-semibold bg-white hover:bg-zinc-200 text-zinc-950 shadow-sm whitespace-nowrap w-full sm:w-auto"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : limitReached ? (
                  <span className="flex items-center gap-1.5 text-zinc-600">
                    <Lock className="h-4 w-4" />
                    <span>Limit Reached</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Shorten Link</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>

            {/* Subdomain & Custom Alias Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <Input
                  placeholder={
                    isAuthenticated
                      ? "Custom slug (optional)"
                      : "Custom slug (sign in required)"
                  }
                  value={customAlias}
                  disabled={limitReached || !isAuthenticated}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  className="text-xs h-10 bg-zinc-900/60 border-white/10 text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                {appliedSubdomain ? (
                  <div className="flex items-center justify-between w-full rounded-xl border border-white/10 bg-zinc-900/80 px-3 py-2 text-xs text-zinc-200">
                    <span className="font-medium">{appliedSubdomain}.wsio.lol</span>
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
                    className="w-full text-xs h-10 justify-between gap-2 border-white/10 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    <span className="flex items-center gap-1.5 text-zinc-300">
                      <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Company Subdomain</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">Apply</span>
                  </Button>
                )}
              </div>
            </div>
          </form>

          {/* Limit Warning */}
          {limitReached && (
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-950/30 p-4 text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
                <span>You have reached today's 3-link guest limit.</span>
              </div>
              <Button asChild size="sm" className="whitespace-nowrap text-xs bg-white text-zinc-950 hover:bg-zinc-200 font-semibold">
                <Link href="/register">Create Free Account</Link>
              </Button>
            </div>
          )}
        </Card>
      </ScrollReveal>

      {/* Generated Link Result */}
      {createdLink && (
        <ScrollReveal delayMs={100}>
          <Card className="glass-panel p-6 rounded-2xl border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-zinc-300 font-medium text-xs">
                Short Link Ready
              </span>
              <span className="text-xs text-zinc-500">{createdLink.createdAt}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#050507] p-4">
              <div className="truncate text-base text-white font-mono font-semibold">
                {getShortUrl(createdLink.code, createdLink.subdomain)}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(getShortUrl(createdLink.code, createdLink.subdomain), createdLink.code)}
                  className="text-xs h-9 font-semibold bg-white text-zinc-950 hover:bg-zinc-200"
                >
                  {copiedCode === createdLink.code ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQrModalLink({ url: getShortUrl(createdLink.code, createdLink.subdomain), code: createdLink.code })}
                  className="text-xs h-9 border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800"
                >
                  <QrCode className="h-4 w-4 text-zinc-300" />
                  <span>QR Code</span>
                </Button>

                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="text-xs h-9 bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
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
              <Link href="/dashboard" className="text-white hover:underline shrink-0 font-medium ml-2">
                View in Dashboard &rarr;
              </Link>
            </div>
          </Card>
        </ScrollReveal>
      )}

      {/* Feature Section */}
      <ScrollReveal delayMs={100}>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-heading text-2xl sm:text-3xl text-white font-semibold">Powerful Link Features</h2>
            <p className="text-xs text-zinc-400">Built for speed, security, and developer analytics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card p-6 space-y-3 rounded-2xl">
              <div className="h-10 w-10 rounded-xl border border-white/10 bg-zinc-900 flex items-center justify-center text-zinc-300">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg text-white font-semibold">Sub-millisecond Edge Engine</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Global routing delivers fast redirects with near-zero latency worldwide.
              </p>
            </Card>

            <Card className="glass-card p-6 space-y-3 rounded-2xl">
              <div className="h-10 w-10 rounded-xl border border-white/10 bg-zinc-900 flex items-center justify-center text-zinc-300">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg text-white font-semibold">Click Telemetry</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Track link activity, click velocity, and top referrer origins in real-time.
              </p>
            </Card>

            <Card className="glass-card p-6 space-y-3 rounded-2xl">
              <div className="h-10 w-10 rounded-xl border border-white/10 bg-zinc-900 flex items-center justify-center text-zinc-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg text-white font-semibold">Centralized Security</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Short links and API tokens are encrypted and managed with strict access controls.
              </p>
            </Card>
          </div>
        </div>
      </ScrollReveal>

      {/* FAQ Section */}
      <ScrollReveal delayMs={120}>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-heading text-2xl sm:text-3xl text-white font-semibold">Frequently Asked Questions</h2>
            <p className="text-xs text-zinc-400">Clear answers to common questions about link shortening and analytics.</p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl glass-card p-5 transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between text-left font-semibold text-white text-sm"
                >
                  <span>{item.q}</span>
                  <span className="ml-4 shrink-0 rounded-lg border border-white/10 p-1.5 text-zinc-400">
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

      {/* CTA Section */}
      <ScrollReveal delayMs={150}>
        <Card className="glass-panel p-8 text-center space-y-4 rounded-2xl shadow-2xl border-white/10">
          <h2 className="font-heading text-3xl sm:text-4xl text-white font-semibold">
            Start managing your short links.
          </h2>
          <p className="mx-auto max-w-md text-xs sm:text-sm text-zinc-400">
            Create an account to unlock unlimited link creation, custom domain applications, and detailed analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 px-6">
              <Link href="/register">
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 ml-1.5 text-zinc-950" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-xs border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800">
              <Link href="/pricing">
                <span>View Plans</span>
              </Link>
            </Button>
          </div>
        </Card>
      </ScrollReveal>
    </div>
  );
}
