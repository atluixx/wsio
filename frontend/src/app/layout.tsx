import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { ToastProvider } from "@/components/Toast";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://wsio.lol"),
  title: {
    default: "wsio. — Precision URL Infrastructure & Link Intelligence",
    template: "%s | wsio.",
  },
  description: "Ultra-fast edge redirection engine with real-time analytics, custom brand subdomains, and developer APIs.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://wsio.lol",
  },
  openGraph: {
    title: "wsio. — Precision URL Infrastructure & Link Intelligence",
    description: "Ultra-fast edge redirection engine with real-time analytics, custom brand subdomains, and developer APIs.",
    url: "https://wsio.lol",
    siteName: "wsio.",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "wsio. — Precision URL Infrastructure & Link Intelligence",
    description: "Ultra-fast edge redirection engine with real-time analytics, custom brand subdomains, and developer APIs.",
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
      className={`${jakarta.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.wsio.lol" />
      </head>
      <body className="flex min-h-full flex-col bg-[#070709] text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-300 grid-bg font-sans">
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

