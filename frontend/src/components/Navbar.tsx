"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu, X, ShieldCheck, Zap, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#070709]/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Live Status */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="group flex items-center gap-2 transition-opacity hover:opacity-90 min-h-[44px]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-xs">
              &gt;_
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-sans">
              wsio<span className="text-emerald-400">.</span>
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-mono text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>EDGE 99.99%</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <Link
            href="/dashboard"
            className={`nav-link-hover text-xs uppercase tracking-wider transition-colors py-1 ${
              pathname === "/dashboard"
                ? "text-white nav-link-hover-active font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/pricing"
            className={`nav-link-hover text-xs uppercase tracking-wider transition-colors py-1 ${
              pathname === "/pricing"
                ? "text-white nav-link-hover-active font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Pricing
          </Link>

          {isAuthenticated && user?.role === "admin" && (
            <Link
              href="/admin"
              className={`nav-link-hover flex items-center gap-1.5 text-xs uppercase tracking-wider transition-colors py-1 ${
                pathname.startsWith("/admin")
                  ? "text-emerald-400 nav-link-hover-active font-semibold"
                  : "text-zinc-400 hover:text-emerald-400"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Admin</span>
            </Link>
          )}

          <div className="mx-1 h-4 w-[1px] bg-white/10" />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/90 px-3 py-1 text-xs text-zinc-300">
                <User className="h-3.5 w-3.5 text-zinc-400" />
                <span className="font-mono text-[11px] max-w-[140px] truncate" title={user?.email}>
                  {user?.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-xs h-8 px-3 gap-1.5 border-white/10 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Exit</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className={`text-xs uppercase tracking-wider transition-colors px-2 py-1 ${
                  pathname === "/login"
                    ? "text-white font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Sign In
              </Link>
              <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs px-4 h-8 shadow-sm rounded-lg">
                <Link href="/register" className="flex items-center gap-1">
                  <span>Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/80 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#070709]/95 backdrop-blur-2xl p-5 md:hidden space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2 font-medium">
            <Link
              href="/dashboard"
              onClick={closeMobileMenu}
              className={`rounded-xl p-3 text-xs uppercase tracking-wider transition-all ${
                pathname === "/dashboard"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
                  : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/pricing"
              onClick={closeMobileMenu}
              className={`rounded-xl p-3 text-xs uppercase tracking-wider transition-all ${
                pathname === "/pricing"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
                  : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
              }`}
            >
              Pricing
            </Link>

            {isAuthenticated && user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={closeMobileMenu}
                className={`flex items-center gap-2 rounded-xl p-3 text-xs uppercase tracking-wider transition-all ${
                  pathname.startsWith("/admin")
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
                    : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
                }`}
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          <div className="border-t border-white/10 pt-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-zinc-900/60 border border-white/10 p-3 text-xs text-zinc-400">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">Account</span>
                  <span className="text-white font-mono text-xs truncate block">{user?.email}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="w-full text-xs gap-2 border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline" size="sm" className="w-full text-xs border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                  <Link href="/login" onClick={closeMobileMenu}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild size="sm" className="w-full text-xs bg-emerald-500 text-emerald-950 font-bold hover:bg-emerald-400">
                  <Link href="/register" onClick={closeMobileMenu}>
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

