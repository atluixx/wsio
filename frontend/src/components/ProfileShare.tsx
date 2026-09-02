"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { QrCodeModal } from "@/components/QrCodeModal";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://wsio.lol";

export function ProfileShare({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const url = `${APP_URL.replace(/\/$/, "")}/${username}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Share this page"
        className="fixed right-4 top-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-95 sm:right-6 sm:top-6"
        style={{
          background: "var(--p-card)",
          border: "1px solid var(--p-border)",
          color: "var(--p-fg)",
          boxShadow: "var(--p-shadow)",
        }}
      >
        <Share2 className="h-[18px] w-[18px]" />
      </button>

      {open && <QrCodeModal url={url} code={username} onClose={() => setOpen(false)} />}
    </>
  );
}
