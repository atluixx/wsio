import React from "react";

interface FauxWindowProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function FauxWindow({ title = "wsio-terminal-v1.0", children, className = "" }: FauxWindowProps) {
  return (
    <div className={`overflow-hidden rounded-xl border border-white/10 bg-zinc-950/90 shadow-2xl backdrop-blur-md ${className}`}>
      {/* Top Bar Window Chrome */}
      <div className="flex items-center justify-between border-b border-white/10 bg-zinc-900/90 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-zinc-700/80" />
          <span className="h-3 w-3 rounded-full bg-zinc-700/80" />
          <span className="h-3 w-3 rounded-full bg-zinc-700/80" />
        </div>
        <div className="font-mono text-[11px] text-zinc-500 tracking-tight">
          {title}
        </div>
        <div className="w-12" /> {/* Spacer for centering title */}
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-6 font-mono text-xs text-zinc-300">
        {children}
      </div>
    </div>
  );
}
