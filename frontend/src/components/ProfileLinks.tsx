"use client";

import { ArrowUpRight } from "lucide-react";
import type { PublicProfileLink } from "@/lib/api";
import { recordClick } from "@/lib/api";
import { linkIcon } from "@/lib/linkIcons";

export function ProfileLinks({ links }: { links: PublicProfileLink[] }) {
  if (links.length === 0) {
    return (
      <p className="mt-9 text-center text-[0.95rem]" style={{ color: "var(--p-muted)" }}>
        No links yet.
      </p>
    );
  }

  return (
    <div className="mt-9 flex w-full flex-col gap-3">
      {links.map((link) => {
        const Icon = linkIcon(link.icon);
        const track = () => recordClick(link.id);
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={track}
            onAuxClick={track}
            className="group flex items-center gap-3.5 px-4 py-4 text-[0.95rem] font-medium transition-transform duration-150 hover:-translate-y-0.5"
            style={{
              background: "var(--p-card)",
              border: "1px solid var(--p-border)",
              borderRadius: "var(--p-radius)",
              boxShadow: "var(--p-shadow)",
            }}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span className="flex-1 truncate text-center">{link.label}</span>
            <ArrowUpRight className="h-4 w-4 shrink-0 opacity-30 transition-opacity group-hover:opacity-70" />
          </a>
        );
      })}
    </div>
  );
}
