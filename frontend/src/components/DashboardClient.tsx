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
import { ProfileEditor, type ProfileDraft } from "@/components/dashboard/ProfileEditor";
import { LinkManager } from "@/components/dashboard/LinkManager";
import { ProfilePreview } from "@/components/dashboard/ProfilePreview";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink, ChevronDown } from "lucide-react";

const APP_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL ||
  (typeof window !== "undefined" ? window.location.origin : "https://wsio.lol");

export function DashboardClient() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

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

  // Profile shown in the preview: saved profile with the editor's unsaved edits
  // layered on top, so the preview tracks what you type.
  const previewProfile = useMemo<OwnerProfile | null>(() => {
    if (!profile) return null;
    return draft ? { ...profile, ...draft } : profile;
  }, [profile, draft]);

  const publicUrl = previewProfile
    ? `${APP_ORIGIN.replace(/\/$/, "")}/${previewProfile.username}`
    : "";

  const clicksByLink = useMemo(() => {
    const map: Record<string, number> = {};
    analytics?.links?.forEach((l) => {
      map[l.profileLinkId] = l.totalClicks;
    });
    return map;
  }, [analytics]);

  const handleLinksChange = useCallback((links: ProfileLink[]) => {
    setProfile((p) => (p ? { ...p, links } : p));
  }, []);

  // Stable setter: only replace `draft` when a field actually changed, so a
  // no-op emit from the editor can't cascade into another render.
  const handleDraftChange = useCallback((d: ProfileDraft) => {
    setDraft((prev) =>
      prev &&
      prev.username === d.username &&
      prev.displayName === d.displayName &&
      prev.bio === d.bio &&
      prev.avatarUrl === d.avatarUrl &&
      prev.theme === d.theme &&
      prev.discordUserId === d.discordUserId &&
      prev.useDiscordAvatar === d.useDiscordAvatar
        ? prev
        : d
    );
  }, []);

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast("Page URL copied", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || loading) {
    return <div className="mx-auto max-w-3xl px-5 py-24 text-center text-sm text-faint">Loading…</div>;
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

  if (!profile || !previewProfile) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center text-sm text-faint">
        Couldn&apos;t load your profile.
      </div>
    );
  }

  const stats = [
    { label: "Page views", value: analytics?.totalViews ?? 0, sub: `${analytics?.views24h ?? 0} in the last 24h` },
    { label: "Link clicks", value: analytics?.totalClicks ?? 0, sub: "all time" },
    {
      label: "Active links",
      value: profile.links.filter((l) => l.active).length,
      sub: `${profile.links.length} total`,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <div className="flex flex-col gap-4 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Your page</h1>
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block max-w-full truncate text-sm text-muted hover:text-ink"
          >
            {publicUrl.replace(/^https?:\/\//, "")}
          </a>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" variant="outline" onClick={copyUrl}>
            {copied ? <Check className="h-4 w-4 text-[var(--color-positive)]" /> : <Copy className="h-4 w-4" />}
            Copy link
          </Button>
          <Button asChild size="sm">
            <a href={publicUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open page
            </a>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map(({ label, value, sub }) => (
          <div key={label} className="surface-card p-5">
            <div className="text-sm text-muted">{label}</div>
            <div className="mt-1.5 font-display text-3xl font-semibold tracking-tight">{value}</div>
            <div className="mt-0.5 text-sm text-faint">{sub}</div>
          </div>
        ))}
      </div>

      {/* Mobile / tablet: collapsible preview */}
      <div className="mt-8 lg:hidden">
        <button
          type="button"
          onClick={() => setPreviewOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-control-border)] bg-surface px-4 py-3 text-sm font-medium"
          aria-expanded={previewOpen}
        >
          {previewOpen ? "Hide preview" : "Show live preview"}
          <ChevronDown className={`h-4 w-4 transition-transform ${previewOpen ? "rotate-180" : ""}`} />
        </button>
        {previewOpen && (
          <div className="mt-4">
            <ProfilePreview profile={previewProfile} publicUrl={publicUrl} />
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-8">
          <ProfileEditor profile={profile} onSaved={setProfile} onDraftChange={handleDraftChange} />
          <LinkManager links={profile.links} onChange={handleLinksChange} clicksByLink={clicksByLink} />
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-24">
            <ProfilePreview profile={previewProfile} publicUrl={publicUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}
