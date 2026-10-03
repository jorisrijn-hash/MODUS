import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/components/auth/clerkAppearance";

export const metadata = {
  title: "Sign in — MODUS",
  robots: { index: false, follow: false },
};

// The shell, heading and footer live in the shared `(auth)` layout so
// they survive the move to /sign-up. This route contributes only the
// form.
export default function SignInPage() {
  return <SignIn appearance={clerkAppearance} signUpUrl="/sign-up" />;
}
