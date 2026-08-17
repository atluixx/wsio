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
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20 space-y-20 sm:space-y-28 font-sans">
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
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          {/* Micro Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-mono text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PRECISION URL INFRASTRUCTURE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Shorten links with <span className="text-emerald-400 underline decoration-emerald-500/40 decoration-wavy">zero friction</span>. <br className="hidden sm:inline" />
            Analyze in real-time.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Ultra-fast edge redirection, custom branded subdomains, and developer telemetry for modern creators, engineering teams, and high-growth brands.
          </p>
        </div>

        {/* Shortener Workbench Container */}
        <div className="mt-10 craft-panel p-6 sm:p-8 rounded-2xl glow-subtle">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4 mb-6">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <span>URL Workbench</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-300">
                {isAuthenticated ? "Authenticated Session" : "Guest Mode"}
              </span>
            </div>

            <div className="text-xs font-mono">
              {isAuthenticated ? (
                <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  ● Account Active (Unlimited)
                </span>
              ) : (
                <span className="text-zinc-400">
                  Guest quota: <strong className="text-white font-mono">{guestUsage.count}/{GUEST_DAILY_LIMIT}</strong> links used today
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleShorten} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 font-mono text-xs">
                  https://
                </div>
                <Input
                  type="url"
                  placeholder={limitReached ? "Daily guest limit reached. Sign up free to unlock unlimited links." : "github.com/organization/repository-name"}
                  value={inputUrl}
                  disabled={limitReached}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="pl-20 h-13 text-sm font-mono craft-input text-white focus:border-emerald-500/60 rounded-xl"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading || limitReached}
                className="h-13 px-8 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-lg whitespace-nowrap w-full sm:w-auto rounded-xl transition-all"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : limitReached ? (
                  <span className="flex items-center gap-1.5 text-zinc-900">
                    <Lock className="h-4 w-4" />
                    <span>Quota Reached</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Shorten URL</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>

            {/* Subdomain & Custom Alias Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <Input
                  placeholder={
                    isAuthenticated
                      ? "Custom slug (e.g. launch-2026)"
                      : "Custom slug (Requires sign in)"
                  }
                  value={customAlias}
                  disabled={limitReached || !isAuthenticated}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  className="text-xs font-mono h-10 craft-input text-white rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2">
                {appliedSubdomain ? (
                  <div className="flex items-center justify-between w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-mono text-emerald-300">
                    <span>https://<strong>{appliedSubdomain}</strong>.wsio.lol</span>
                    <button
                      type="button"
                      onClick={() => setAppliedSubdomain("")}
                      className="text-zinc-400 hover:text-white underline text-[10px]"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSubdomainDialogOpen(true)}
                    className="w-full text-xs h-10 justify-between gap-2 border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg font-mono"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Attach Company Subdomain</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      Apply
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </form>

          {/* Limit Alert Box */}
          {limitReached && (
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 font-mono">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Guest limit reached (3/3). Create a free account to unlock unlimited URLs.</span>
              </div>
              <Button asChild size="sm" className="whitespace-nowrap text-xs bg-emerald-500 text-emerald-950 hover:bg-emerald-400 font-semibold rounded-lg">
                <Link href="/register">Create Free Account</Link>
              </Button>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Generated Link Result Panel */}
      {createdLink && (
        <ScrollReveal delayMs={50}>
          <div className="craft-panel p-6 rounded-2xl border-emerald-500/30 space-y-4 glow-emerald">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-xs font-mono">
              <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                <Check className="h-4 w-4" />
                <span>LINK PROVISIONED READY</span>
              </span>
              <span className="text-zinc-500">{createdLink.createdAt}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#060608] p-4">
              <div className="truncate text-lg text-white font-mono font-bold tracking-tight">
                {getShortUrl(createdLink.code, createdLink.subdomain)}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(getShortUrl(createdLink.code, createdLink.subdomain), createdLink.code)}
                  className="text-xs h-9 font-semibold bg-emerald-500 text-emerald-950 hover:bg-emerald-400 rounded-lg"
                >
                  {copiedCode === createdLink.code ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-950" />
                      <span>Copied!</span>
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
                  className="text-xs h-9 border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 rounded-lg font-mono"
                >
                  <QrCode className="h-4 w-4 text-emerald-400" />
                  <span>QR Code</span>
                </Button>

                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="text-xs h-9 bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 rounded-lg"
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

            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="truncate">Target: <span className="text-zinc-200">{createdLink.url}</span></span>
              <Link href="/dashboard" className="text-emerald-400 hover:underline shrink-0 font-semibold ml-2">
                Open Telemetry &rarr;
              </Link>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Interactive Feature Showcase Section */}
      <ScrollReveal delayMs={100}>
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">INFRASTRUCTURE HIGHLIGHTS</span>
            <h2 className="text-3xl sm:text-4xl text-white font-bold tracking-tight">Built for scale, privacy, and speed.</h2>
            <p className="text-sm text-zinc-400 max-w-lg mx-auto">
              Everything you need to deliver branded short URLs and monitor audience traffic.
            </p>
          </div>

          {/* Interactive Showcase Workspace */}
          <div className="craft-panel rounded-2xl overflow-hidden border-white/10">
            {/* Tab Controls */}
            <div className="flex border-b border-white/[0.08] bg-zinc-950/60 overflow-x-auto">
              <button
                onClick={() => setActiveDemoTab("telemetry")}
                className={`flex items-center gap-2 px-6 py-3.5 text-xs font-mono border-r border-white/[0.08] transition-colors whitespace-nowrap ${
                  activeDemoTab === "telemetry"
                    ? "bg-zinc-900 text-emerald-400 border-b-2 border-b-emerald-400 font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>01. Real-Time Telemetry</span>
              </button>

              <button
                onClick={() => setActiveDemoTab("subdomains")}
                className={`flex items-center gap-2 px-6 py-3.5 text-xs font-mono border-r border-white/[0.08] transition-colors whitespace-nowrap ${
                  activeDemoTab === "subdomains"
                    ? "bg-zinc-900 text-emerald-400 border-b-2 border-b-emerald-400 font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Globe className="h-4 w-4" />
                <span>02. Custom Brand Subdomains</span>
              </button>

              <button
                onClick={() => setActiveDemoTab("api")}
                className={`flex items-center gap-2 px-6 py-3.5 text-xs font-mono transition-colors whitespace-nowrap ${
                  activeDemoTab === "api"
                    ? "bg-zinc-900 text-emerald-400 border-b-2 border-b-emerald-400 font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Code2 className="h-4 w-4" />
                <span>03. Developer REST API</span>
              </button>
            </div>

            {/* Tab Content Display */}
            <div className="p-6 sm:p-8 bg-[#09090d]">
              {activeDemoTab === "telemetry" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white font-mono">Live Click Velocity Monitor</h3>
                      <p className="text-xs text-zinc-400">Track click streams, top referrers, and response latencies in real-time.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live Stream Active</span>
                    </div>
                  </div>

                  {/* Simulated Telemetry Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                    <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4 space-y-1">
                      <span className="text-[11px] text-zinc-400 uppercase">24-Hour Clicks</span>
                      <div className="text-2xl font-bold text-white">14,892</div>
                      <span className="text-[10px] text-emerald-400 font-semibold">+18.4% vs yesterday</span>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4 space-y-1">
                      <span className="text-[11px] text-zinc-400 uppercase">Avg Edge Latency</span>
                      <div className="text-2xl font-bold text-emerald-400">4.2ms</div>
                      <span className="text-[10px] text-zinc-400">Sub-10ms global SLA</span>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4 space-y-1">
                      <span className="text-[11px] text-zinc-400 uppercase">Top Origin Referrer</span>
                      <div className="text-2xl font-bold text-white">t.co / Twitter</div>
                      <span className="text-[10px] text-zinc-400">42% of total traffic</span>
                    </div>
                  </div>

                  {/* Simulated Visual Graph Bar Chart */}
                  <div className="rounded-xl border border-white/10 bg-zinc-950 p-5 space-y-3 font-mono">
                    <span className="text-xs text-zinc-400 block font-semibold">Click Velocity Distribution (Hourly)</span>
                    <div className="flex items-end gap-2 h-28 pt-4">
                      {[40, 65, 30, 85, 95, 60, 45, 100, 75, 80, 50, 90, 110, 70, 85, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-zinc-800 hover:bg-emerald-500 transition-colors rounded-t h-full relative group">
                          <div
                            style={{ height: `${(h / 110) * 100}%` }}
                            className="bg-emerald-500/80 group-hover:bg-emerald-400 rounded-t w-full absolute bottom-0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeDemoTab === "subdomains" && (
                <div className="space-y-6 font-mono">
                  <div className="border-b border-white/[0.06] pb-4">
                    <h3 className="text-lg font-bold text-white">Branded Custom Domain Architecture</h3>
                    <p className="text-xs text-zinc-400">Transform generic short links into authoritative brand trust signals.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5 space-y-3">
                      <span className="text-xs text-rose-400 font-bold uppercase tracking-wider block">❌ Generic Legacy Shortener</span>
                      <div className="bg-zinc-950 p-3 rounded-lg border border-white/10 text-xs text-zinc-400 truncate">
                        https://bit.ly/3x9Zq7L8a
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        Low click-through rate, flagged by spam filters, zero brand recognition.
                      </p>
                    </div>

                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-3">
                      <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">✓ Branded wsio. Domain</span>
                      <div className="bg-zinc-950 p-3 rounded-lg border border-emerald-500/30 text-xs text-emerald-300 font-bold truncate">
                        https://acme.wsio.lol/launch
                      </div>
                      <p className="text-[11px] text-emerald-400/80 leading-relaxed">
                        +34% higher CTR, instant brand verification, automated SSL edge certificate.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeDemoTab === "api" && (
                <div className="space-y-6 font-mono">
                  <div className="border-b border-white/[0.06] pb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">RESTful Developer API</h3>
                      <p className="text-xs text-zinc-400">Generate links programmatically directly from your backend microservices.</p>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      cURL / Node / Go
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#050507] p-5 space-y-3 text-xs overflow-x-auto text-zinc-300">
                    <div className="text-zinc-500">// Create short link request</div>
                    <div className="text-emerald-400 font-bold">
                      curl -X POST https://api.wsio.lol/v1/links \
                    </div>
                    <div className="pl-4 text-zinc-300">
                      -H <span className="text-amber-300">"Authorization: Bearer wsio_sec_99a8x..."</span> \
                    </div>
                    <div className="pl-4 text-zinc-300">
                      -H <span className="text-amber-300">"Content-Type: application/json"</span> \
                    </div>
                    <div className="pl-4 text-zinc-300">
                      -d <span className="text-emerald-300">'{"{"}"url": "https://github.com/organization/repo", "alias": "v2-release"{"}"}'</span>
                    </div>

                    <div className="pt-3 text-zinc-500">// JSON Response (201 Created)</div>
                    <div className="text-zinc-400 pl-2 border-l border-emerald-500/30">
                      {"{"}<br />
                      &nbsp;&nbsp;<span className="text-emerald-400">"code"</span>: <span className="text-amber-300">"v2-release"</span>,<br />
                      &nbsp;&nbsp;<span className="text-emerald-400">"shortUrl"</span>: <span className="text-amber-300">"https://wsio.lol/l/v2-release"</span>,<br />
                      &nbsp;&nbsp;<span className="text-emerald-400">"createdAt"</span>: <span className="text-amber-300">"2026-08-17T21:40:00Z"</span><br />
                      {"}"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Feature Grid Section */}
      <ScrollReveal delayMs={120}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="craft-card p-6 space-y-3 rounded-2xl">
            <div className="h-10 w-10 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-mono">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg text-white font-bold tracking-tight">Sub-10ms Global Edge SLA</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Multi-region edge routing network redirects visitors with near-zero latency globally.
            </p>
          </div>

          <div className="craft-card p-6 space-y-3 rounded-2xl">
            <div className="h-10 w-10 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-mono">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-lg text-white font-bold tracking-tight">Real-Time Telemetry</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Track link activity, click velocity, top referrers, and device distribution with zero lag.
            </p>
          </div>

          <div className="craft-card p-6 space-y-3 rounded-2xl">
            <div className="h-10 w-10 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-mono">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg text-white font-bold tracking-tight">Zero-Tracker Privacy</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Full GDPR & LGPD privacy compliance. Clean redirect loops with no invasive ad tracking cookies.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* FAQ Accordion Section */}
      <ScrollReveal delayMs={140}>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl text-white font-bold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs text-zinc-400">Everything you need to know about wsio. infrastructure.</p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl craft-card p-5 transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between text-left font-semibold text-white text-sm"
                >
                  <span>{item.q}</span>
                  <span className="ml-4 shrink-0 rounded-lg border border-white/10 p-1.5 text-zinc-400">
                    {openFaq === idx ? <Minus className="h-4 w-4 text-emerald-400" /> : <Plus className="h-4 w-4" />}
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
      <ScrollReveal delayMs={160}>
        <div className="craft-panel p-8 text-center space-y-5 rounded-2xl glow-emerald border-emerald-500/30">
          <h2 className="text-3xl sm:text-4xl text-white font-extrabold tracking-tight">
            Ready to upgrade your link stack?
          </h2>
          <p className="mx-auto max-w-md text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Create an account to unlock unlimited short link creation, custom domain applications, and developer API key access.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 px-8 h-12 rounded-xl shadow-lg">
              <Link href="/register" className="flex items-center gap-2">
                <span>Create Free Account</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-xs border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 h-12 rounded-xl">
              <Link href="/pricing">
                <span>View Plans &amp; Pricing</span>
              </Link>
            </Button>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

