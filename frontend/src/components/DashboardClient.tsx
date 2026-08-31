"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import {
  fetchMyProfile,
  fetchProfileAnalytics,
  type OwnerProfile,
  type ProfileAnalytics,
  type ProfileLink,
} from "@/lib/api";
import { ProfileOnboarding } from "@/components/dashboard/ProfileOnboarding";
import { ProfileEditor } from "@/components/dashboard/ProfileEditor";
import { LinkManager } from "@/components/dashboard/LinkManager";
import { QrCodeModal } from "@/components/QrCodeModal";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, QrCode, Eye, MousePointerClick, TrendingUp } from "lucide-react";

const APP_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "https://wsio.lol");

export function DashboardClient() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login");
  }, [authLoading, isAuthenticated, router]);

  const loadAnalytics = useCallback(async () => {
    setAnalytics(await fetchProfileAnalytics());
  }, []);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let cancelled = false;
    (async () => {
      const res = await fetchMyProfile();
      if (cancelled) return;
      if (res.missing) {
        setNeedsProfile(true);
      } else if (res.profile) {
        setProfile(res.profile);
        loadAnalytics();
      } else if (res.error) {
        showToast(res.error, "error");
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, loadAnalytics, showToast]);

  const publicUrl = profile ? `${APP_ORIGIN.replace(/\/$/, "")}/${profile.username}` : "";

  const clicksByLink = useMemo(() => {
    const map: Record<string, number> = {};
    analytics?.links.forEach((l) => {
      map[l.profileLinkId] = l.totalClicks;
    });
    return map;
  }, [analytics]);

  const handleLinksChange = (links: ProfileLink[]) => {
    setProfile((p) => (p ? { ...p, links } : p));
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast("Page URL copied", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-zinc-500">Loading…</div>
    );
  }

  if (needsProfile && !profile) {
    return (
      <ProfileOnboarding
        onCreated={(p) => {
          setProfile(p);
          setNeedsProfile(false);
          loadAnalytics();
        }}
      />
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-zinc-500">
        Could not load your profile.
      </div>
    );
  }

  const stats = [
    { label: "Page views", value: analytics?.totalViews ?? 0, sub: `${analytics?.views24h ?? 0} in 24h`, Icon: Eye },
    { label: "Link clicks", value: analytics?.totalClicks ?? 0, sub: "all time", Icon: MousePointerClick },
    {
      label: "Active links",
      value: profile.links.filter((l) => l.active).length,
      sub: `${profile.links.length} total`,
      Icon: TrendingUp,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 font-sans sm:py-12">
      {showQr && <QrCodeModal url={publicUrl} code={profile.username} onClose={() => setShowQr(false)} />}

      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-white">Your page</h1>
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-zinc-400 hover:text-white"
          >
            {publicUrl.replace(/^https?:\/\//, "")}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-9 text-xs" onClick={copyUrl}>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            Copy
          </Button>
          <Button size="sm" variant="outline" className="h-9 text-xs" onClick={() => setShowQr(true)}>
            <QrCode className="h-3.5 w-3.5" />
            QR
          </Button>
          <Button asChild size="sm" className="h-9 text-xs">
            <a href={publicUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              View
            </a>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map(({ label, value, sub, Icon }) => (
          <div key={label} className="minimal-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{label}</span>
              <Icon className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="mt-1 text-2xl font-bold text-white">{value}</div>
            <div className="text-[11px] text-zinc-500">{sub}</div>
          </div>
        ))}
      </div>

      <ProfileEditor profile={profile} onSaved={(p) => setProfile(p)} />

      <LinkManager links={profile.links} onChange={handleLinksChange} clicksByLink={clicksByLink} />
    </div>
  );
}
