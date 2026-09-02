"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { registerUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, AlertCircle } from "lucide-react";

export function RegisterClient() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Fill in every field.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setLoading(true);
    const res = await registerUser(email, password);
    setLoading(false);
    if (res.error) {
      setError(String(res.error));
      return;
    }
    setDone(true);
    setUser({ id: res.id, email: res.email });
    setTimeout(() => router.push("/dashboard"), 500);
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-5 py-16">
      <div className="w-full max-w-[24rem]">
        <div className="text-center">
          <h1 className="font-display text-2xl font-medium tracking-tight">
            Create your page
          </h1>
          <p className="mt-2 text-sm text-muted">
            Claim a username and start adding links in seconds.
          </p>
        </div>

        <div className="mt-7 surface-card p-6 sm:p-7">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-negative-soft)] px-3.5 py-2.5 text-sm text-[var(--color-negative)]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-ink">
                Email
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-ink">
                Password <span className="font-normal text-faint">· 8+ characters</span>
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm" className="text-sm font-medium text-ink">
                Confirm password
              </label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={loading || done} className="mt-1 w-full">
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-canvas border-t-transparent" />
              ) : done ? (
                "One moment…"
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
