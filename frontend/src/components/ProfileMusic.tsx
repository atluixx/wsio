"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, Loader2, Music2 } from "lucide-react";
import type { ProfileMusic as Music } from "@/lib/api";
import { loadScript } from "@/lib/loadScript";

/* ------------------------------------------------------------------ *
 * Minimal typings for the three embed SDKs we drive from a hidden
 * player, so a single visible button controls playback.
 * ------------------------------------------------------------------ */
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
}
interface SpotifyController {
  play(): void;
  pause(): void;
  addListener(e: "playback_update", cb: (d: { data: { isPaused: boolean } }) => void): void;
}
interface SCWidget {
  play(): void;
  pause(): void;
  bind(event: string, cb: () => void): void;
}
declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement,
        opts: {
          videoId: string;
          playerVars?: Record<string, number>;
          events?: {
            onReady?: () => void;
            onStateChange?: (e: { data: number }) => void;
          };
        }
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
    onSpotifyIframeApiReady?: (api: {
      createController: (
        el: HTMLElement,
        opts: { uri: string; width?: string | number; height?: string | number },
        cb: (c: SpotifyController) => void
      ) => void;
    }) => void;
    SC?: {
      Widget: {
        (el: HTMLIFrameElement | string): SCWidget;
        Events: { READY: string; PLAY: string; PAUSE: string; FINISH: string };
      };
    };
  }
}

const KIND_LABEL: Record<string, string> = {
  youtube: "YouTube",
  spotify: "Spotify",
  soundcloud: "SoundCloud",
  audio: "Preview",
};

function youTubeId(url: string): string | null {
  const m =
    url.match(/[?&]v=([\w-]{11})/) ||
    url.match(/youtu\.be\/([\w-]{11})/) ||
    url.match(/\/shorts\/([\w-]{11})/) ||
    url.match(/\/embed\/([\w-]{11})/);
  return m ? m[1] : null;
}

function spotifyUri(url: string): string | null {
  const m = url.match(/open\.spotify\.com\/(?:intl-\w+\/)?(track|episode|playlist|album)\/([\w]+)/);
  return m ? `spotify:${m[1]}:${m[2]}` : null;
}

export function ProfileMusic({ music }: { music: Music }) {
  const [ready, setReady] = useState(music.kind === "audio");
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);

  const hostRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const yt = useRef<YTPlayer | null>(null);
  const spotify = useRef<SpotifyController | null>(null);
  const sc = useRef<SCWidget | null>(null);

  const title = music.title || "Featured track";
  const src = music.sourceUrl || music.streamUrl || "";

  /* Lazily wire up the hidden embed player on first play. */
  const ensurePlayer = useCallback(async (): Promise<void> => {
    if (ready || !hostRef.current) return;
    const host = hostRef.current;

    if (music.kind === "youtube") {
      const id = youTubeId(src);
      if (!id) return;
      await loadScript("https://www.youtube.com/iframe_api");
      await new Promise<void>((resolve) => {
        const make = () => {
          const mount = document.createElement("div");
          host.appendChild(mount);
          yt.current = new window.YT!.Player(mount, {
            videoId: id,
            playerVars: { playsinline: 1 },
            events: {
              onReady: () => resolve(),
              onStateChange: (e) => {
                if (e.data === 1) setPlaying(true);
                else if (e.data === 2 || e.data === 0) setPlaying(false);
              },
            },
          });
        };
        if (window.YT?.Player) make();
        else window.onYouTubeIframeAPIReady = make;
      });
    } else if (music.kind === "spotify") {
      const uri = spotifyUri(src);
      if (!uri) return;
      await loadScript("https://open.spotify.com/embed/iframe-api/v1");
      await new Promise<void>((resolve) => {
        const init = (api: Parameters<NonNullable<Window["onSpotifyIframeApiReady"]>>[0]) => {
          const mount = document.createElement("div");
          host.appendChild(mount);
          api.createController(mount, { uri, width: "100%", height: 80 }, (c) => {
            spotify.current = c;
            c.addListener("playback_update", (d) => setPlaying(!d.data.isPaused));
            resolve();
          });
        };
        // The SDK calls this global once loaded.
        window.onSpotifyIframeApiReady = init;
      });
    } else if (music.kind === "soundcloud") {
      await loadScript("https://w.soundcloud.com/player/api.js");
      const frame = document.createElement("iframe");
      frame.allow = "autoplay";
      frame.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
        src
      )}&visual=false&hide_related=true&show_comments=false&show_user=false`;
      frame.style.width = "100%";
      frame.style.height = "80px";
      host.appendChild(frame);
      await new Promise<void>((resolve) => {
        const widget = window.SC!.Widget(frame);
        widget.bind(window.SC!.Widget.Events.READY, () => {
          sc.current = widget;
          widget.bind(window.SC!.Widget.Events.PLAY, () => setPlaying(true));
          widget.bind(window.SC!.Widget.Events.PAUSE, () => setPlaying(false));
          widget.bind(window.SC!.Widget.Events.FINISH, () => setPlaying(false));
          resolve();
        });
      });
    }
    setReady(true);
  }, [music.kind, ready, src]);

  const toggle = useCallback(async () => {
    if (playing) {
      audioRef.current?.pause();
      yt.current?.pauseVideo();
      spotify.current?.pause();
      sc.current?.pause();
      setPlaying(false);
      return;
    }
    if (!ready) {
      setLoading(true);
      try {
        await ensurePlayer();
      } finally {
        setLoading(false);
      }
    }
    audioRef.current?.play().catch(() => {});
    yt.current?.playVideo();
    spotify.current?.play();
    sc.current?.play();
    if (music.kind !== "audio") setPlaying(true);
  }, [playing, ready, ensurePlayer, music.kind]);

  useEffect(() => {
    const audioEl = audioRef.current;
    const ytEl = yt;
    const spEl = spotify;
    const scEl = sc;
    return () => {
      audioEl?.pause();
      ytEl.current?.pauseVideo();
      spEl.current?.pause();
      scEl.current?.pause();
    };
  }, []);

  return (
    <div
      className="mt-8 flex w-full items-center gap-3 rounded-[var(--p-radius)] px-3 py-3"
      style={{
        background: "var(--p-card)",
        border: "1px solid var(--p-border)",
        boxShadow: "var(--p-shadow)",
      }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[calc(var(--p-radius)-6px)]"
        style={{ background: "var(--p-card-hover)" }}
      >
        {music.artworkUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={music.artworkUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <Music2 className="h-5 w-5" style={{ color: "var(--p-muted)" }} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[0.9rem] font-medium">{title}</div>
        <div className="text-[0.72rem] uppercase tracking-[0.1em]" style={{ color: "var(--p-muted)" }}>
          {playing ? "Now playing" : KIND_LABEL[music.kind] ?? "Track"}
        </div>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95"
        style={{ background: "var(--p-fg)", color: "var(--p-bg)" }}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : playing ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="ml-0.5 h-4 w-4" />
        )}
      </button>

      {music.kind === "audio" && music.streamUrl && (
        <audio
          ref={audioRef}
          src={music.streamUrl}
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      )}

      {/* Hidden embed host — off-screen but present, so the SDK can run. */}
      <div
        ref={hostRef}
        aria-hidden
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: "320px",
          height: "80px",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
