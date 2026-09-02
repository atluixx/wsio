"use client";

import { useRef, useState } from "react";
import { saveMyProfile, type OwnerProfile } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const THEMES: { key: string; bg: string; card: string; fg: string }[] = [
  { key: "minimal", bg: "#faf9f5", card: "#fffdf8", fg: "#1c1913" },
  { key: "midnight", bg: "#0e0f13", card: "#17181d", fg: "#f2f3f7" },
  { key: "paper", bg: "#f3efe6", card: "#fffdf7", fg: "#26221a" },
  { key: "sunset", bg: "#1b1016", card: "#271820", fg: "#ffece2" },
];
const labelClass = "text-sm font-medium text-ink";
const hintClass = "text-sm text-muted";

export interface ProfileDraft {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: string;
  discordUserId: string;
  useDiscordAvatar: boolean;
}

function toFields(p: OwnerProfile): ProfileDraft {
  return {
    username: p.username,
    displayName: p.displayName,
    bio: p.bio,
    avatarUrl: p.avatarUrl,
    theme: p.theme || "minimal",
    discordUserId: p.discordUserId || "",
    useDiscordAvatar: p.useDiscordAvatar,
  };
}

interface Props {
  profile: OwnerProfile;
  onSaved: (profile: OwnerProfile) => void;
  onDraftChange?: (draft: ProfileDraft) => void;
}

export function ProfileEditor({ profile, onSaved, onDraftChange }: Props) {
  const { showToast } = useToast();
  const [fields, setFields] = useState<ProfileDraft>(() => toFields(profile));
  const [saving, setSaving] = useState(false);

  // Kept in sync by `update` so we can build the next value without an effect —
  // the preview then updates in the same render as the keystroke, no cascade.
  const fieldsRef = useRef(fields);

  const update = (patch: Partial<ProfileDraft>) => {
    const next = { ...fieldsRef.current, ...patch };
    fieldsRef.current = next;
    setFields(next);
    onDraftChange?.(next);
  };

  const dirty =
    fields.username !== profile.username ||
    fields.displayName !== profile.displayName ||
    fields.bio !== profile.bio ||
    fields.avatarUrl !== profile.avatarUrl ||
    fields.theme !== profile.theme ||
    fields.discordUserId !== (profile.discordUserId || "") ||
    fields.useDiscordAvatar !== profile.useDiscordAvatar;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await saveMyProfile({
      username: fields.username,
      displayName: fields.displayName,
      bio: fields.bio,
      avatarUrl: fields.avatarUrl,
      theme: fields.theme,
      discordUserId: fields.discordUserId,
      useDiscordAvatar: fields.useDiscordAvatar,
    });
    setSaving(false);
    if (res.error || !res.profile) {
      showToast(res.error || "Couldn't save your profile", "error");
      return;
    }
    onSaved(res.profile);
    showToast("Profile saved", "success");
  };

  return (
    <form onSubmit={handleSave} autoComplete="off" className="surface-card space-y-5 p-6">
      <h2 className="font-display text-lg font-medium tracking-tight">Profile</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className={labelClass}>Username</span>
          <div className="flex h-11 items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-surface px-3 focus-within:border-ink focus-within:shadow-[0_0_0_3px_rgba(28,25,19,0.06)]">
            <span className="text-sm text-faint">wsio.lol/</span>
            <input
              value={fields.username}
              onChange={(e) => update({ username: e.target.value.toLowerCase() })}
              className="h-full flex-1 bg-transparent text-[0.95rem] text-ink outline-none focus-visible:outline-none"
              minLength={2}
              maxLength={32}
              pattern="[a-z0-9_-]+"
              required
            />
          </div>
        </label>

        <label className="space-y-1.5">
          <span className={labelClass}>Display name</span>
          <Input
            value={fields.displayName}
            onChange={(e) => update({ displayName: e.target.value })}
            maxLength={80}
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className={labelClass}>Bio</span>
        <textarea
          value={fields.bio}
          onChange={(e) => update({ bio: e.target.value })}
          rows={3}
          maxLength={500}
          className="w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-surface px-3.5 py-2.5 text-[0.95rem] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-ink focus:shadow-[0_0_0_3px_rgba(28,25,19,0.06)]"
        />
      </label>

      <label className="block space-y-1.5">
        <span className={labelClass}>Avatar URL</span>
        <Input
          value={fields.avatarUrl}
          onChange={(e) => update({ avatarUrl: e.target.value })}
          placeholder="https://…"
        />
      </label>

      {/* Discord */}
      <div className="space-y-1.5">
        <span className={labelClass}>Discord user ID</span>
        <Input
          value={fields.discordUserId}
          onChange={(e) => update({ discordUserId: e.target.value.replace(/[^\d]/g, "") })}
          placeholder="e.g. 190916650143318016"
          inputMode="numeric"
          autoComplete="off"
          name="discord-user-id"
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
            checked={fields.useDiscordAvatar}
            onChange={(e) => update({ useDiscordAvatar: e.target.checked })}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          Use my Discord avatar
        </label>
      </div>

      <div className="space-y-2">
        <span className={labelClass}>Theme</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {THEMES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => update({ theme: t.key })}
              aria-pressed={fields.theme === t.key}
              className={`flex items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-2 text-sm capitalize transition-colors ${
                fields.theme === t.key
                  ? "border-ink bg-raised text-ink"
                  : "border-[var(--color-control-border)] text-muted hover:border-ink hover:text-ink"
              }`}
            >
              <span
                className="h-5 w-5 shrink-0 rounded-full border"
                style={{
                  background: `linear-gradient(135deg, ${t.card} 0 50%, ${t.bg} 50% 100%)`,
                  borderColor: t.fg + "33",
                }}
              />
              {t.key}
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
