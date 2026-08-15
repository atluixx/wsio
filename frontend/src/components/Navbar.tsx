"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Plus, LayoutDashboard, Sparkles, Menu, X, ArrowRight, ShieldAlert } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="group flex items-center gap-1.5 transition-opacity hover:opacity-90 min-h-[44px] min-w-[44px]"
        >
          <span className="font-mono text-xl font-bold tracking-tight text-white">
            wsio<span className="text-emerald-400">.</span>
          </span>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-[10px] uppercase text-emerald-400">
            v1.0
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 font-mono text-xs transition-colors ${
              pathname === "/dashboard"
                ? "bg-zinc-800 text-white border border-zinc-700"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-zinc-400" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/create"
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 font-mono text-xs transition-colors ${
              pathname === "/create"
                ? "bg-zinc-800 text-white border border-zinc-700"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <Plus className="h-3.5 w-3.5 text-zinc-400" />
            <span>New Link</span>
          </Link>

          <Link
            href="/pricing"
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 font-mono text-xs transition-colors ${
              pathname === "/pricing"
                ? "bg-zinc-800 text-white border border-zinc-700"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Pricing</span>
          </Link>

          {isAuthenticated && user?.role === "admin" && (
            <Link
              href="/admin/keys"
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 font-mono text-xs transition-colors ${
                pathname === "/admin/keys"
                  ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/40"
                  : "text-emerald-400 hover:bg-emerald-950/30"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5 text-emerald-400" />
              <span>Admin Keys</span>
            </Link>
          )}

          <div className="mx-2 h-4 w-[1px] bg-zinc-800" />


          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-zinc-400 max-w-[140px] truncate" title={user?.email}>
                {user?.email}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 font-mono text-xs text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white cursor-pointer"
                title="Sign out of your account"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={`rounded-lg px-3.5 py-2 font-mono text-xs transition-colors ${
                  pathname === "/login"
                    ? "bg-zinc-800 text-white border border-zinc-700"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="btn-minimal-primary text-xs"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          {!isAuthenticated && (
            <Link
              href="/create"
              onClick={closeMobileMenu}
              className="flex items-center gap-1 rounded-md bg-white px-3 py-1.5 font-mono text-xs font-semibold text-black"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Shorten</span>
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-zinc-950 p-4 md:hidden space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2">
            <Link
              href="/dashboard"
              onClick={closeMobileMenu}
              className={`flex items-center justify-between rounded-lg p-3 font-mono text-sm transition-colors ${
                pathname === "/dashboard"
                  ? "bg-zinc-900 text-white border border-zinc-700"
                  : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4 text-zinc-400" />
                <div>
                  <div className="font-semibold">Dashboard</div>
                  <div className="text-[11px] text-zinc-500">Manage links &amp; view analytics</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-600" />
            </Link>

            <Link
              href="/create"
              onClick={closeMobileMenu}
              className={`flex items-center justify-between rounded-lg p-3 font-mono text-sm transition-colors ${
                pathname === "/create"
                  ? "bg-zinc-900 text-white border border-zinc-700"
                  : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Plus className="h-4 w-4 text-emerald-400" />
                <div>
                  <div className="font-semibold text-white">Create New Short Link</div>
                  <div className="text-[11px] text-zinc-500">Generate instant edge hash</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-600" />
            </Link>

            <Link
              href="/pricing"
              onClick={closeMobileMenu}
              className={`flex items-center justify-between rounded-lg p-3 font-mono text-sm transition-colors ${
                pathname === "/pricing"
                  ? "bg-zinc-900 text-white border border-zinc-700"
                  : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <div>
                  <div className="font-semibold">Plans &amp; Pricing</div>
                  <div className="text-[11px] text-zinc-500">Free, Starter, and Pro options</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-600" />
            </Link>
          </nav>

          <div className="border-t border-white/10 pt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="rounded-lg bg-zinc-900/50 p-3 font-mono text-xs text-zinc-400">
                  <span className="text-[10px] uppercase text-zinc-500 block">Logged in as</span>
                  <span className="text-white font-medium truncate block">{user?.email}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-950/20 py-2.5 font-mono text-xs text-red-400 hover:bg-red-950/40"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 py-2.5 font-mono text-xs text-white"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                  className="btn-minimal-primary py-2.5 text-xs text-center justify-center"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

