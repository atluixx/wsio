"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#050507]/80 backdrop-blur-xl transition-all">
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
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            href="/dashboard"
            className={`nav-link-hover text-sm transition-colors py-1 ${
              pathname === "/dashboard"
                ? "text-white nav-link-hover-active font-semibold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Dashboard
          </Link>

          <Link
            href="/pricing"
            className={`nav-link-hover text-sm transition-colors py-1 ${
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
              className={`nav-link-hover flex items-center gap-1.5 text-sm transition-colors py-1 ${
                pathname.startsWith("/admin")
                  ? "text-white nav-link-hover-active font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-zinc-300" />
              <span>Admin Panel</span>
            </Link>
          )}

          <div className="mx-1 h-4 w-[1px] bg-white/10" />

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-400 max-w-[160px] truncate" title={user?.email}>
                {user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-xs h-8 gap-2 border-white/10 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className={`nav-link-hover text-sm transition-colors py-1 ${
                  pathname === "/login"
                    ? "text-white nav-link-hover-active font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Sign In
              </Link>
              <Button asChild size="sm" className="bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs px-4 h-9 shadow-sm">
                <Link href="/register">Get Started</Link>
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
        <div className="border-b border-white/10 bg-[#050507]/95 backdrop-blur-2xl p-5 md:hidden space-y-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3 font-medium">
            <Link
              href="/dashboard"
              onClick={closeMobileMenu}
              className={`rounded-xl p-3 text-sm transition-all ${
                pathname === "/dashboard"
                  ? "bg-zinc-800/80 text-white border border-white/10 font-semibold"
                  : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/pricing"
              onClick={closeMobileMenu}
              className={`rounded-xl p-3 text-sm transition-all ${
                pathname === "/pricing"
                  ? "bg-zinc-800/80 text-white border border-white/10 font-semibold"
                  : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
              }`}
            >
              Pricing
            </Link>

            {isAuthenticated && user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={closeMobileMenu}
                className={`flex items-center gap-2 rounded-xl p-3 text-sm transition-all ${
                  pathname.startsWith("/admin")
                    ? "bg-zinc-800/80 text-white border border-white/10 font-semibold"
                    : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
                }`}
              >
                <ShieldCheck className="h-4 w-4 text-zinc-300" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          <div className="border-t border-white/10 pt-4">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-zinc-900/60 border border-white/10 p-3 text-xs text-zinc-400">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 block font-semibold mb-1">Signed in as</span>
                  <span className="text-white font-medium truncate block">{user?.email}</span>
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
                <Button asChild size="sm" className="w-full text-xs bg-white text-zinc-950 font-semibold hover:bg-zinc-200">
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
