import { ScrollReveal } from "@/components/ScrollReveal";
import Link from "next/link";
import { ArrowLeft, Shield, EyeOff, Server, Cookie } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | wsio.",
  description: "Privacy commitments and security model for wsio URL redirection engine.",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
            At wsio., privacy is an architectural principle. We build simple, privacy-respecting software.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delayMs={50}>
        <div className="space-y-8 text-xs text-zinc-300 leading-relaxed">
          {/* Section 1 */}
          <section className="bento-card space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <EyeOff className="h-4 w-4 text-emerald-400" />
              <h2>1. Zero Third-Party Tracking</h2>
            </div>
            <p>
              We do NOT sell your data, use advertising cookies, or integrate third-party tracking scripts.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bento-card space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Server className="h-4 w-4 text-sky-400" />
              <h2>2. Information We Collect</h2>
            </div>
            <p>
              We collect minimal operational data necessary to perform link redirection:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li><strong className="text-white">Destination URLs:</strong> Long target web addresses submitted to generate short links.</li>
              <li><strong className="text-white">Account Email:</strong> Provided strictly for authentication and dashboard sync.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="cookies" className="bento-card space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Cookie className="h-4 w-4 text-amber-400" />
              <h2>3. Cookie &amp; Storage Declaration</h2>
            </div>
            <p>
              We use necessary HTTP-only authentication cookies for registered user sessions and browser `localStorage` for Guest mode links.
            </p>
          </section>

          {/* Section 4 */}
          <section id="security" className="bento-card space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Shield className="h-4 w-4 text-purple-400" />
              <h2>4. Security Model &amp; Data Rights</h2>
            </div>
            <p>
              All traffic between your browser and our servers is encrypted using standard TLS. You retain full control over your short links and can delete any link directly from your Dashboard at any time.
            </p>
          </section>
        </div>
      </ScrollReveal>
    </div>
  );
}
