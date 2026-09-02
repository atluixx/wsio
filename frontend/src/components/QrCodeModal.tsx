"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { X, Download, Copy, Check, Share2 } from "lucide-react";

interface QrCodeModalProps {
  url: string;
  code: string;
  onClose: () => void;
}

export function QrCodeModal({ url, code, onClose }: QrCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [dataUrl, setDataUrl] = useState<string>("");
  const canShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 320,
      margin: 1,
      color: { dark: "#17150f", light: "#ffffff" },
    })
      .then(setDataUrl)
      .catch((err) => console.error("QR generation error:", err));
  }, [url]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: code, url });
    } catch {
      /* user dismissed */
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(23,21,15,0.45)] p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-[var(--radius-lg)] border border-line bg-surface p-7 text-center shadow-[0_24px_60px_rgba(23,21,15,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="icon-btn absolute right-3 top-3"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="font-display text-lg font-semibold tracking-tight">Share this page</h3>
        <p className="mx-auto mt-1 max-w-[16rem] truncate text-sm text-faint">
          {url.replace(/^https?:\/\//, "")}
        </p>

        <div className="mx-auto mt-5 flex h-56 w-56 items-center justify-center rounded-[var(--radius-md)] border border-line bg-white p-3">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl}
              alt={`QR code for ${code}`}
              className="h-full w-full object-contain"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="text-sm text-faint">Generating…</span>
          )}
        </div>

        <div className="mt-5 grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={copyUrl}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-control-border)] px-4 text-sm font-medium text-ink transition-colors hover:bg-raised"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-[var(--color-positive)]" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy link
                </>
              )}
            </button>
            {dataUrl ? (
              <a
                href={dataUrl}
                download={`wsio-${code}.png`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-control-border)] px-4 text-sm font-medium text-ink transition-colors hover:bg-raised"
              >
                <Download className="h-4 w-4" />
                Save QR
              </a>
            ) : (
              <span className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-line px-4 text-sm text-muted opacity-60">
                <Download className="h-4 w-4" />
                Save QR
              </span>
            )}
          </div>
          {canShare && (
            <button
              onClick={share}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-ink px-4 text-sm font-medium text-canvas transition-colors hover:bg-[#322d20]"
            >
              <Share2 className="h-4 w-4" />
              Share…
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
