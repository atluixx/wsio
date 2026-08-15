import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Column 1: Brand & Status */}
          <div className="space-y-4">
            <Link href="/" className="inline-block font-mono text-xl font-bold tracking-tight text-white">
              wsio<span className="text-zinc-500">.</span>
            </Link>
            <p className="font-mono text-xs leading-relaxed text-zinc-500">
              High-performance minimalist link redirection engine. Pure speed, clean monospaced hashes, zero tracking bloat.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1 font-mono text-[11px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Engine Operational</span>
            </div>
          </div>

          {/* Column 2: Product & Services */}
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
              <li>
                <Link href="/dashboard#analytics" className="transition-colors hover:text-white">
                  Click Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Architecture & Protocol */}
          <div className="space-y-3 font-mono text-xs">
            <h3 className="font-semibold uppercase tracking-wider text-white">Architecture</h3>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <span className="text-zinc-500">Protocol:</span> Minimalist UI
              </li>
              <li>
                <span className="text-zinc-500">Backend:</span> Golang Microservices
              </li>
              <li>
                <span className="text-zinc-500">Hashing:</span> Monospaced Base36
              </li>
              <li>
                <span className="text-zinc-500">Latency:</span> &lt; 15ms Edge
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Policy */}
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
              <li>
                <Link href="/privacy#cookies" className="transition-colors hover:text-white">
                  Cookie Declaration
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-900 pt-6 font-mono text-xs text-zinc-600 sm:flex-row">
          <div>
            wsio<span className="text-zinc-500">.</span> &copy; {currentYear} &mdash; Utilitarian Minimalist Link Architecture.
          </div>
          <div className="flex items-center gap-4">
            <span className="badge-pastel-blue">v1.0.4 Release</span>
            <span>All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
