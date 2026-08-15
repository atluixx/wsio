"use client";

import { useState } from "react";
import { X, Download, Copy, Check, QrCode } from "lucide-react";

interface QrCodeModalProps {
  url: string;
  code: string;
  onClose: () => void;
}

export function QrCodeModal({ url, code, onClose }: QrCodeModalProps) {
  const [copied, setCopied] = useState(false);

  // SVG QR Code generator (Standard 21x21 matrix encoding for URLs)
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}&color=000000&bcolor=ffffff`;

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrSvgUrl}
            alt={`QR Code for ${code}`}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <a
            href={qrSvgUrl}
            download={`wsio-qr-${code}.png`}
            target="_blank"
            rel="noreferrer"
            className="btn-minimal-primary text-xs min-h-[40px] justify-center"
          >
            <Download className="h-4 w-4" />
            <span>Download PNG</span>
          </a>

          <button
            onClick={copyImage}
            className="btn-minimal-secondary text-xs min-h-[40px] justify-center cursor-pointer"
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
