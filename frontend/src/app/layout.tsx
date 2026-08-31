import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://wsio.lol";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "wsio — your links, one page",
    template: "%s · wsio",
  },
  description:
    "A calm, fast link-in-bio page. Put every link you share in one place, arrange it with a drag, and see what gets clicked.",
  robots: { index: true, follow: true },
  alternates: { canonical: APP_URL },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  openGraph: {
    title: "wsio — your links, one page",
    description:
      "A calm, fast link-in-bio page. Put every link you share in one place.",
    url: APP_URL,
    siteName: "wsio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "wsio — your links, one page",
    description: "A calm, fast link-in-bio page with honest click analytics.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable}`}>
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
