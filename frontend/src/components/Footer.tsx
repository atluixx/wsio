import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Column 1: Brand */}
          <div className="space-y-3">
            <Link href="/" className="inline-block font-mono text-xl font-bold tracking-tight text-white">
              wsio<span className="text-zinc-500">.</span>
            </Link>
            <p className="font-mono text-xs leading-relaxed text-zinc-500">
              Minimalist URL shortener and link redirection engine.
            </p>
          </div>

          {/* Column 2: Product */}
          <div className="space-y-3 font-mono text-xs">
            <h3 className="font-semibold uppercase tracking-wider text-white">Product</h3>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  URL Shortener
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-white">
                  Links Dashboard
                </Link>
              </li>
              <li>
                <Link href="/create" className="transition-colors hover:text-white">
                  Create Short Link
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Trust */}
          <div className="space-y-3 font-mono text-xs">
            <h3 className="font-semibold uppercase tracking-wider text-white">Legal &amp; Trust</h3>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <Link href="/terms" className="transition-colors hover:text-white">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy#security" className="transition-colors hover:text-white">
                  Security Model
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-10 border-t border-zinc-900 pt-6 font-mono text-xs text-zinc-600 text-center sm:text-left">
          wsio<span className="text-zinc-500">.</span> &copy; {currentYear}
        </div>
      </div>
    </footer>
  );
}
