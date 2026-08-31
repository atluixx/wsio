"use client";

import { useState } from "react";
import { saveMyProfile, type OwnerProfile } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music2 } from "lucide-react";

const THEMES = ["minimal", "midnight", "paper", "sunset"];
const labelClass = "text-sm font-medium text-ink";
const hintClass = "text-sm text-muted";

interface Props {
  profile: OwnerProfile;
  onSaved: (profile: OwnerProfile) => void;
}

export function ProfileEditor({ profile, onSaved }: Props) {
  const { showToast } = useToast();
  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [theme, setTheme] = useState(profile.theme || "minimal");
  const [musicUrl, setMusicUrl] = useState(profile.musicUrl || "");
  const [discordUserId, setDiscordUserId] = useState(profile.discordUserId || "");
  const [useDiscordAvatar, setUseDiscordAvatar] = useState(profile.useDiscordAvatar);
  const [saving, setSaving] = useState(false);

  const dirty =
    username !== profile.username ||
    displayName !== profile.displayName ||
    bio !== profile.bio ||
    avatarUrl !== profile.avatarUrl ||
    theme !== profile.theme ||
    musicUrl !== (profile.musicUrl || "") ||
    discordUserId !== (profile.discordUserId || "") ||
    useDiscordAvatar !== profile.useDiscordAvatar;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await saveMyProfile({
      username,
      displayName,
      bio,
      avatarUrl,
      theme,
      musicUrl,
      discordUserId,
      useDiscordAvatar,
    });
    setSaving(false);
    if (res.error || !res.profile) {
      showToast(res.error || "Couldn't save your profile", "error");
      return;
    }
    onSaved(res.profile);
    setMusicUrl(res.profile.musicUrl || "");
    showToast("Profile saved", "success");
  };

  return (
    <form onSubmit={handleSave} className="surface-card space-y-5 p-6">
      <h2 className="font-display text-lg font-semibold tracking-tight">Profile</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className={labelClass}>Username</span>
          <div className="flex h-11 items-center gap-1 rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3">
            <span className="text-sm text-faint">wsio.lol/</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="h-full flex-1 bg-transparent text-[0.95rem] text-ink outline-none"
              minLength={2}
              maxLength={32}
              pattern="[a-z0-9_-]+"
              required
            />
          </div>
        </label>

        <label className="space-y-1.5">
          <span className={labelClass}>Display name</span>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={80} />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className={labelClass}>Bio</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3.5 py-2.5 text-[0.95rem] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-ink focus:shadow-[0_0_0_3px_rgba(23,21,15,0.06)]"
        />
      </label>

      <label className="block space-y-1.5">
        <span className={labelClass}>Avatar URL</span>
        <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" />
      </label>

      {/* Music */}
      <div className="space-y-1.5">
        <span className={labelClass}>Featured track</span>
        <Input
          value={musicUrl}
          onChange={(e) => setMusicUrl(e.target.value)}
          placeholder="YouTube / Spotify / SoundCloud link, an mp3 URL, or a song name"
          maxLength={400}
        />
        {profile.music && musicUrl === (profile.musicUrl || "") && (
          <div className="flex items-center gap-2 pt-1 text-sm text-muted">
            <Music2 className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {profile.music.title || profile.music.kind}
              <span className="text-faint"> · {profile.music.kind}</span>
            </span>
          </div>
        )}
        <p className={hintClass}>
          Visitors get a play button — nothing loads or plays until they press it.
        </p>
      </div>

      {/* Discord */}
      <div className="space-y-1.5">
        <span className={labelClass}>Discord user ID</span>
        <Input
          value={discordUserId}
          onChange={(e) => setDiscordUserId(e.target.value.replace(/[^\d]/g, ""))}
          placeholder="e.g. 190916650143318016"
          inputMode="numeric"
          maxLength={32}
        />
        <p className={hintClass}>
          Join{" "}
          <a
            href="https://discord.gg/lanyard"
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            discord.gg/lanyard
          </a>{" "}
          so your live status shows on your page.
        </p>
        <label className="flex items-center gap-2 pt-1 text-sm text-ink">
          <input
            type="checkbox"
            checked={useDiscordAvatar}
            onChange={(e) => setUseDiscordAvatar(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          Use my Discord avatar
        </label>
      </div>

      <div className="space-y-2">
        <span className={labelClass}>Theme</span>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={`rounded-[var(--radius-pill)] border px-4 py-1.5 text-sm capitalize transition-colors ${
                theme === t
                  ? "border-ink bg-ink text-canvas"
                  : "border-line-strong text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={saving || !dirty}>
          {saving ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
