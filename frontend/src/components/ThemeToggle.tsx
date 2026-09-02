"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    // Read the resolved theme once mounted — there's no server value for it.
    const explicit = document.documentElement.dataset.theme;
    const isDark =
      explicit === "dark" ||
      (explicit !== "light" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("wsio-theme", next ? "dark" : "light");
    } catch {
      /* private mode — the choice just won't persist */
    }
  };

  const base =
    "flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-muted transition-colors hover:bg-raised hover:text-ink";

  if (dark === null) return <span className={`h-9 w-9 ${className}`} aria-hidden />;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`${base} ${className}`}
    >
      {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
