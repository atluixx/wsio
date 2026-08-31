import type { Metadata } from "next";
import { LoginClient } from "@/components/LoginClient";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to edit your wsio link-in-bio page.",
  alternates: { canonical: "https://wsio.lol/login" },
};

export default function LoginPage() {
  return <LoginClient />;
}
