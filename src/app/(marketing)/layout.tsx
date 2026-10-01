import { Navigation } from "@/components/sections/Navigation";
import { Chatbot } from "@/components/chatbot/Chatbot";
import { Loader } from "@/components/Loader";
import { LanguagePrompt } from "@/components/language/LanguagePrompt";
import { LenisProvider } from "@/lib/motion/LenisProvider";
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
      {/*
       * `MarketingFluidField` was mounted here. It is gone, not disabled.
       *
       * The Antimetal rebuild mandate lists "fluid/blob backgrounds and
       * decorative effects" as replaceable presentation, specifies the
       * hero point cloud in their place, and says explicitly not to add
       * competing effects — a site-wide ambient fluid wash behind a scene
       * whose whole job is to be the one focal object is exactly such a
       * competition.
       *
       * This retires `fluidSimGL.ts` (a real Stable-Fluids simulation
       * built in the previous checkpoint and still awaiting review). The
       * user confirmed the replacement explicitly. The files stay on disk
       * as dead code rather than being deleted, and the pre-rebuild state
       * is recoverable from commit 643cfad. See
       * MODUS_VISUAL_RESET_AUDIT.md.
       */}
      <Navigation />
      <PageTransition>{children}</PageTransition>
      <Chatbot />
      <LanguagePrompt />
    </LenisProvider>
  );
}
