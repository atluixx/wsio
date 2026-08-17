"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { X, Download, Copy, Check, QrCode } from "lucide-react";

interface QrCodeModalProps {
  url: string;
  code: string;
  onClose: () => void;
}

export function QrCodeModal({ url, code, onClose }: QrCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((data) => setDataUrl(data))
      .catch((err) => console.error("Local QR generation error:", err));
  }, [url]);

  const copyImage = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in-50 duration-200">
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-6 space-y-5 shadow-2xl font-mono text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg border border-white/10 bg-zinc-900 p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <QrCode className="h-4 w-4" />
            <span>Vector QR Code</span>
          </div>
          <h3 className="font-serif text-xl text-white">Scan &amp; Share Hash</h3>
          <p className="text-[11px] text-zinc-400 truncate max-w-[260px] mx-auto">{url}</p>
        </div>

        {/* QR Code Container */}
        <div className="mx-auto flex h-60 w-60 items-center justify-center rounded-2xl border-4 border-white bg-white p-3 shadow-xl">
          {dataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={dataUrl}
              alt={`Local QR Code redirecting to short link ${code} (${url})`}
              className="h-full w-full object-contain"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-zinc-400 animate-pulse">
              Generating QR...
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {dataUrl ? (
            <a
              href={dataUrl}
              download={`wsio-qr-${code}.png`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
            >
              <Download className="h-4 w-4" />
              <span>Download PNG</span>
            </a>
          ) : (
            <div className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-500 cursor-not-allowed">
              <Download className="h-4 w-4" />
              <span>Download PNG</span>
            </div>
          )}

          <button
            onClick={copyImage}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy URL</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
