"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const points = [
  {
    title: "One address that never changes",
    body: "Share wsio.lol/you once. Swap, add and reorder what sits behind it whenever you like — the link itself stays put.",
  },
  {
    title: "Arranged by hand",
    body: "Drag a link where it belongs. Hide one without deleting it. Rename it in place. There are no settings to hunt through.",
  },
  {
    title: "Numbers that are yours",
    body: "Page views and per-link clicks, with 24-hour and 7-day trends. Counted first-party — nothing follows your visitors around.",
  },
];

const faqs = [
  {
    q: "What is it, exactly?",
    a: "A single page at wsio.lol/your-name that holds every link you'd otherwise paste one at a time — with a count of what people open.",
  },
  {
    q: "What does it cost?",
    a: "Nothing. Make an account, claim a name, add your links, share the page. There is no paid tier to upsell you to.",
  },
  {
    q: "Can I change my name later?",
    a: "Yes, from the dashboard, as long as the new one isn't taken. Your old address stops resolving once you do.",
  },
  {
    q: "Do you track my visitors?",
    a: "Only a click and a view count, recorded on our own server. No third-party scripts, no cookies handed to anyone else.",
  },
];

const sampleLinks = ["Studio site", "Field notes", "New work", "Say hello"];

export function HomeClient() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");

  const claim = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(isAuthenticated ? "/dashboard" : "/register");
  };

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8">
      {/* Hero */}
      <section className="pt-16 pb-16 sm:pt-24 sm:pb-24 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
        <div className="max-w-xl">
          <p className="eyebrow">A link in bio, made with some care.</p>

          <h1 className="mt-4 font-display text-[2.9rem] font-medium leading-[1.06] tracking-[-0.015em] sm:text-[3.9rem]">
            One link, and
            <br />
            everything behind it.
          </h1>

          <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-muted">
            Claim <span className="text-ink">wsio.lol/yourname</span>, add the
            links you&apos;d otherwise send one by one, and drag them into the
            order you want. Pick a theme, watch what gets opened. That is the
            whole thing.
          </p>

          <form
            onSubmit={claim}
            className="mt-8 flex max-w-md items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-control-border)] bg-surface p-1.5 pl-3.5 focus-within:border-ink"
          >
            <span className="text-sm text-faint">wsio.lol/</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="yourname"
              maxLength={32}
              className="h-9 flex-1 bg-transparent text-[0.95rem] text-ink outline-none focus-visible:outline-none placeholder:text-faint"
            />
            <Button type="submit" className="shrink-0">
              Claim
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-3 text-sm text-faint">
            {isAuthenticated
              ? "You're signed in — open your dashboard to edit your page."
              : "Free. No plans to compare, no trial clock, no trackers."}
          </p>
        </div>

        {/* Sample page */}
        <div className="mt-14 lg:mt-0">
          <figure className="mx-auto max-w-[20rem]">
            <div className="rounded-[var(--radius-md)] border border-line-strong bg-surface p-6">
              <div className="flex items-center gap-1.5 text-[0.8rem] text-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
                wsio.lol/rue
              </div>
              <div className="mt-6 flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-raised font-display text-lg text-faint">
                  R
                </div>
                <p className="mt-3 font-display text-[1.15rem]">Rue Sandoval</p>
                <p className="text-sm text-faint">@rue</p>
              </div>
              <div className="mt-5 space-y-2">
                {sampleLinks.map((l) => (
                  <div
                    key={l}
                    className="flex items-center gap-3 rounded-[var(--radius-sm)] border border-line bg-surface px-3.5 py-3 text-[0.9rem]"
                  >
                    <span className="flex-1 truncate text-center">{l}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-faint opacity-40" />
                  </div>
                ))}
              </div>
            </div>
            <figcaption className="mt-3 text-center text-xs text-faint">
              A page takes about a minute to make.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Statement */}
      <section className="border-t border-line py-16 sm:py-20">
        <p className="max-w-2xl font-display text-[1.5rem] font-normal leading-[1.4] tracking-[-0.005em] sm:text-[1.85rem]">
          Most link-in-bio tools want to grow into a marketing platform. This one
          wants to stay a <em className="text-accent not-italic">list</em> — one
          that loads fast, reads cleanly, and looks like you meant it.
        </p>
      </section>

      {/* What you get */}
      <section className="border-t border-line py-16 sm:py-20">
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-3">
          {points.map((p, i) => (
            <div key={p.title}>
              <span className="index-num text-2xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-[1.3rem] font-medium leading-snug">
                {p.title}
              </h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
                {p.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-12 max-w-xl text-[0.95rem] leading-relaxed text-faint">
          Four themes to choose from — minimal, midnight, paper, sunset. Show
          your live Discord status, if that&apos;s your thing.
        </p>
      </section>

      {/* Questions */}
      <section className="border-t border-line py-16 sm:py-20">
        <div className="grid gap-10 sm:grid-cols-[14rem_1fr]">
          <h2 className="font-display text-[1.6rem] font-medium tracking-tight">
            Questions,
            <br className="hidden sm:block" /> answered plainly
          </h2>
          <dl className="divide-y divide-line border-y border-line">
            {faqs.map((item) => (
              <div key={item.q} className="py-5">
                <dt className="font-display text-[1.1rem] font-medium">
                  {item.q}
                </dt>
                <dd className="mt-1.5 max-w-xl text-[0.95rem] leading-relaxed text-muted">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Close */}
      <section className="border-t border-line py-16 sm:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="font-display text-[1.6rem] font-medium tracking-tight">
            Ready when you are.
          </p>
          <Link
            href={isAuthenticated ? "/dashboard" : "/register"}
            className="group inline-flex items-center gap-1.5 text-[0.95rem] text-accent underline decoration-[var(--color-accent)]/35 underline-offset-4 transition-[text-decoration-color] hover:decoration-[var(--color-accent)]"
          >
            {isAuthenticated ? "Open your dashboard" : "Claim your page"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
