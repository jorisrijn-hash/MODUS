import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession, isAuthenticated } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "MODUS Private",
  robots: { index: false, follow: false },
};

export default async function PrivateAppLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAuthenticated())) redirect("/private/login");
  const session = await getSession();

  return <AdminShell username={session.username ?? "Admin"}>{children}</AdminShell>;
}
