"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, Minus, Palette, BarChart3, Zap, GripVertical } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

const features = [
  {
    Icon: Zap,
    title: "One link, everything",
    body: "Share a single wsio.lol/you link across every profile. Update it once, it's live everywhere.",
  },
  {
    Icon: GripVertical,
    title: "Drag to arrange",
    body: "Reorder links in seconds, hide one without deleting it, and edit inline. No clutter.",
  },
  {
    Icon: Palette,
    title: "Themes that fit",
    body: "Pick a look — minimal, midnight, paper, sunset — and your page matches it instantly.",
  },
  {
    Icon: BarChart3,
    title: "Real click analytics",
    body: "See page views and per-link clicks with 24-hour and 7-day trends. No third-party trackers.",
  },
];

const faqs = [
  {
    q: "What is wsio?",
    a: "A link-in-bio tool. You get one short page at wsio.lol/your-name that holds every link you want to share.",
  },
  {
    q: "Is it free?",
    a: "Yes. Create an account, claim a username, add your links, and share the page.",
  },
  {
    q: "Can I track clicks?",
    a: "Every link records clicks, and your page records views. The dashboard shows totals plus 24-hour and 7-day activity.",
  },
  {
    q: "Can I change my username later?",
    a: "Yes, from the dashboard — as long as the new one isn't already taken.",
  },
];

export function HomeClient() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(isAuthenticated ? "/dashboard" : "/register");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-16 px-4 py-12 font-sans sm:py-20">
      <ScrollReveal priority>
        <div className="mx-auto max-w-xl space-y-4 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            One link for everything you do.
          </h1>
          <p className="text-xs leading-relaxed text-zinc-400 sm:text-sm">
            Build a clean, fast link-in-bio page. Add your socials, work and projects, reorder with a
            drag, and see what people actually click.
          </p>
        </div>

        <form
          onSubmit={handleClaim}
          className="minimal-card mx-auto mt-8 flex max-w-md items-center gap-1 p-2 shadow-xl"
        >
          <span className="pl-2 font-mono text-xs text-zinc-500 sm:text-sm">wsio.lol/</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="yourname"
            className="h-10 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
            maxLength={32}
          />
          <Button type="submit" size="sm" className="h-10 shrink-0 px-4 text-xs">
            Claim
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </form>
        <p className="mt-2 text-center text-[11px] text-zinc-600">
          {isAuthenticated ? "Go to your dashboard to edit your page." : "Free — no card required."}
        </p>
      </ScrollReveal>

      <ScrollReveal delayMs={50}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map(({ Icon, title, body }) => (
            <div key={title} className="minimal-card space-y-2 p-5">
              <Icon className="h-4 w-4 text-zinc-300" />
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-xs leading-relaxed text-zinc-400">{body}</p>
            </div>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal delayMs={100}>
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-white">Questions</h2>
          <div className="space-y-2">
            {faqs.map((item, idx) => (
              <div key={idx} className="minimal-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between p-4 text-left text-xs font-medium text-white hover:text-zinc-300"
                >
                  <span>{item.q}</span>
                  {openFaq === idx ? (
                    <Minus className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                  ) : (
                    <Plus className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="border-t border-white/5 px-4 pb-4 pt-3 text-xs leading-relaxed text-zinc-400">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delayMs={100}>
        <div className="minimal-card flex flex-col items-center gap-3 p-8 text-center">
          <h2 className="text-lg font-bold text-white">Ready in a minute</h2>
          <p className="max-w-sm text-xs text-zinc-400">
            Claim your username, drop in your links, share the page.
          </p>
          <Button asChild size="sm" className="mt-1 h-9 text-xs">
            <Link href={isAuthenticated ? "/dashboard" : "/register"}>
              {isAuthenticated ? "Open dashboard" : "Get started"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </ScrollReveal>
    </div>
  );
}
