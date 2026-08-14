import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "wsio. | Minimalist Link Engine",
  description: "High-performance minimalist URL shortener and redirect engine.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="flex min-h-full flex-col bg-zinc-950 text-zinc-100 selection:bg-zinc-800 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 bg-grid-pattern">{children}</main>
          <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center">
            <div className="mx-auto max-w-6xl px-4 font-mono text-xs text-zinc-600">
              wsio. &copy; {new Date().getFullYear()} &mdash; Minimalist Monochrome Architecture.
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
