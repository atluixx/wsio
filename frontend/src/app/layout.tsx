import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://wsio.lol"),
  title: {
    default: "wsio. — Modern URL Shortener & Link Analytics",
    template: "%s | wsio.",
  },
  description: "Fast, reliable, and human-centric URL redirection engine for creators, teams, and developers.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://wsio.lol",
  },
  openGraph: {
    title: "wsio. — Modern URL Shortener & Link Analytics",
    description: "Fast, reliable, and human-centric URL redirection engine for creators, teams, and developers.",
    url: "https://wsio.lol",
    siteName: "wsio.",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "wsio. — Modern URL Shortener & Link Analytics",
    description: "Fast, reliable, and human-centric URL redirection engine for creators, teams, and developers.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased dark`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.wsio.lol" />
      </head>
      <body className="flex min-h-full flex-col bg-[#050507] text-zinc-100 selection:bg-white/15 selection:text-white saas-bg-glow font-sans">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieBanner />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
