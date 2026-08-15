import { ScrollReveal } from "@/components/ScrollReveal";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Scale, AlertTriangle, Lock } from "lucide-react";

export const metadata = {
  title: "Terms of Use | wsio.",
  description: "Terms of Use and service policy for wsio URL redirection engine.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 space-y-10 font-mono">
      <ScrollReveal>
        <div className="border-b border-white/10 pb-6 space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-5xl text-white font-normal">
            Terms of Use
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
            Please read these terms carefully before utilizing the wsio. URL shortener and redirection service.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delayMs={50}>
        <div className="space-y-8 text-xs text-zinc-300 leading-relaxed">
          {/* Section 1 */}
          <section className="bento-card space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Scale className="h-4 w-4 text-emerald-400" />
              <h2>1. Acceptance of Terms</h2>
            </div>
            <p>
              By accessing or using the wsio. service (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Use.
              If you do not agree to all terms, you are prohibited from using the platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bento-card space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h2>2. Permitted Use &amp; Acceptable Behavior</h2>
            </div>
            <p>
              wsio. is designed for URL shortening and redirection. You strictly agree NOT to use the Service to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Distribute malware, phishing links, ransomware, or malicious payloads.</li>
              <li>Engage in spamming, deceptive redirects, or unauthorized bot traffic generation.</li>
              <li>Violate any local, national, or international privacy laws or intellectual property rights.</li>
            </ul>
            <p className="text-zinc-500">
              Any short link violating these rules will be deactivated immediately without prior notice.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bento-card space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Lock className="h-4 w-4 text-sky-400" />
              <h2>3. Account &amp; Guest Sessions</h2>
            </div>
            <p>
              Guest links created without logging in are stored in local browser storage (`localStorage`). Registered users maintain links in their secure cloud dashboard. You are responsible for safeguarding your credentials.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bento-card space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              <h2>4. Disclaimer of Warranties</h2>
            </div>
            <p>
              The Service is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis. wsio. makes no warranties regarding uninterrupted availability or total data preservation.
            </p>
          </section>
        </div>
      </ScrollReveal>
    </div>
  );
}
