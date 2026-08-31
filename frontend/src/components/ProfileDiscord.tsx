"use client";

import { useLanyard, customStatus } from "@/lib/lanyard";

const STATUS: Record<string, { label: string; color: string }> = {
  online: { label: "Online", color: "#23a55a" },
  idle: { label: "Idle", color: "#f0b232" },
  dnd: { label: "Do not disturb", color: "#f23f43" },
  offline: { label: "Offline", color: "#82858c" },
};

export function ProfileDiscord({ userId }: { userId: string }) {
  const data = useLanyard(userId);
  if (!data) return null;

  const status = STATUS[data.discord_status] ?? STATUS.offline;
  const custom = customStatus(data);
  const handle =
    data.discord_user.username ? `@${data.discord_user.username}` : null;

  return (
    <div
      className="mt-4 inline-flex max-w-full items-center gap-2 rounded-[var(--radius-pill)] px-3 py-1.5 text-[0.82rem]"
      style={{ background: "var(--p-card)", border: "1px solid var(--p-border)" }}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: status.color }}
        title={status.label}
      />
      {custom ? (
        <span className="truncate" style={{ color: "var(--p-fg)" }}>
          {custom.emoji ? `${custom.emoji} ` : ""}
          {custom.text || status.label}
        </span>
      ) : (
        <span className="truncate" style={{ color: "var(--p-muted)" }}>
          {status.label}
          {handle ? ` · ${handle}` : ""}
        </span>
      )}
    </div>
  );
}
