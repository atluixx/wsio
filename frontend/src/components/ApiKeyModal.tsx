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
          // Prevent closing via backdrop click or ESC
          return;
        }
      }}
    >
      <DialogContent hideCloseButton className="max-w-md glass-panel border-purple-500/25 text-purple-50 bg-[#0c081a]/95">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
            <Key className="h-4 w-4" />
            <span>API Key Created Successfully</span>
          </div>
          <DialogTitle className="text-xl text-white font-semibold">Secret API Access Token</DialogTitle>
          <DialogDescription className="text-purple-200/70 text-xs">
            Secret API key generated for <strong className="text-white font-medium">{keyName || "your application"}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Security Alert Warning */}
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-950/40 p-3.5 text-xs text-amber-200">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Save this API key immediately!</strong> For your security, this key will never be displayed again. Store it in a secure password manager or environment variable.
            </p>
          </div>

          {/* Key Display Container */}
          <div className="rounded-xl border border-purple-500/20 bg-purple-950/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-purple-300/80 uppercase tracking-wider">Secret Token</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-medium">One-Time View</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border border-purple-500/20 bg-[#080512] p-3">
              <code className="text-xs font-mono font-semibold text-purple-300 break-all select-all">
                {apiKey}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                className="text-xs shrink-0 w-full sm:w-auto bg-purple-900/50 hover:bg-purple-800/60 text-purple-200 border border-purple-500/30"
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
            className="text-xs font-semibold gap-1.5 w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white px-6"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Done</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
