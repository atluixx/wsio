"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Plus, Menu, X, ArrowRight, ShieldCheck, Sparkles, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090a0f]/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="group flex items-center gap-2 transition-opacity hover:opacity-90 min-h-[44px]"
        >
          <span className="font-heading text-2xl font-bold tracking-tight text-white">
            wsio<span className="text-zinc-500">.</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
              pathname === "/dashboard"
                ? "bg-zinc-800/80 text-white border border-white/10"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-zinc-400" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/create"
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
              pathname === "/create"
                ? "bg-zinc-800/80 text-white border border-white/10"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
            }`}
          >
            <Plus className="h-3.5 w-3.5 text-zinc-400" />
            <span>Create Link</span>
          </Link>

          <Link
            href="/pricing"
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
              pathname === "/pricing"
                ? "bg-zinc-800/80 text-white border border-white/10"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-zinc-400" />
            <span>Pricing</span>
          </Link>

          {isAuthenticated && user?.role === "admin" && (
            <Link
              href="/admin/keys"
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
                pathname === "/admin/keys"
                  ? "bg-zinc-800 text-white border border-white/10"
                  : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Admin Keys</span>
            </Link>
          )}

          <div className="mx-3 h-4 w-[1px] bg-white/10" />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 max-w-[150px] truncate" title={user?.email}>
                {user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-xs h-8 gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors ${
                  pathname === "/login"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                Sign In
              </Link>
              <Button asChild size="sm" className="text-xs font-medium">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          {!isAuthenticated && (
            <Button asChild size="sm" className="h-8 text-xs">
              <Link href="/create">Shorten</Link>
            </Button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-zinc-900/80 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#090a0f] p-4 md:hidden space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            <Link
              href="/dashboard"
              onClick={closeMobileMenu}
              className={`flex items-center justify-between rounded-lg p-3 text-sm font-medium transition-colors ${
                pathname === "/dashboard"
                  ? "bg-zinc-900 text-white border border-white/10"
                  : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4 text-zinc-400" />
                <div>
                  <div className="font-semibold text-white">Dashboard</div>
                  <div className="text-xs text-zinc-400">View performance &amp; active links</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-600" />
            </Link>

            <Link
              href="/create"
              onClick={closeMobileMenu}
              className={`flex items-center justify-between rounded-lg p-3 text-sm font-medium transition-colors ${
                pathname === "/create"
                  ? "bg-zinc-900 text-white border border-white/10"
                  : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Plus className="h-4 w-4 text-zinc-300" />
                <div>
                  <div className="font-semibold text-white">Create Short Link</div>
                  <div className="text-xs text-zinc-400">Paste long URL and customize slug</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-600" />
            </Link>

            <Link
              href="/pricing"
              onClick={closeMobileMenu}
              className={`flex items-center justify-between rounded-lg p-3 text-sm font-medium transition-colors ${
                pathname === "/pricing"
                  ? "bg-zinc-900 text-white border border-white/10"
                  : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-zinc-300" />
                <div>
                  <div className="font-semibold text-white">Plans &amp; Pricing</div>
                  <div className="text-xs text-zinc-400">Free, Starter, and Diamond options</div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-600" />
            </Link>
          </nav>

          <div className="border-t border-white/10 pt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="rounded-lg bg-zinc-900/50 p-3 text-xs text-zinc-400">
                  <span className="text-[10px] uppercase text-zinc-500 block">Signed in as</span>
                  <span className="text-white font-medium truncate block">{user?.email}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="w-full text-xs gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" size="sm" className="w-full text-xs">
                  <Link href="/login" onClick={closeMobileMenu}>
                    Sign In
                  </Link>
                </Button>
                <Button asChild size="sm" className="w-full text-xs">
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
