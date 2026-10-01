import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth/session";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "MODUS Private Access",
  robots: { index: false, follow: false },
};

export default async function PrivateLoginPage() {
  if (await isAuthenticated()) redirect("/private");
  return <LoginForm />;
}
