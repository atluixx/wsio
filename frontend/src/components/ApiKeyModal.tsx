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
import { Badge } from "@/components/ui/badge";
import { Key, Copy, Check, ShieldAlert, Lock, CheckCircle2 } from "lucide-react";

interface ApiKeyModalProps {
  apiKey: string | null;
  keyName?: string;
  onClose: () => void;
}

export function ApiKeyModal({ apiKey, keyName, onClose }: ApiKeyModalProps) {
  const [copied, setCopied] = useState(false);
  const [confirmedSaved, setConfirmedSaved] = useState(false);

  if (!apiKey) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      open={Boolean(apiKey)}
      onOpenChange={(open) => {
        // Enforce explicit button click requirement: user cannot dismiss by clicking overlay or ESC unless saved confirmed!
        if (!open && confirmedSaved) {
          onClose();
        }
      }}
    >
      <DialogContent hideCloseButton className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <Key className="h-4 w-4" />
            <span>API Key Generated</span>
          </div>
          <DialogTitle className="text-xl">Your New API Access Key</DialogTitle>
          <DialogDescription>
            This secret key grants programatic API access for <strong className="text-white">{keyName || "your application"}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Security Alert Warning */}
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-950/40 p-3.5 text-xs text-amber-200">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Save this secret key immediately!</strong> For security reasons, it will never be displayed again. If lost, you will need to generate a new key.
            </p>
          </div>

          {/* Key Display Container */}
          <div className="rounded-xl border border-white/10 bg-zinc-900/90 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Secret Token</span>
              <Badge variant="success" className="text-[10px]">One-Time View</Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border border-white/10 bg-zinc-950 p-3">
              <code className="text-xs font-mono font-bold text-emerald-300 break-all select-all">
                {apiKey}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                className="text-xs shrink-0 w-full sm:w-auto"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Key</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 sm:justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Lock className="h-3.5 w-3.5 text-zinc-500" />
            <span>Encrypted with SHA-256</span>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setConfirmedSaved(true);
              onClose();
            }}
            className="text-xs font-semibold gap-1.5 w-full sm:w-auto"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>I have saved my key</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
