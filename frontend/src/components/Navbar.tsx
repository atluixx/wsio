"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="wsio home"
      className="font-display text-[1.6rem] font-medium leading-none tracking-[-0.02em] text-ink transition-opacity hover:opacity-60"
    >
      wsio<span className="text-accent">.</span>
    </Link>
  );
}

const navLink =
  "relative text-[0.9rem] text-muted transition-colors hover:text-ink " +
  "after:absolute after:inset-x-0 after:-bottom-1.5 after:h-px after:origin-left after:scale-x-0 " +
  "after:bg-[var(--color-accent)] after:transition-transform after:duration-200 hover:after:scale-x-100";
const navLinkActive = "text-ink after:scale-x-100";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const isAdmin = isAuthenticated && user?.role === "admin";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line-strong bg-canvas">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
        {/* Left cluster: wordmark + product nav */}
        <div className="flex items-center gap-8">
          <Wordmark onClick={close} />

          {isAuthenticated && (
            <nav className="hidden items-center gap-7 md:flex">
              <Link
                href="/dashboard"
                className={`${navLink} ${pathname === "/dashboard" ? navLinkActive : ""}`}
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-1.5 ${navLink} ${
                    pathname.startsWith("/admin") ? navLinkActive : ""
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Right cluster: theme + account */}
        <div className="hidden items-center gap-4 md:flex">
          <ThemeToggle className="-mr-1" />
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-[0.9rem] text-muted transition-colors hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          ) : (
            <div className="flex items-center gap-5">
              <Link href="/login" className={navLink}>
                Sign in
              </Link>
              <Button asChild size="sm">
                <Link href="/register">Claim your page</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="-mr-2 flex h-10 w-10 items-center justify-center text-ink"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-b border-line-strong bg-canvas px-5 pb-6 pt-2 md:hidden">
          {isAuthenticated && (
            <nav className="flex flex-col">
              <Link
                href="/dashboard"
                onClick={close}
                className="border-b border-line py-3 text-[0.95rem] text-muted transition-colors hover:text-ink"
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={close}
                  className="border-b border-line py-3 text-[0.95rem] text-muted transition-colors hover:text-ink"
                >
                  Admin
                </Link>
              )}
            </nav>
          )}
          <div className="pt-4">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  close();
                  logout();
                }}
                className="flex items-center gap-1.5 text-[0.95rem] text-muted transition-colors hover:text-ink"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            ) : (
              <div className="flex flex-col gap-2.5">
                <Button asChild size="sm">
                  <Link href="/register" onClick={close}>
                    Claim your page
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/login" onClick={close}>
                    Sign in
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
