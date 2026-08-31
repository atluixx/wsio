import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid-bg flex min-h-screen flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
