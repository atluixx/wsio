import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-purple-500/15 bg-[#06040d] text-purple-200/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Column 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="inline-block font-heading text-2xl font-bold tracking-tight text-white">
              wsio<span className="text-purple-400">.</span>
            </Link>
            <p className="text-xs leading-relaxed text-purple-300/70">
              High-performance URL management platform delivering fast redirection, custom branding, and real-time click telemetry.
            </p>
          </div>

          {/* Column 2: Product */}
          <div className="space-y-3 text-xs">
            <h3 className="font-semibold text-purple-200 tracking-wider uppercase text-[11px]">Product</h3>
            <ul className="space-y-2 text-purple-300/70">
              <li>
                <Link href="/" className="transition-colors hover:text-purple-100">
                  URL Shortener
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-purple-100">
                  Dashboard &amp; Telemetry
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="transition-colors hover:text-purple-100">
                  Plans &amp; Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Privacy */}
          <div className="space-y-3 text-xs">
            <h3 className="font-semibold text-purple-200 tracking-wider uppercase text-[11px]">Legal &amp; Compliance</h3>
            <ul className="space-y-2 text-purple-300/70">
              <li>
                <Link href="/privacy" className="transition-colors hover:text-purple-100">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-purple-100">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy#cookies" className="transition-colors hover:text-purple-100">
                  Cookie Declaration (LGPD/GDPR)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: System Operational Status */}
          <div className="space-y-3 text-xs">
            <h3 className="font-semibold text-purple-200 tracking-wider uppercase text-[11px]">Platform Health</h3>
            <p className="text-xs text-purple-300/70 leading-relaxed">
              Global distributed edge infrastructure providing low-latency redirection.
            </p>
            <div className="flex items-center gap-2 pt-1 text-purple-300 text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Systems Operational (99.99% Uptime)</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 border-t border-purple-500/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-purple-300/50 gap-4">
          <div>
            &copy; {currentYear} wsio. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-purple-200 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-purple-200 transition-colors">Terms</Link>
            <Link href="/pricing" className="hover:text-purple-200 transition-colors">Pricing</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
