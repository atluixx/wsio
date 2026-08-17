import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.08] bg-[#070709] text-zinc-400 font-sans">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Column 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-white"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
                &gt;
              </div>
              <span>wsio<span className="text-emerald-400">.</span></span>
            </Link>
            <p className="text-xs leading-relaxed text-zinc-400">
              Precision URL infrastructure delivering sub-millisecond redirects, custom brand subdomains, and real-time click telemetry.
            </p>
          </div>

          {/* Column 2: Platform */}
          <div className="space-y-3 text-xs">
            <p className="font-mono text-[11px] font-semibold text-white uppercase tracking-wider">Platform</p>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  URL Workbench
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-white">
                  Telemetry &amp; Analytics
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="transition-colors hover:text-white">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Governance */}
          <div className="space-y-3 text-xs">
            <p className="font-mono text-[11px] font-semibold text-white uppercase tracking-wider">Compliance</p>
            <ul className="space-y-2 text-zinc-400">
              <li>
                <Link href="/privacy" className="transition-colors hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy#cookies" className="transition-colors hover:text-white">
                  Cookie Declaration
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Infrastructure Status */}
          <div className="space-y-3 text-xs">
            <p className="font-mono text-[11px] font-semibold text-white uppercase tracking-wider">Infrastructure</p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Global multi-region edge routing with automated ssl certificate provisioning.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-mono text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 border-t border-white/[0.08] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-mono gap-4">
          <div>
            &copy; {currentYear} wsio. Inc. Built for high-speed edge distribution.
          </div>
          <div className="flex items-center gap-6 text-zinc-400">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

