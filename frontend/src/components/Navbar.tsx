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
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#09090b]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 font-sans">
        {/* Minimal Logo */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="text-lg font-bold tracking-tight text-white hover:opacity-80 transition-opacity"
        >
          wsio<span className="text-zinc-500">.</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400">
          <Link
            href="/dashboard"
            className={`transition-colors hover:text-white ${
              pathname === "/dashboard" ? "text-white font-medium" : ""
            }`}
          >
            My page
          </Link>

          {isAuthenticated && user?.role === "admin" && (
            <Link
              href="/admin"
              className={`flex items-center gap-1 transition-colors hover:text-white ${
                pathname.startsWith("/admin") ? "text-white font-medium" : ""
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin</span>
            </Link>
          )}

          <div className="h-3.5 w-[1px] bg-white/10" />

          {isAuthenticated ? (
            <div className="flex items-center gap-3 font-mono">
              <span className="text-[11px] text-zinc-400 max-w-[130px] truncate" title={user?.email}>
                {user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-xs h-7 px-2 text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              >
                <LogOut className="h-3.5 w-3.5 mr-1" />
                <span>Exit</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Button asChild size="sm" className="bg-white text-zinc-950 hover:bg-zinc-200 font-medium text-xs px-3.5 h-7 rounded-lg">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-zinc-900 text-zinc-300"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#09090b] p-4 md:hidden space-y-3 font-sans">
          <nav className="flex flex-col space-y-2 text-xs text-zinc-400">
            <Link
              href="/dashboard"
              onClick={closeMobileMenu}
              className={`p-2 rounded-lg ${pathname === "/dashboard" ? "bg-zinc-800 text-white" : ""}`}
            >
              My page
            </Link>

            {isAuthenticated && user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={closeMobileMenu}
                className={`p-2 rounded-lg ${pathname.startsWith("/admin") ? "bg-zinc-800 text-white" : ""}`}
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="border-t border-white/10 pt-3">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-mono truncate max-w-[180px]">{user?.email}</span>
                <Button variant="ghost" size="sm" onClick={logout} className="text-xs h-7 text-zinc-400">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" size="sm" className="text-xs border-white/10 bg-zinc-900 text-zinc-300 h-8">
                  <Link href="/login" onClick={closeMobileMenu}>Sign In</Link>
                </Button>
                <Button asChild size="sm" className="text-xs bg-white text-zinc-950 hover:bg-zinc-200 font-medium h-8">
                  <Link href="/register" onClick={closeMobileMenu}>Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}


