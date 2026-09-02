"use client";

import { useCallback, useSyncExternalStore } from "react";

// Minimal shape of the bits of a Lanyard presence we render.
export interface LanyardData {
  discord_user: {
    id: string;
    username: string;
    global_name: string | null;
    avatar: string | null;
  };
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: LanyardActivity[];
  listening_to_spotify?: boolean;
  spotify?: {
    song: string;
    artist: string;
    album_art_url: string;
  } | null;
}

export interface LanyardActivity {
  type: number;
  name: string;
  state?: string;
  details?: string;
  emoji?: { name: string; id?: string; animated?: boolean };
}

type Listener = () => void;

interface Entry {
  data: LanyardData | null;
  listeners: Set<Listener>;
  socket?: WebSocket;
  heartbeat?: ReturnType<typeof setInterval>;
  closed?: boolean;
}

const REST = "https://api.lanyard.rest/v1/users/";
const WS = "wss://api.lanyard.rest/socket";
const entries = new Map<string, Entry>();

function connect(id: string, entry: Entry) {
  // Seed from REST immediately so first paint isn't blank.
  fetch(REST + id)
    .then((r) => (r.ok ? r.json() : null))
    .then((body) => {
      if (body?.success && !entry.data) {
        entry.data = body.data as LanyardData;
        emit(entry);
      }
    })
    .catch(() => {});

  let ws: WebSocket;
  try {
    ws = new WebSocket(WS);
  } catch {
    return;
  }
  entry.socket = ws;

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data as string);
    if (msg.op === 1) {
      ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: id } }));
      entry.heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ op: 3 }));
      }, msg.d.heartbeat_interval);
    } else if (msg.op === 0) {
      entry.data = msg.d as LanyardData;
      emit(entry);
    }
  };

  ws.onclose = () => {
    if (entry.heartbeat) clearInterval(entry.heartbeat);
    if (!entry.closed && entry.listeners.size > 0) {
      setTimeout(() => connect(id, entry), 4000);
    }
  };
  ws.onerror = () => ws.close();
}

function emit(entry: Entry) {
  entry.listeners.forEach((l) => l());
}

function subscribe(id: string, listener: Listener): () => void {
  let entry = entries.get(id);
  if (!entry) {
    entry = { data: null, listeners: new Set() };
    entries.set(id, entry);
    connect(id, entry);
  }
  entry.listeners.add(listener);

  return () => {
    const e = entries.get(id);
    if (!e) return;
    e.listeners.delete(listener);
    if (e.listeners.size === 0) {
      e.closed = true;
      if (e.heartbeat) clearInterval(e.heartbeat);
      e.socket?.close();
      entries.delete(id);
    }
  };
}

/** Live Discord presence for one user id, via Lanyard. `null` until it loads. */
export function useLanyard(userId: string | undefined | null): LanyardData | null {
  const sub = useCallback(
    (onChange: () => void) => {
      if (!userId) return () => {};
      return subscribe(userId, onChange);
    },
    [userId]
  );
  const snapshot = useCallback(
    () => (userId ? entries.get(userId)?.data ?? null : null),
    [userId]
  );
  return useSyncExternalStore(sub, snapshot, () => null);
}

export function discordAvatarUrl(
  user: LanyardData["discord_user"] | undefined
): string | null {
  if (!user?.avatar) return null;
  const ext = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256`;
}

export interface CustomStatus {
  /** A unicode emoji is `{ id: null, name: "🇨" }`; a server emoji has an id. */
  emoji: { id: string | null; name: string; animated: boolean } | null;
  text: string;
}

export function customStatus(data: LanyardData | null): CustomStatus | null {
  const custom = data?.activities?.find((a) => a.type === 4);
  if (!custom) return null;
  const text = custom.state ?? "";
  const e = custom.emoji;
  const emoji = e?.name
    ? { id: e.id ?? null, name: e.name, animated: !!e.animated }
    : null;
  if (!emoji && !text) return null;
  return { emoji, text };
}
