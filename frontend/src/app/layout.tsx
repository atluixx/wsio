import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://wsio.lol";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "wsio — one link, everything behind it",
    template: "%s · wsio",
  },
  description:
    "A link-in-bio page made with some care. One address for every link you share, arranged by hand, with a plain count of what gets opened.",
  robots: { index: true, follow: true },
  alternates: { canonical: APP_URL },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  openGraph: {
    title: "wsio — one link, everything behind it",
    description:
      "A link-in-bio page made with some care. One address for every link you share, arranged by hand.",
    url: APP_URL,
    siteName: "wsio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "wsio — one link, everything behind it",
    description: "A link-in-bio page made with some care, with a plain count of what gets opened.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://api.wsio.lol" />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
