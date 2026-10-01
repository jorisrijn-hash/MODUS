import { Navigation } from "@/components/sections/Navigation";
import { Chatbot } from "@/components/chatbot/Chatbot";
import { Loader } from "@/components/Loader";
import { LanguagePrompt } from "@/components/language/LanguagePrompt";
import { LenisProvider } from "@/lib/motion/LenisProvider";
import { MarketingFluidField } from "@/components/motion/MarketingFluidField";
import { PageTransition } from "@/components/motion/PageTransition";

/**
 * The marketing shell — Checkpoint 3. Every public marketing route lives
 * under this route group (URLs unchanged: `(marketing)/page.tsx` still
 * resolves to `/`, not `/marketing`, per Next's route-group convention).
 *
 * This is also the fix for the pre-existing overlay leak Checkpoint 0's
 * audit found: Chatbot/LanguagePrompt/Loader used to mount at root and
 * only excluded `/private` by a pathname check, which meant they could
 * (and did) render on top of `/app` too. Mounting them here instead makes
 * that structurally impossible — `/app` and `/private` are outside this
 * route group entirely, so there's no pathname check left to forget.
 *
 * `ConsentBanner` deliberately stays at the true root
 * (`src/app/layout.tsx`) — it's the one overlay that's legitimately
 * global, not marketing-only, since the cookies it governs consent for
 * are set site-wide including on `/app`. See that file's own comment.
 *
 * Marketing-only motion (Lenis, GSAP orchestration, the WebGL fluid
 * field) also mounts here, not at root — see the fluid field further
 * down and MODUS_REDESIGN_REPORT.md's Checkpoint 3 entry for the
 * provider-boundary architecture this enforces.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <Loader />
      <MarketingFluidField />
      <Navigation />
      <PageTransition>{children}</PageTransition>
      <Chatbot />
      <LanguagePrompt />
    </LenisProvider>
  );
}
