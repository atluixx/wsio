import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div>
          <Link
            href="/"
            className="font-display text-[1.2rem] font-medium leading-none text-ink"
          >
            wsio<span className="text-accent">.</span>
          </Link>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-faint">
            One link for everything you make. Free, and quiet about it.
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted">
          <Link href="/privacy" className="transition-colors hover:text-ink">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-ink">
            Terms
          </Link>
          <span className="text-faint">© {year}</span>
        </div>
      </div>
    </footer>
  );
}
