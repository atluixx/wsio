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
      <DialogContent hideCloseButton className="max-w-md glass-panel border-white/10 text-zinc-100 bg-[#0c0c0e]/95">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-1">
            <Key className="h-4 w-4 text-white" />
            <span>API Token Created</span>
          </div>
          <DialogTitle className="text-xl text-white font-bold">Secret Access Key</DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Secret API key generated for <strong className="text-white font-medium">{keyName || "your application"}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Security Alert Warning */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-950/30 p-3.5 text-xs text-amber-200">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Save this API key immediately!</strong> For your security, this key will never be displayed again. Store it in a secure environment variable.
            </p>
          </div>

          {/* Key Display Container */}
          <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Secret Token</span>
              <span className="text-[10px] bg-white/10 text-zinc-300 border border-white/10 px-2 py-0.5 rounded font-medium">One-Time View</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#050507] p-3">
              <code className="text-xs font-mono font-semibold text-emerald-300 break-all select-all">
                {apiKey}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                className="text-xs shrink-0 w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
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
            className="text-xs font-semibold gap-1.5 w-full sm:w-auto bg-white text-zinc-950 hover:bg-zinc-200 px-6"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Done</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
