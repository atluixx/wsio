import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-muted sm:flex-row sm:px-8">
        <div className="flex items-center gap-3">
          <span className="font-display text-base font-semibold text-ink">wsio</span>
          <span className="text-faint">© {year}</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="transition-colors hover:text-ink">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-ink">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
