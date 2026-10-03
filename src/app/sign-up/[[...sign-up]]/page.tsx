import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { clerkAppearance } from "@/components/auth/clerkAppearance";

export const metadata = {
  title: "Create an account — MODUS",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <AuthScreen
      title="Create your MODUS account."
      subtitle="An account saves your diagnostic and lets you pick it up again. It grants nothing else on its own."
      footer={
        <>
          Already have one?{" "}
          <Link href="/sign-in" className="text-modus underline underline-offset-4 hover:text-modus-light">
            Sign in
          </Link>
          .
        </>
      }
    >
      <SignUp appearance={clerkAppearance} />
    </AuthScreen>
  );
}
