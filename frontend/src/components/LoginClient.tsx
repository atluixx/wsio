"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { loginUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export function LoginClient() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    const res = await loginUser(email, password);
    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    setSuccess(true);
    setUser({ id: res.id, email: res.email });

    setTimeout(() => {
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12 font-sans">
      <ScrollReveal className="w-full max-w-md">
        {/* Card Header */}
        <div className="mb-6 text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white tracking-tight">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
              &gt;
            </div>
            <span>wsio<span className="text-emerald-400">.</span></span>
          </Link>
          <h1 className="text-2xl sm:text-3xl text-white font-extrabold tracking-tight">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-zinc-400">
            Access your URL workspace, subdomains, and click telemetry.
          </p>
        </div>

        {/* Card Body */}
        <div className="craft-panel p-6 sm:p-8 rounded-2xl space-y-4 border-white/10">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300 font-mono">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 font-mono">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Authentication verified. Opening dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-mono">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  type="email"
                  placeholder="developer@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 text-xs craft-input text-white rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 text-xs craft-input text-white rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 h-11 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl gap-1.5 font-sans"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="border-t border-white/10 pt-4 text-center text-xs text-zinc-400 font-sans">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="text-emerald-400 hover:underline font-semibold">
              Create free account
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

