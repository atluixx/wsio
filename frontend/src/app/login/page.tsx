"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { loginUser } from "@/lib/api";
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = Router();
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
      setError("Please fill in both email and password.");
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
      router.push("/");
    }, 800);
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 font-mono text-base font-bold text-white">
            ws
          </div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Authenticate
          </h1>
          <p className="mt-1 font-mono text-xs text-zinc-400">
            Sign in to access your shortened links &amp; metrics.
          </p>
        </div>

        {/* Card Body */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-zinc-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950 p-3 font-mono text-xs text-white">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
              <span>Authenticated successfully. Redirecting...</span>
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
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950/90 py-2.5 pl-9 pr-3.5 font-mono text-xs text-white placeholder-zinc-600 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-xs text-zinc-300 uppercase tracking-wider">
                Password
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
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950/90 py-2.5 pl-9 pr-3.5 font-mono text-xs text-white placeholder-zinc-600 transition-colors focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 font-mono text-xs font-semibold text-black transition-all hover:bg-zinc-200 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-zinc-800 pt-4 text-center font-mono text-xs text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-white hover:underline">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return useRouter();
}
