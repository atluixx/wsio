import type { Metadata } from "next";
import { DashboardClient } from "@/components/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Edit your link-in-bio page, manage links, and track views and clicks.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://wsio.lol/dashboard" },
};

export default function DashboardPage() {
  return <DashboardClient />;
}
