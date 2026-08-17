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
import { Input } from "@/components/ui/input";
import { CheckCircle2, AlertCircle, Loader2, Sparkles, Building2 } from "lucide-react";

interface SubdomainRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubdomainApplied?: (subdomain: string) => void;
}

export function SubdomainRequestDialog({
  open,
  onOpenChange,
  onSubdomainApplied,
}: SubdomainRequestDialogProps) {
  const [subdomainInput, setSubdomainInput] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [useCase, setUseCase] = useState("");

  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<"idle" | "available" | "taken" | "invalid">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCheckAvailability = () => {
    const cleaned = subdomainInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!cleaned || cleaned.length < 3) {
      setAvailability("invalid");
      setErrorMessage("Subdomains must be at least 3 characters long (letters, numbers, hyphens).");
      return;
    }

    setChecking(true);
    setErrorMessage("");

    setTimeout(() => {
      setChecking(false);
      const reservedNames = ["admin", "api", "app", "www", "test", "auth", "login", "billing"];
      if (reservedNames.includes(cleaned)) {
        setAvailability("taken");
        setErrorMessage(`"${cleaned}.wsio.lol" is a reserved system domain.`);
      } else {
        setAvailability("available");
        setSubdomainInput(cleaned);
      }
    }, 500);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (availability !== "available") return;
    if (!companyName || !businessEmail) {
      setErrorMessage("Please fill in your company name and business email.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      if (onSubdomainApplied) {
        onSubdomainApplied(subdomainInput);
      }
    }, 700);
  };

  const handleReset = () => {
    setSubdomainInput("");
    setCompanyName("");
    setBusinessEmail("");
    setUseCase("");
    setAvailability("idle");
    setErrorMessage("");
    setSubmitted(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md craft-panel border-white/10 text-zinc-100 bg-[#0c0c0e]/95 rounded-2xl font-sans">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Building2 className="h-4 w-4" />
            <span>BRAND SUBDOMAIN PROVISIONING</span>
          </div>
          <DialogTitle className="text-xl text-white font-bold tracking-tight">Apply for Branded Subdomain</DialogTitle>

          <DialogDescription className="text-zinc-400 text-xs">
            Submit a formal request for a custom domain alias (e.g. <code className="text-zinc-200 font-mono">yourbrand.wsio.lol</code>).
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">Application Submitted!</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Your request for <strong className="text-white">{subdomainInput}.wsio.lol</strong> has been recorded. Updates will be sent to <strong className="text-white">{businessEmail}</strong>.
              </p>
            </div>
            <div className="pt-2">
              <Button onClick={handleReset} className="w-full text-xs bg-white text-zinc-950 font-semibold hover:bg-zinc-200">
                Done &amp; Continue
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitRequest} className="space-y-4 pt-1">
            {/* Subdomain Input & Availability Check */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300">
                Desired Subdomain Name
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="e.g. acme"
                    value={subdomainInput}
                    onChange={(e) => {
                      setSubdomainInput(e.target.value);
                      setAvailability("idle");
                    }}
                    className="pr-24 text-xs font-medium bg-zinc-900/60 border-white/10 text-white focus:border-white/30"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">
                    .wsio.lol
                  </span>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCheckAvailability}
                  disabled={checking || !subdomainInput.trim()}
                  className="text-xs whitespace-nowrap bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
                >
                  {checking ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Check"
                  )}
                </Button>
              </div>

              {/* Status Indicators */}
              {availability === "available" && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 p-2.5 rounded-xl">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span><strong>{subdomainInput}.wsio.lol</strong> is available for registration!</span>
                </div>
              )}

              {availability === "taken" && (
                <div className="flex items-center gap-1.5 text-xs text-red-300 bg-red-950/30 border border-red-500/20 p-2.5 rounded-xl">
                  <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {availability === "invalid" && (
                <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/30 border border-amber-500/20 p-2.5 rounded-xl">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Formal Details Form */}
            {availability === "available" && (
              <div className="space-y-3 pt-2 border-t border-white/10 animate-in fade-in-50 duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Company Name</label>
                    <Input
                      placeholder="Acme Corp"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="text-xs bg-zinc-900/60 border-white/10 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Business Email</label>
                    <Input
                      type="email"
                      placeholder="admin@acme.com"
                      value={businessEmail}
                      onChange={(e) => setBusinessEmail(e.target.value)}
                      className="text-xs bg-zinc-900/60 border-white/10 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Use Case Justification</label>
                  <Input
                    placeholder="Short URLs for official brand marketing campaigns"
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    className="text-xs bg-zinc-900/60 border-white/10 text-white"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={availability !== "available" || submitting}
                className="text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 gap-1.5 px-4"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-zinc-950" />
                    <span>Submit Application</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
