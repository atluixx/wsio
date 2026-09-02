"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="font-display text-[1.4rem] font-medium leading-none tracking-[-0.01em] text-ink transition-opacity hover:opacity-70"
    >
      wsio<span className="text-accent">.</span>
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-canvas">
      <div className="mx-auto flex h-[68px] max-w-5xl items-center justify-between px-5 sm:px-8">
        <Wordmark onClick={close} />

        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          <Link
            href="/dashboard"
            className={`transition-colors hover:text-ink ${
              pathname === "/dashboard" ? "text-ink" : ""
            }`}
          >
            Dashboard
          </Link>

          {isAuthenticated && user?.role === "admin" && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 transition-colors hover:text-ink ${
                pathname.startsWith("/admin") ? "text-ink" : ""
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Link>
          )}

          {isAuthenticated ? (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-muted transition-colors hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="transition-colors hover:text-ink">
                Sign in
              </Link>
              <Button asChild size="sm">
                <Link href="/register">Get started</Link>
              </Button>
            </div>
          )}
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-xs)] border border-[var(--color-control-border)] text-ink md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="space-y-1 border-b border-line bg-canvas px-5 pb-5 pt-2 md:hidden">
          <Link
            href="/dashboard"
            onClick={close}
            className="block rounded-[var(--radius-xs)] px-3 py-2.5 text-sm text-muted hover:bg-raised hover:text-ink"
          >
            Dashboard
          </Link>
          {isAuthenticated && user?.role === "admin" && (
            <Link
              href="/admin"
              onClick={close}
              className="block rounded-[var(--radius-xs)] px-3 py-2.5 text-sm text-muted hover:bg-raised hover:text-ink"
            >
              Admin
            </Link>
          )}
          <div className="mt-3 border-t border-line pt-3">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  close();
                  logout();
                }}
                className="text-sm text-muted hover:text-ink"
              >
                Sign out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/login" onClick={close}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register" onClick={close}>
                    Get started
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
