"use client";

import { useEffect, useState } from "react";
import { Check, Flag, Loader2, X } from "lucide-react";
import { REPORT_REASONS, reportProfile } from "@/lib/api";

interface Props {
  username: string;
  onClose: () => void;
}

export function ReportModal({ username, onClose }: Props) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [state, setState] = useState<"form" | "sending" | "done">("form");
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    setState("sending");
    setError("");
    const res = await reportProfile(username, reason, details.trim());
    if (res.ok) {
      setState("done");
      setTimeout(onClose, 1800);
    } else {
      setState("form");
      setError(res.error || "Couldn't submit the report");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(28,25,19,0.45)] p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-[var(--radius-lg)] border border-line bg-surface p-7 shadow-[0_24px_60px_rgba(28,25,19,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="icon-btn absolute right-3 top-3" aria-label="Close">
          <X className="h-4 w-4" />
        </button>

        {state === "done" ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-positive-soft)] text-[var(--color-positive)]">
              <Check className="h-5 w-5" />
            </div>
            <h3 className="mt-3 font-display text-lg font-medium tracking-tight">Report received</h3>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
              Thanks — someone will take a look. You won&apos;t hear back, but it helps.
            </p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-muted" />
              <h3 className="font-display text-lg font-medium tracking-tight">
                Report wsio.lol/{username}
              </h3>
            </div>
            <p className="mt-1 text-sm text-muted">Tell us what&apos;s wrong with this page.</p>

            <fieldset className="mt-4 space-y-1">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] border px-3 py-2 text-sm transition-colors ${
                    reason === r.value
                      ? "border-ink bg-raised text-ink"
                      : "border-line text-muted hover:border-[var(--color-control-border)]"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="h-3.5 w-3.5 accent-[var(--color-accent)]"
                  />
                  {r.label}
                </label>
              ))}
            </fieldset>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Add anything that helps (optional)"
              className="mt-3 w-full rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-surface px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-faint focus:border-ink"
            />

            {error && <p className="mt-2 text-sm text-[var(--color-negative)]">{error}</p>}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 items-center rounded-[var(--radius-sm)] px-4 text-sm font-medium text-muted transition-colors hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!reason || state === "sending"}
                className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] bg-ink px-4 text-sm font-medium text-canvas transition-opacity hover:opacity-85 disabled:opacity-45"
              >
                {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Submit report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
