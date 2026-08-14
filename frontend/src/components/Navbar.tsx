"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Link2, LogOut, User as UserIcon, Plus, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 font-mono text-sm font-bold text-white transition-colors group-hover:border-zinc-500">
            W
          </div>
          <span className="font-mono text-lg font-bold tracking-tight text-white">
            wsio<span className="text-zinc-500">.</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs transition-colors ${
              pathname === "/"
                ? "bg-zinc-800 text-white border border-zinc-700"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/create"
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs transition-colors ${
              pathname === "/create"
                ? "bg-zinc-800 text-white border border-zinc-700"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Link</span>
          </Link>

          <div className="mx-2 h-4 w-[1px] bg-zinc-800" />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden font-mono text-xs text-zinc-400 sm:inline-block">
                {user?.email}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={`rounded-md px-3 py-1.5 font-mono text-xs transition-colors ${
                  pathname === "/login"
                    ? "bg-zinc-800 text-white border border-zinc-700"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md border border-white bg-white px-3 py-1.5 font-mono text-xs font-semibold text-black transition-transform hover:bg-zinc-200 active:scale-95"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
