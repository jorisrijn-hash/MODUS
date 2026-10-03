import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { clerkAppearance } from "@/components/auth/clerkAppearance";

export const metadata = {
  title: "Sign in — MODUS",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <AuthScreen
      title="Sign in to MODUS."
      subtitle="Your diagnostic, your profile, and anything MODUS is building with you."
      footer={
        <>
          New here?{" "}
          <Link href="/sign-up" className="text-modus underline underline-offset-4 hover:text-modus-light">
            Create an account
          </Link>
          . You can also{" "}
          <Link href="/diagnostic" className="text-modus underline underline-offset-4 hover:text-modus-light">
            run a diagnostic as a guest
          </Link>
          .
        </>
      }
    >
      <SignIn appearance={clerkAppearance} />
    </AuthScreen>
  );
}
