"use client";

import { useState } from "react";
import { saveMyProfile, type OwnerProfile } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";

interface Props {
  onCreated: (profile: OwnerProfile) => void;
}

export function ProfileOnboarding({ onCreated }: Props) {
  const { showToast } = useToast();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setSaving(true);
    const res = await saveMyProfile({
      username: username.trim(),
      displayName: displayName.trim(),
      bio: "",
      avatarUrl: "",
      theme: "minimal",
    });
    setSaving(false);
    if (res.error || !res.profile) {
      showToast(res.error || "Couldn't create your page", "error");
      return;
    }
    onCreated(res.profile);
    showToast("Page created", "success");
  };

  return (
    <div className="mx-auto max-w-[26rem] px-5 py-20 sm:py-28">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Claim your page</h1>
      <p className="mt-2 text-sm text-muted">
        Pick a username. Your page will live at{" "}
        <span className="text-ink">wsio.lol/{username || "you"}</span>.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <div className="flex h-12 items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-surface px-3.5 focus-within:border-ink focus-within:shadow-[0_0_0_3px_rgba(23,21,15,0.06)]">
          <span className="text-sm text-faint">wsio.lol/</span>
          <input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="username"
            className="h-full flex-1 bg-transparent text-[0.95rem] text-ink outline-none focus-visible:outline-none placeholder:text-faint"
            minLength={2}
            maxLength={32}
            pattern="[a-z0-9_-]+"
            required
          />
        </div>

        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display name (optional)"
          maxLength={80}
          className="h-12 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-surface px-3.5 text-[0.95rem] text-ink outline-none placeholder:text-faint focus:border-ink focus:shadow-[0_0_0_3px_rgba(23,21,15,0.06)]"
        />

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Creating…" : "Create my page"}
        </Button>
      </form>

      <p className="mt-4 text-sm text-faint">
        Lowercase letters, numbers, hyphen and underscore. 2–32 characters.
      </p>
    </div>
  );
}
