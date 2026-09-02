"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight, Plus, Minus } from "lucide-react";

const features = [
  {
    kicker: "One address",
    title: "Everything behind a single link",
    body: "Share wsio.lol/you once. Add, swap and reorder what sits behind it whenever you like — the link never changes.",
  },
  {
    kicker: "Arranged by hand",
    title: "Drag your links into order",
    body: "Grab a link, drop it where it belongs. Hide one without deleting it. Rename it inline. No menus to dig through.",
  },
  {
    kicker: "Four themes",
    title: "A page that looks intentional",
    body: "Minimal, midnight, paper or sunset. Pick one and the whole page settles into it — type, spacing and colour together.",
  },
  {
    kicker: "Honest numbers",
    title: "See what actually gets clicked",
    body: "Page views and per-link clicks, with 24-hour and 7-day trends. First-party only — no third-party trackers on your visitors.",
  },
];

const faqs = [
  {
    q: "What is wsio?",
    a: "A link-in-bio page. You get one short address, wsio.lol/your-name, that holds every link you want to share in one tidy list.",
  },
  {
    q: "Does it cost anything?",
    a: "No. Make an account, claim a username, add your links and share the page. That's the whole product.",
  },
  {
    q: "What can I measure?",
    a: "Every link counts its clicks and every page counts its views. The dashboard shows all-time totals alongside 24-hour and 7-day activity.",
  },
  {
    q: "Can I change my username later?",
    a: "Yes, from the dashboard, as long as the new one isn't already taken.",
  },
];

export function HomeClient() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const claim = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(isAuthenticated ? "/dashboard" : "/register");
  };

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8">
      {/* Hero */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-[2.7rem] font-semibold leading-[1.03] tracking-[-0.03em] sm:text-[4.25rem]">
            Your links,
            <br />
            one calm page.
          </h1>
          <p className="mx-auto mt-6 max-w-md text-[1.05rem] leading-relaxed text-muted">
            Put everything you share behind a single address. Arrange it with a
            drag, choose a theme, and watch what people click.
          </p>

          <form
            onSubmit={claim}
            className="mx-auto mt-9 flex max-w-md items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--color-control-border)] bg-surface p-1.5 pl-4 focus-within:border-ink"
          >
            <span className="text-sm text-faint">wsio.lol/</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="yourname"
              maxLength={32}
              className="h-10 flex-1 bg-transparent text-[0.95rem] text-ink outline-none focus-visible:outline-none placeholder:text-faint"
            />
            <Button type="submit" className="shrink-0">
              Claim
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-3 text-sm text-faint">
            {isAuthenticated
              ? "You're signed in — open your dashboard to edit your page."
              : "Free, and quick. No card, no trial clock."}
          </p>
        </div>

        {/* Preview */}
        <div className="mx-auto mt-16 max-w-sm">
          <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-7 shadow-[0_1px_3px_rgba(23,21,15,0.05)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-line bg-raised font-display text-lg font-semibold text-faint">
              {(username || "yn").slice(0, 2).toUpperCase()}
            </div>
            <p className="mt-4 text-center font-display text-lg font-semibold">
              {username ? username : "Your name"}
            </p>
            <p className="mt-1 text-center text-sm text-faint">
              @{username || "yourname"}
            </p>
            <div className="mt-6 space-y-2.5">
              {["Website", "Newsletter", "Latest project", "Say hello"].map((l) => (
                <div
                  key={l}
                  className="flex items-center gap-3 rounded-[var(--radius-md)] border border-line bg-surface px-4 py-3.5 text-sm font-medium shadow-[0_1px_2px_rgba(23,21,15,0.05)]"
                >
                  <span className="flex-1 truncate text-center">{l}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-faint opacity-40" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-line py-20 sm:py-24">
        <div className="grid gap-x-12 gap-y-14 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="max-w-sm">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-faint">
                {f.kicker}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">
                {f.title}
              </h3>
              <p className="mt-2.5 leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line py-20 sm:py-24">
        <div className="grid gap-10 sm:grid-cols-[240px_1fr]">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Questions,
            <br className="hidden sm:block" /> answered
          </h2>
          <div className="divide-y divide-line border-y border-line">
            {faqs.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left font-medium"
                >
                  <span>{item.q}</span>
                  {openFaq === i ? (
                    <Minus className="h-4 w-4 shrink-0 text-faint" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-faint" />
                  )}
                </button>
                {openFaq === i && (
                  <p className="pb-5 pr-8 leading-relaxed text-muted">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line py-20 sm:py-28">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Claim your page
          </h2>
          <p className="mx-auto mt-4 max-w-sm leading-relaxed text-muted">
            Pick a username, drop in your links, share the address. It takes
            about a minute.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href={isAuthenticated ? "/dashboard" : "/register"}>
              {isAuthenticated ? "Open dashboard" : "Get started"}
              <ArrowRight className="h-[18px] w-[18px]" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
