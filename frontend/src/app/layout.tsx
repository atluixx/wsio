import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://wsio.lol";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "wsio. — One link for everything you do",
    template: "%s | wsio.",
  },
  description:
    "Build a clean, fast link-in-bio page. One link for your socials, work, and everything you share — with click analytics.",
  robots: { index: true, follow: true },
  alternates: { canonical: APP_URL },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  openGraph: {
    title: "wsio. — One link for everything you do",
    description:
      "Build a clean, fast link-in-bio page. One link for your socials, work, and everything you share.",
    url: APP_URL,
    siteName: "wsio.",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "wsio. — One link for everything you do",
    description: "Build a clean, fast link-in-bio page with click analytics.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      <body className="min-h-full bg-[#070709] text-zinc-100 font-sans antialiased">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
