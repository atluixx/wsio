import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#07080c] text-zinc-400">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Column 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="inline-block font-heading text-2xl font-bold tracking-tight text-white">
              wsio<span className="text-zinc-500">.</span>
            </Link>
            <p className="text-xs leading-relaxed text-zinc-400">
              Modern link management platform providing fast, reliable URL shortening and real-time click telemetry for teams and creators.
            </p>
          </div>

          {/* Column 2: Product */}
          <div className="space-y-3 text-xs">
            <h3 className="font-semibold text-white tracking-wide uppercase text-[11px]">Product</h3>
            <ul className="space-y-2.5 text-zinc-400">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  URL Shortener
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-white">
                  Analytics Dashboard
                </Link>
              </li>
              <li>
                <Link href="/create" className="transition-colors hover:text-white">
                  Create Short Link
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="transition-colors hover:text-white">
                  Plans &amp; Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Legal */}
          <div className="space-y-3 text-xs">
            <h3 className="font-semibold text-white tracking-wide uppercase text-[11px]">Legal &amp; Trust</h3>
            <ul className="space-y-2.5 text-zinc-400">
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
                <Link href="/privacy#security" className="transition-colors hover:text-white">
                  Security &amp; Data Rights
                </Link>
              </li>
              <li>
                <Link href="/privacy#cookies" className="transition-colors hover:text-white">
                  Cookie Declaration (LGPD/GDPR)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Infrastructure */}
          <div className="space-y-3 text-xs">
            <h3 className="font-semibold text-white tracking-wide uppercase text-[11px]">Infrastructure</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Global edge network ensuring low-latency redirection and high availability SLAs.
            </p>
            <div className="flex items-center gap-2 pt-1 text-zinc-400 text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <div>
            &copy; {currentYear} wsio. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
