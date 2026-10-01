import { ScrollTrigger, SplitText, ensureGsapRegistered, gsap } from "./gsap";

/**
 * Masked line reveal, per `Masked Text Reveal SplitText.pdf`'s advanced
 * implementation.
 *
 * Contract, straight from the PDF:
 *   select `[data-split="heading"]`
 *   read `data-split-reveal`, default "lines"
 *   split only what the mode needs — lines / lines+words / lines+words+chars
 *   `mask: "lines"`, `autoSplit: true`
 *   animate from `yPercent: 110`, `ease: "expo.out"`
 *   ScrollTrigger `start: "clamp(top 80%)"`, `once: true`
 *   CREATE AND RETURN THE TWEEN INSIDE `onSplit`
 *
 * That last point is the load-bearing one. SplitText stores the returned
 * animation (`this._data.anim`) and reverts/kills it before re-splitting,
 * which is what stops resize from stacking tweens and ScrollTriggers. It
 * also restores playback position across a re-split via `animTime`
 * (`onSplitResult.totalTime(animTime)`), so progress survives on its own.
 */

const SPLIT_CONFIG = {
  lines: { duration: 0.8, stagger: 0.08 },
  words: { duration: 0.6, stagger: 0.06 },
  chars: { duration: 0.4, stagger: 0.01 },
} as const;

type Mode = keyof typeof SPLIT_CONFIG;

/** Marks a heading whose reveal has finished, so a re-split never replays it. */
const REVEALED_ATTR = "data-split-revealed";

/** Injected by the inline pre-paint script; dropped once we take over. */
const PENDING_STYLE_ID = "split-pending";

function modeOf(el: HTMLElement): Mode {
  const raw = el.dataset.splitReveal;
  return raw === "words" || raw === "chars" ? raw : "lines";
}

function typesFor(mode: Mode): string {
  // Split the minimum the mode actually needs — splitting a heading all
  // the way to characters when only lines animate creates a DOM node per
  // glyph for nothing.
  if (mode === "lines") return "lines";
  if (mode === "words") return "lines, words";
  return "lines, words, chars";
}

export function clearSplitPending() {
  document.getElementById(PENDING_STYLE_ID)?.remove();
}

/**
 * Splits and wires every eligible heading under `scope`. Returns a
 * teardown that reverts the split DOM and kills the owned animations.
 */
export function initSplitReveal(scope: ParentNode = document): () => void {
  ensureGsapRegistered();

  const instances: SplitText[] = [];
  const headings = Array.from(scope.querySelectorAll<HTMLElement>('[data-split="heading"]'));

  for (const heading of headings) {
    // SplitText's `aria: "auto"` default puts `aria-hidden="true"` on every
    // generated wrapper and an `aria-label` on the element itself, which
    // gives exactly one readable representation — but it also flattens any
    // nested interactive content out of the accessibility tree. A heading
    // containing a link is therefore left alone entirely rather than
    // silently losing that link's semantics.
    if (heading.querySelector("a, button, [role='link'], [role='button']")) continue;

    const mode = modeOf(heading);
    const config = SPLIT_CONFIG[mode];

    // A heading inside a sticky card is a poor trigger: once it sticks,
    // its viewport position stops tracking the scroll. Where a wrapper
    // opts in with `data-split-trigger` (the stack's own story wrappers),
    // that wrapper drives the ScrollTrigger instead, which keeps the
    // intended `top 80%` entrance without touching any layout.
    const trigger = heading.closest<HTMLElement>("[data-split-trigger]") ?? heading;

    const instance = SplitText.create(heading, {
      type: typesFor(mode),
      mask: "lines",
      autoSplit: true,
      linesClass: "split-line",
      wordsClass: "split-word",
      charsClass: "split-char",
      onSplit(self) {
        // `mask: "lines"` applies `overflow: clip` to each line wrapper.
        // That is required while a line is travelling, and wrong once it
        // has arrived: at the display sizes used here the serif descenders
        // in a line like "See what is slowing you down." sit below the
        // line box and get sheared off. Releasing the clip on completion
        // keeps the mask effect during the reveal and a clean glyph after.
        const unclip = () => {
          for (const mask of self.masks) (mask as HTMLElement).style.overflow = "visible";
        };

        heading.style.visibility = "";

        // Already revealed — a resize or font swap forced a re-split, not
        // a new entrance. Return no animation, so the fresh lines render
        // at their natural position: visible, unclipped, not replayed.
        if (heading.hasAttribute(REVEALED_ATTR)) {
          unclip();
          return;
        }

        // A heading that is ALREADY past the `top 80%` line when we split
        // plays straight away, with no ScrollTrigger attached.
        //
        // This is not a shortcut — it fixes a real failure. `clamp()`
        // pins the start of an above-the-fold heading to scroll position
        // 0, and the page loads at scroll 0, so the trigger sits exactly
        // on its own start line and never receives the *crossing* event
        // it needs to fire. Measured: the hero's trigger reported
        // `start: 0, progress: 0, paused: true` at `scrollY: 0`, and its
        // headline stayed parked behind its mask until the first scroll.
        // The threshold below is the same 80% the trigger would have
        // used, so the entrance position is unchanged either way.
        const rect = trigger.getBoundingClientRect();
        const alreadyPastStart = rect.top < window.innerHeight * 0.8;

        return gsap.from(self[mode], {
          yPercent: 110,
          duration: config.duration,
          stagger: config.stagger,
          ease: "expo.out",
          ...(alreadyPastStart
            ? {}
            : {
                scrollTrigger: {
                  trigger,
                  // `clamp()` keeps the start from resolving above the top
                  // of the document, so the reveal always runs from 0
                  // rather than starting part-way through.
                  start: "clamp(top 80%)",
                  once: true,
                },
              }),
          onComplete() {
            heading.setAttribute(REVEALED_ATTR, "");
            unclip();
          },
        });
      },
    });

    instances.push(instance);
  }

  // These ScrollTriggers are created late — after `document.fonts.ready`
  // resolves — so they miss the refresh that runs during initial page
  // setup. Without this, a heading that is ALREADY past its start point
  // (the hero, which sits above the `top 80%` line on first paint) stays
  // parked at `yPercent: 110` behind its mask until something else
  // happens to trigger a ScrollTrigger update. Observed directly: the
  // hero's lines sat at y=65 at scroll 0 and only snapped in once the
  // page was scrolled. Refreshing here makes every trigger evaluate
  // against the real scroll position immediately.
  // Deferred by two frames rather than called synchronously. Splitting
  // rewrites each heading's inner DOM, and `autoSplit` watches for the
  // resulting size change — a refresh fired in the same tick raced that
  // observer, which re-split and replaced the tween (and its trigger)
  // immediately afterwards, leaving the new trigger unevaluated. Waiting
  // for layout to settle first means the refresh applies to the triggers
  // that actually survive.
  let frame = 0;
  if (instances.length) {
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  }

  return () => {
    if (frame) cancelAnimationFrame(frame);
    for (const instance of instances) instance.revert();
    instances.length = 0;
  };
}
