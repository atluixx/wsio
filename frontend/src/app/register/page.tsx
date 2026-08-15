"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { registerUser } from "@/lib/api";
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const res = await registerUser(email, password);
    setLoading(false);

    if (res.error) {
      setError(String(res.error));
      return;
    }

    setSuccess(true);
    setUser({ id: res.id, email: res.email });

    setTimeout(() => {
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <ScrollReveal className="w-full max-w-md">
        {/* Card Header */}
        <div className="mb-6 text-center space-y-2">
          <Link href="/" className="inline-block font-mono text-2xl font-bold text-white tracking-tight">
            wsio<span className="text-zinc-500">.</span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl text-white font-normal">
            Create Account
          </h1>
          <p className="font-mono text-xs text-zinc-400">
            Register to manage &amp; track your shortened URLs.
          </p>
        </div>

        {/* Card Body */}
        <div className="rounded-xl border border-white/10 bg-zinc-950 p-6 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-950/30 p-3 font-mono text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-3 font-mono text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Account registered! Redirecting to dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  placeholder="user@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-zinc-900/90 py-2.5 pl-9 pr-3.5 font-mono text-xs text-white placeholder-zinc-600 transition-colors focus:border-white/30 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                Password <span className="text-zinc-500 font-normal">(min 8 characters)</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-zinc-900/90 py-2.5 pl-9 pr-3.5 font-mono text-xs text-white placeholder-zinc-600 transition-colors focus:border-white/30 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-zinc-900/90 py-2.5 pl-9 pr-3.5 font-mono text-xs text-white placeholder-zinc-600 transition-colors focus:border-white/30 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="btn-minimal-primary w-full mt-2"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-4 text-center font-mono text-xs text-zinc-500">
            Already registered?{" "}
            <Link href="/login" className="text-white hover:underline">
              Log in instead
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
