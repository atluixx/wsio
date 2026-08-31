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
      showToast(res.error || "Failed to create profile", "error");
      return;
    }
    onCreated(res.profile);
    showToast("Profile created", "success");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-20 font-sans">
      <div className="minimal-card space-y-5 p-6 sm:p-8">
        <div className="space-y-1.5">
          <h1 className="text-lg font-bold text-white">Claim your page</h1>
          <p className="text-xs text-zinc-400">
            Pick a username. Your page will live at{" "}
            <span className="font-mono text-zinc-300">wsio.lol/{username || "you"}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900/80 px-3">
            <span className="text-xs text-zinc-500">wsio.lol/</span>
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="username"
              className="h-10 flex-1 bg-transparent text-sm text-white outline-none"
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
            className="h-10 w-full rounded-lg border border-white/10 bg-zinc-900/80 px-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/30"
          />

          <Button type="submit" disabled={saving} className="h-10 w-full text-xs">
            {saving ? "Creating..." : "Create my page"}
          </Button>
        </form>

        <p className="text-[11px] text-zinc-500">
          Lowercase letters, numbers, hyphen and underscore. 2–32 characters.
        </p>
      </div>
    </div>
  );
}
