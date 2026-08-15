import { ScrollReveal } from "@/components/ScrollReveal";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Scale, AlertTriangle, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Terms of Service — wsio.",
  description: "Terms of Service and acceptable use policy for wsio URL shortener.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20 space-y-10 font-sans">
      <ScrollReveal>
        <div className="border-b border-white/10 pb-6 space-y-3">
          <Button asChild variant="ghost" size="sm" className="text-xs h-8 -ml-2 text-zinc-400 hover:text-white">
            <Link href="/">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>
          </Button>
          <h1 className="font-heading text-3xl sm:text-5xl text-white font-bold">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-2xl">
            Please read these terms carefully before using the wsio link management platform.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delayMs={50}>
        <div className="space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          {/* Section 1 */}
          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-base">
              <Scale className="h-5 w-5 text-emerald-400" />
              <h2>1. Acceptance of Terms</h2>
            </div>
            <p className="text-zinc-400">
              By accessing or using wsio, you agree to be bound by these Terms of Service. If you do not agree, you may not use the service.
            </p>
          </Card>

          {/* Section 2 */}
          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-base">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <h2>2. Acceptable Use Policy</h2>
            </div>
            <p className="text-zinc-400">
              wsio is designed for URL shortening and redirection. You agree strictly NOT to use the service to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Distribute malware, phishing links, or deceptive software payloads.</li>
              <li>Engage in unsolicited spamming or automated bot traffic generation.</li>
              <li>Violate applicable privacy regulations or intellectual property laws.</li>
            </ul>
            <p className="text-zinc-400">
              Links identified in violation of this policy will be disabled immediately without prior notice.
            </p>
          </Card>

          {/* Section 3 */}
          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-base">
              <Lock className="h-5 w-5 text-sky-400" />
              <h2>3. Account Responsibility</h2>
            </div>
            <p className="text-zinc-400">
              Guest links are saved locally in browser storage. Registered users maintain links securely within their cloud dashboard. You are responsible for maintaining account credential confidentiality.
            </p>
          </Card>

          {/* Section 4 */}
          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-base">
              <ShieldCheck className="h-5 w-5 text-purple-400" />
              <h2>4. Service Availability</h2>
            </div>
            <p className="text-zinc-400">
              We strive for continuous service uptime on our global edge network. Subscriptions are billed according to your selected plan parameters.
            </p>
          </Card>
        </div>
      </ScrollReveal>
    </div>
  );
}
