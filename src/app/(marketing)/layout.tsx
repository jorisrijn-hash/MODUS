import { Navigation } from "@/components/sections/Navigation";
import { Chatbot } from "@/components/chatbot/Chatbot";
import { LanguagePrompt } from "@/components/language/LanguagePrompt";
import { LenisProvider } from "@/lib/motion/LenisProvider";
import { PageTransition } from "@/components/motion/PageTransition";
import { SplitRevealProvider } from "@/components/motion/SplitRevealProvider";

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
/*
 * The pre-paint "hide headings until split" script has been REMOVED.
 *
 * It was rendered inside a client component, where React never executes a
 * <script> — so it had in fact never run. Fixing its placement made it run
 * for the first time, and it immediately broke three customer-context
 * tests under parallel load by hiding `[data-split="heading"]` for up to
 * two seconds.
 *
 * That it had been inert all along is the useful evidence: the flash it
 * was meant to prevent has been present in every build and capture so far
 * and was never visible. It was buying nothing and costing a hydration
 * mismatch, a React warning and test flakiness, so it is gone rather than
 * re-fixed. SplitRevealProvider handles the reveal on its own.
 */

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LenisProvider>
        <SplitRevealProvider />
        {/*
         * The first-load intro curtain (`Loader`) was mounted here and is
         * removed at the user's request. It was a dark full-viewport panel
         * that split and opened like doors over the already-rendered page
         * on every full page load — presentational only, never tied to real
         * load state, so nothing about actual loading behaviour changes by
         * taking it out. The homepage now paints straight to the hero.
         *
         * `Loader.tsx` is left on disk, unmounted, matching how the retired
         * fluid field was handled; commit history holds it either way.
         */}
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
    </>
  );
}
