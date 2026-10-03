import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/components/auth/clerkAppearance";

export const metadata = {
  title: "Create an account — MODUS",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return <SignUp appearance={clerkAppearance} signInUrl="/sign-in" />;
}
