"use client";

import { useState } from "react";
import { saveMyProfile, type OwnerProfile } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const THEMES = ["minimal", "midnight", "paper", "sunset"];

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
  const [saving, setSaving] = useState(false);

  const dirty =
    username !== profile.username ||
    displayName !== profile.displayName ||
    bio !== profile.bio ||
    avatarUrl !== profile.avatarUrl ||
    theme !== profile.theme;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await saveMyProfile({ username, displayName, bio, avatarUrl, theme });
    setSaving(false);
    if (res.error || !res.profile) {
      showToast(res.error || "Failed to save profile", "error");
      return;
    }
    onSaved(res.profile);
    showToast("Profile saved", "success");
  };

  return (
    <form onSubmit={handleSave} className="minimal-card p-5 sm:p-6 space-y-4">
      <h2 className="text-sm font-bold text-white">Profile</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs">
          <span className="font-semibold uppercase tracking-wider text-zinc-400">Username</span>
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900/80 px-2.5">
            <span className="text-xs text-zinc-500">wsio.lol/</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="h-9 flex-1 bg-transparent text-xs text-white outline-none"
              minLength={2}
              maxLength={32}
              pattern="[a-z0-9_-]+"
              required
            />
          </div>
        </label>

        <label className="space-y-1.5 text-xs">
          <span className="font-semibold uppercase tracking-wider text-zinc-400">Display name</span>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="minimal-input h-9 text-xs"
            maxLength={80}
          />
        </label>
      </div>

      <label className="block space-y-1.5 text-xs">
        <span className="font-semibold uppercase tracking-wider text-zinc-400">Bio</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={2}
          maxLength={500}
          className="minimal-input w-full rounded-lg px-3 py-2 text-xs text-white"
        />
      </label>

      <label className="block space-y-1.5 text-xs">
        <span className="font-semibold uppercase tracking-wider text-zinc-400">Avatar URL</span>
        <Input
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
          className="minimal-input h-9 text-xs"
        />
      </label>

      <div className="space-y-1.5 text-xs">
        <span className="font-semibold uppercase tracking-wider text-zinc-400">Theme</span>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={`rounded-lg border px-3 py-1.5 text-xs capitalize transition-colors ${
                theme === t
                  ? "border-white/40 bg-white/10 text-white"
                  : "border-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={saving || !dirty} className="h-9 text-xs">
          {saving ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
