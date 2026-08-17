"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Key, Copy, Check, ShieldAlert, CheckCircle2 } from "lucide-react";

interface ApiKeyModalProps {
  apiKey: string | null;
  keyName?: string;
  onClose: () => void;
}

export function ApiKeyModal({ apiKey, keyName, onClose }: ApiKeyModalProps) {
  const [copied, setCopied] = useState(false);

  if (!apiKey) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog
      open={Boolean(apiKey)}
      onOpenChange={(open) => {
        // Enforce requirement: MUST ONLY CLOSE WHEN EXPLICITLY CLICKING DONE!
        if (!open) {
          return;
        }
      }}
    >
      <DialogContent hideCloseButton className="max-w-md craft-panel border-emerald-500/30 text-zinc-100 bg-[#0c0c0e]/95 rounded-2xl font-sans">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Key className="h-4 w-4 text-emerald-400" />
            <span>API TOKEN CREATED</span>
          </div>
          <DialogTitle className="text-xl text-white font-bold tracking-tight">Secret Access Token</DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Secret API key generated for <strong className="text-white font-medium">{keyName || "your application"}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Security Alert Warning */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200 font-mono">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Save this API key immediately!</strong> For security reasons, this key will never be displayed again.
            </p>
          </div>

          {/* Key Display Container */}
          <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Secret Token</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">One-Time View</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#050507] p-3">
              <code className="text-xs font-mono font-bold text-emerald-400 break-all select-all">
                {apiKey}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                className="text-xs shrink-0 w-full sm:w-auto bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-zinc-950" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 sm:justify-end">
          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold gap-1.5 w-full sm:w-auto bg-white text-zinc-950 hover:bg-zinc-200 px-6 rounded-xl"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Done</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

