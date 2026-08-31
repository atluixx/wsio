import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.08] bg-[#09090b] text-zinc-500 font-sans text-xs">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white font-bold">
          <span>wsio<span className="text-zinc-500">.</span></span>
          <span className="text-zinc-500 font-normal text-[11px] ml-2">
            &copy; {currentYear} wsio. All rights reserved.
          </span>
        </div>

        <div className="flex items-center gap-5 text-zinc-400">
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}


