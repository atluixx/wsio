import React from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
  priority?: boolean;
}

/**
 * Previously a fade-and-rise-on-scroll wrapper. The redesign favours content
 * that is simply present, so this is now a plain layout passthrough kept only
 * so existing call sites don't need to change.
 */
export function ScrollReveal({ children, className }: ScrollRevealProps) {
  if (!className) return <>{children}</>;
  return <div className={className}>{children}</div>;
}
