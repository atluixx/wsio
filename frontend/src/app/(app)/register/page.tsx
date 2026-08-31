import type { Metadata } from "next";
import { RegisterClient } from "@/components/RegisterClient";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Sign up for free and claim your wsio link-in-bio page.",
  alternates: { canonical: "https://wsio.lol/register" },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
