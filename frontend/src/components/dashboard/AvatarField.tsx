"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { fileToAvatarDataUrl } from "@/lib/image";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function initials(name: string, username: string): string {
  const src = (name || username).trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase() || "?";
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  displayName: string;
  username: string;
}

export function AvatarField({ value, onChange, displayName, username }: Props) {
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const hasImage = !!value && (value.startsWith("data:image") || /^https?:\/\//i.test(value));
  const urlValue = value.startsWith("data:") ? "" : value;

  const ingest = async (file: Blob | null | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await fileToAvatarDataUrl(file));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't use that image", "error");
    } finally {
      setBusy(false);
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const image = Array.from(e.clipboardData.items).find((i) => i.type.startsWith("image/"));
    if (image) {
      e.preventDefault();
      ingest(image.getAsFile());
    }
  };

  return (
    <div className="space-y-1.5" onPaste={onPaste}>
      <span className="text-sm font-medium text-ink">Avatar</span>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            ingest(e.dataTransfer.files?.[0]);
          }}
          aria-label="Upload an avatar"
          className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-raised text-lg font-medium text-faint transition-colors ${
            dragging ? "border-ink border-dashed" : "border-[var(--color-control-border)] hover:border-ink"
          }`}
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(displayName, username)
          )}
        </button>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            {value && (
              <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => onChange("")}>
                <X className="h-4 w-4" />
                Remove
              </Button>
            )}
          </div>
          <Input
            value={urlValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image URL"
            inputMode="url"
          />
          <p className="text-sm text-faint">
            Upload, drag one in, or paste an image straight from your clipboard. A square works best.
          </p>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          ingest(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
